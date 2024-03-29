import { Camera, Renderer } from "./systems/globals";
import { Vector } from "./vector";
import { Player } from "./player";
import { BoundingBox, Vector2d } from "./types";
import { easeInOut } from "./utils";
import { Sprite } from "./sprite";
import { Character } from "./entities-base/character";

export class Entity {
  _id: string;
  tag?: string;
  type?: string;
  _world_position: Vector;
  _local_position: Vector;
  _rotation = 0;
  _inherited_rotation = 0;
  interactable_distance = 1;
  in_interactable_range = false;
  width: number;
  height: number;
  parent: Entity | undefined;
  _prev_parent_pos: Vector2d = { x: 0, y: 0 };
  children: Entity[] = [];
  _bounding_box: BoundingBox;
  _set_bounding_box: BoundingBox;
  custom_bounding_box = false;
  sprites?: Sprite[];
  animation: number;
  _animation_frame: number;
  is_static: boolean;
  _is_interactable: boolean;
  collision_overlap = false;
  collision_physics = false;
  interacting = false;
  interactions: Array<(ent?: Character) => void> = [];
  debug: boolean;
  max_speed = 4;
  deceleration = 1;
  acceleration = 0;
  distance_to_player = 0;
  velocity: Vector;
  rendering = true;
  render_interactable_bubble = false;
  moveTo_vector: Vector | Vector2d | undefined;
  moveTo_time = 60;
  _moveTo_progress = 1;
  moveTo_finished = false;
  easing: "linear" | "ease-in-out" | undefined;
  static entities: Entity[] = [];

  static updateAll(delta_time: number) {
    for (const entity of Entity.entities) {
      entity.physicsUpdate(delta_time);
      entity.interactableUpdate(delta_time);
      entity.update(delta_time);
    }
  }

  static renderAll() {
    for (const entity of Entity.entities) {
      entity._renderSprites();
      if (entity.debug) entity._renderDebug();
    }
  }

  static initAll() {
    for (const entity of Entity.entities) {
      entity._defaultInit();
      entity.init();
    }
  }

  static getEntity(id: string) {
    for (const entity of Entity.entities) {
      if (entity._id === id) return entity;
    }
    return undefined;
  }

  constructor(
    id: string,
    x: number,
    y: number,
    width: number,
    height: number,
    sprite_src?: string
  ) {
    let count = 0;
    for (const e of Entity.entities) {
      if (typeof e._id !== "string") continue;
      if (e._id.startsWith(id)) count += 1;
    }
    if (count > 0) id = `${id}_${count}`;
    this._id = id;
    this._world_position = new Vector(x, y);
    this._local_position = new Vector(0, 0);
    this.width = width;
    this.height = height;
    if (sprite_src)
      this.addSprite(
        new Sprite(
          sprite_src,
          width * Renderer.tile_size,
          height * Renderer.tile_size
        )
      );
    this.is_static = true;
    this._is_interactable = false;
    this.debug = false;
    this.animation = 0;
    this._animation_frame = 0;
    this.velocity = new Vector(0, 0, {
      x: this.max_speed,
      y: this.max_speed,
    });
    this._bounding_box = {
      width: width,
      height: height,
      x_offset: 0,
      y_offset: 0,
    };
    this._set_bounding_box = { ...this._bounding_box };
    Entity.entities.push(this);
  }

  get id() {
    return this._id;
  }

  set id(id: string) {
    this._id = id;
  }

  get world_position() {
    return this._world_position;
  }

  get local_position() {
    if (!this.parent) {
      return this._world_position;
    } else {
      return this._local_position;
    }
  }

  get world_rotation() {
    return this._rotation + this._inherited_rotation;
  }

  get local_rotation() {
    return this._rotation;
  }

  get bounding_box() {
    return this._bounding_box;
  }

  get forward_vector() {
    return {
      x: Math.cos((this.world_rotation + 90) * (Math.PI / 180)),
      y: Math.sin((this.world_rotation + 90) * (Math.PI / 180)),
    };
  }

  set is_interactable(bool: boolean) {
    if (bool === true) {
      this._is_interactable = true;
    } else {
      this._is_interactable = false;
      this.in_interactable_range = false;
      Player.interactable_entities_in_range.forEach((ent, i) => {
        if (ent === this) {
          Player.interactable_entities_in_range.splice(i, 1);
        }
      });
    }
  }

  get is_interactable() {
    return this._is_interactable;
  }

  addSprite(sprite: Sprite) {
    if (this.sprites === undefined) this.sprites = [];
    this.sprites.push(sprite);
  }


  setSize(width: number, height: number) {
    this.width = width;
    this.height = height;
    if (!this.custom_bounding_box) {
      this._bounding_box = {
        width: width,
        height: height,
        x_offset: 0,
        y_offset: 0,
      };
    }
  }

  setRotation(rotation: number) {
    this._rotation = rotation;
    this._setRelativeBoundingBox();
    this.setSpriteRotations();
    if(this.children.length > 0) {
      for(const child of this.children) {
        child._inherited_rotation = rotation;
        child.setSpriteRotations();
        child._setRelativeWorldPosition();
        child._setRelativeBoundingBox();
      }
    }
  }

  setWorldRotation(rotation: number) {
    this.setRotation(
      this._inherited_rotation + (rotation - this._inherited_rotation)
    );
    if(this.children.length > 0) {
      for(const child of this.children) {
        child._inherited_rotation = rotation;
        child._setRelativeWorldPosition();
        child._setRelativeBoundingBox();
      }
    }
  }

  setWorldPosition(position: Vector | Vector2d) {
    this._world_position.x = position.x;
    this._world_position.y = position.y;
    if(this.children.length > 0) {
      for(const child of this.children) {
        child._setRelativeWorldPosition();
      }
    }
    // if (this.parent !== undefined) {
    //   this._local_position.x =
    //     this.world_position.x - this.parent.world_position.x;
    //   this._local_position.y =
    //     this.world_position.y - this.parent.world_position.y;
    // }
  }

  setLocalPosition(position: Vector | Vector2d) {
    if (!this.parent) {
      this.setWorldPosition({
        x: position.x + this.world_position.x,
        y: position.y + this.world_position.y,
      });
      return;
    }
    this._local_position.x = position.x;
    this._local_position.y = position.y;
    this._setRelativeWorldPosition();
    if(this.children.length > 0) {
      for(const child of this.children) {
        child._setRelativeWorldPosition();
      }
    }
  }

  _setRelativeWorldPosition() {
    if (!this.parent) return;
    const aCos = Math.cos(this._inherited_rotation * (Math.PI / 180));
    const aSin = Math.sin(this._inherited_rotation * (Math.PI / 180));
    this.setWorldPosition({
      x:
        (this._local_position.x + this.width / 2 - this.parent.width / 2) *
          aCos -
        (this._local_position.y + this.height / 2 - this.parent.height / 2) *
          aSin +
        this.parent.world_position.x -
        this.width / 2 +
        this.parent.width / 2,
      y:
        (this._local_position.y + this.height / 2 - this.parent.height / 2) *
          aCos +
        (this._local_position.x + this.width / 2 - this.parent.width / 2) *
          aSin +
        this.parent.world_position.y -
        this.height / 2 +
        this.parent.height / 2,
    });
  }

  _setRelativeLocalPosition() {
    if (!this.parent) return;
    console.log(this._inherited_rotation);
    const aCos = Math.cos(-this._inherited_rotation * (Math.PI / 180));
    const aSin = Math.sin(-this._inherited_rotation * (Math.PI / 180));
    this._local_position.x =
      (this.world_position.x -
        this.parent.world_position.x +
        this.width / 2 -
        this.parent.width / 2) *
        aCos -
      (this.world_position.y -
        this.parent.world_position.y +
        this.height / 2 -
        this.parent.height / 2) *
        aSin -
      this.width / 2 +
      this.parent.width / 2;
    this._local_position.y =
      (this.world_position.y -
        this.parent.world_position.y +
        this.height / 2 -
        this.parent.height / 2) *
        aCos +
      (this.world_position.x -
        this.parent.world_position.x +
        this.width / 2 -
        this.parent.width / 2) *
        aSin -
      this.height / 2 +
      this.parent.height / 2;
  }

  _setRelativeBoundingBox() {
    const aCos = Math.cos(this.world_rotation * (Math.PI / 180));
    const aSin = Math.sin(this.world_rotation * (Math.PI / 180));
    const centerX = this.width / 2;
    const centerY = this.height / 2;

    const x1 =
      (this._set_bounding_box.x_offset - centerX) * aCos -
      (this._set_bounding_box.y_offset - centerY) * aSin;
    const x2 =
      (this._set_bounding_box.x_offset +
        this._set_bounding_box.width -
        centerX) *
        aCos -
      (this._set_bounding_box.y_offset - centerY) * aSin;
    const x3 =
      (this._set_bounding_box.x_offset - centerX) * aCos -
      (this._set_bounding_box.y_offset +
        this._set_bounding_box.height -
        centerY) *
        aSin;
    const x4 =
      (this._set_bounding_box.x_offset +
        this._set_bounding_box.width -
        centerX) *
        aCos -
      (this._set_bounding_box.y_offset +
        this._set_bounding_box.height -
        centerY) *
        aSin;

    const y1 =
      (this._set_bounding_box.y_offset - centerY) * aCos +
      (this._set_bounding_box.x_offset - centerX) * aSin;
    const y2 =
      (this._set_bounding_box.y_offset - centerY) * aCos +
      (this._set_bounding_box.x_offset +
        this._set_bounding_box.width -
        centerX) *
        aSin;
    const y3 =
      (this._set_bounding_box.y_offset +
        this._set_bounding_box.height -
        centerY) *
        aCos +
      (this._set_bounding_box.x_offset - centerX) * aSin;
    const y4 =
      (this._set_bounding_box.y_offset +
        this._set_bounding_box.height -
        centerY) *
        aCos +
      (this._set_bounding_box.x_offset +
        this._set_bounding_box.width -
        centerX) *
        aSin;

    const minX = Math.min(x1, x2, x3, x4);
    const maxX = Math.max(x1, x2, x3, x4);
    const minY = Math.min(y1, y2, y3, y4);
    const maxY = Math.max(y1, y2, y3, y4);

    this._bounding_box.x_offset = minX + centerX;
    this._bounding_box.y_offset = minY + centerY;
    this._bounding_box.width = maxX - minX;
    this._bounding_box.height = maxY - minY;
  }

  setSpriteRotations() {
    if (!this.sprites) return;
    for (const sprite of this.sprites) {
      if(!sprite.lock_rotation){
        sprite.rotation = this.world_rotation;
      }
    }
  }

  setBoundingBox(
    width: number,
    height: number,
    x_offset: number,
    y_offset: number
  ) {
    this._set_bounding_box = {
      width: width,
      height: height,
      x_offset: x_offset,
      y_offset: y_offset,
    };
    this.custom_bounding_box = true;
    this._setRelativeBoundingBox();
  }

  setParent(parent: Entity, _bubbled = false) {
    this.parent = parent;
    this._inherited_rotation = parent.world_rotation;
    this._rotation = this._rotation - this._inherited_rotation;
    this._prev_parent_pos.x = parent.world_position.x;
    this._prev_parent_pos.y = parent.world_position.y;
    this.setSpriteRotations();
    this._setRelativeLocalPosition();
    if (!_bubbled) parent.addChild(this, true);
  }

  removeChild(child: Entity, _bubbled = false) {
    const index = this.children.indexOf(child);
    if (index === -1) {
      console.log(this, "has no child", child);
      return;
    }
    if (!_bubbled) this.children[index].unlink(true);
    this.children.splice(index, 1);
  }

  addChild(child: Entity, _bubbled = false) {
    this.children.push(child);
    if (!_bubbled) child.setParent(this, true);
  }

  unlink(_bubbled = false) {
    if (!this.parent) {
      console.log(this, "has no parent");
      return;
    }
    if (!_bubbled) this.parent.removeChild(this, true);
    this._local_position.x = 0;
    this._local_position.y = 0;
    this._rotation = this._rotation + this._inherited_rotation;
    this._inherited_rotation = 0;
    this.parent = undefined;
  }

  _defaultInit() {}

  physicsUpdate(delta_time: number) {
    if (this.is_static) return;
    this.velocity.addTo(this.acceleration * delta_time);
    this.setWorldPosition(
      this.world_position.add(this.velocity.multiply(delta_time))
    );
    this.velocity.tendToZero(this.deceleration * delta_time);
  }

  interactableUpdate(delta_time: number) {
    if (!this.is_interactable) return;
    this.distance_to_player = this.world_position.distanceTo(
      Player.world_position
    );
    if (
      this.distance_to_player < this.interactable_distance &&
      !this.in_interactable_range
    ) {
      Player.interactable_entities_in_range.push(this);
      this.in_interactable_range = true;
    } else if (
      this.distance_to_player >= this.interactable_distance &&
      this.in_interactable_range
    ) {
      Player.interactable_entities_in_range.splice(
        Player.interactable_entities_in_range.indexOf(this),
        1
      );
      this.in_interactable_range = false;
    }
  }

  init() {}

  update(delta_time: number) {}

  defaultInteract() {
    this.interacting = true;
    Player.interact(this, true);
  }

  onInteract(interaction: (ent?: Character) => void) {
    interaction.bind(this);
    this.interactions.push(interaction);
  }

  interact(ent?: Character) {
    this.defaultInteract();
    this.interactions.forEach((interaction) => {
      interaction(ent);
    });
  }

  async asyncInteract() {}

  uninteract() {
    this.interacting = false;
  }

  _renderSprites() {
    if (!this.rendering) return;
    if (this.sprites) {
      for (const sprite of this.sprites) {
        Renderer.renderSprite(
          this.world_position.x,
          this.world_position.y,
          this.width,
          this.height,
          sprite,
          sprite.rotation
        );
      }
    }
    if (this.in_interactable_range && this.render_interactable_bubble) {
      Renderer.renderInteractableBubble({
        x: this.world_position.x + (this.width / 2 - 0.28125),
        y: this.world_position.y - 0.5625,
      });
    }
  }
  _renderDebug() {
    if (!Renderer.context || !this.rendering) return;
    Renderer.renderStrokeRect(
      this.world_position.x + this.bounding_box.x_offset,
      this.world_position.y + this.bounding_box.y_offset,
      this.bounding_box.width,
      this.bounding_box.height,
      "#ff0000"
    );
    Renderer.renderStrokeRect(
      this.world_position.x,
      this.world_position.y,
      this.width,
      this.height,
      "#00ff00"
    );
  }
}
