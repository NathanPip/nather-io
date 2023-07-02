import { Camera, Game } from "./globals";
import { Vector } from "./objects";
import { Player } from "./player";
import { BoundingBox, Vector2d } from "./types";
import { easeInOut } from "./utils";

export class Entity {
  _id: string;
  _world_position: Vector;
  _local_position: Vector;
  _rotation = 0;
  _inherited_rotation = 0;
  width: number;
  height: number;
  parent: Entity | undefined;
  _prev_parent_pos: Vector2d = { x: 0, y: 0 };
  children: Entity[] = [];
  _bounding_box: BoundingBox;
  _set_bounding_box: BoundingBox;
  custom_bounding_box = false;
  sprite_src: string | undefined;
  sprite_img: HTMLImageElement | undefined;
  sprite_loading_complete: boolean;
  animation: number;
  _animation_frame: number;
  is_static: boolean;
  is_interactable: boolean;
  collision_overlap = false;
  collision_physics = false;
  interacting = false;
  debug: boolean;
  max_speed = 0.1;
  deceleration = 0.01;
  acceleration = 0.02;
  distance_to_player = 0;
  velocity: Vector;
  render_interactable_bubble = false;
  rendering_interactable = false;
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
      entity._renderSprite();
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
    for(const e of Entity.entities) {
      if(typeof e._id !== "string") continue;
      if(e._id.startsWith(id)) count += 1;
    }
    if(count > 0) id = `${id}_${count}`;
    this._id = id;
    this._world_position = new Vector(x, y);
    this._local_position = new Vector(0, 0);
    this.width = width;
    this.height = height;
    this.sprite_src = sprite_src;
    this.is_static = true;
    this.sprite_loading_complete = false;
    this.is_interactable = false;
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
    this._set_bounding_box = this._bounding_box;
    Entity.entities.push(this);
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

  setRotation(rotation: number) {
    this._rotation = rotation;
    this._setRelativeBoundingBox();
  }

  setWorldRotation(rotation: number) {
    this.setRotation(
      this._inherited_rotation + (rotation - this._inherited_rotation)
    );
  }

  setWorldPosition(position: Vector | Vector2d) {
    this._world_position.x = position.x;
    this._world_position.y = position.y;
    // if (this.parent !== undefined) {
    //   this._local_position.x =
    //     this.world_position.x - this.parent.world_position.x;
    //   this._local_position.y =
    //     this.world_position.y - this.parent.world_position.y;
    // }
  }

  _setRelativeWorldPosition() {
    if (!this.parent) return;
    const aCos = Math.cos(this._inherited_rotation * (Math.PI / 180));
    const aSin = Math.sin(this._inherited_rotation * (Math.PI / 180));
    this.setWorldPosition({
      x:
        this._local_position.x * aCos -
        this._local_position.y * aSin +
        this.parent.world_position.x,
      y:
        this._local_position.y * aCos -
        this._local_position.x * aSin +
        this.parent.world_position.y,
    });
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
  }

  animate(animation: number, speed: number, limit: number) {
    if (this.animation !== animation) {
      this._animation_frame = 0;
      this.animation = animation;
    }
    if (Game.current_frame % Math.round(Game.FPS / speed) === 0) {
      if (this._animation_frame < limit) {
        this._animation_frame++;
      } else {
        this._animation_frame = 0;
      }
    }
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

  _setRelativeBoundingBox() {
    const aCos = Math.cos(this.world_rotation * (Math.PI / 180));
    const aSin = Math.sin(this.world_rotation * (Math.PI / 180));
    this._bounding_box.width = Math.abs(
      this._set_bounding_box.width * aCos - this._set_bounding_box.height * aSin
    );
    this._bounding_box.height = Math.abs(
      this._set_bounding_box.height * aCos - this._set_bounding_box.width * aSin
    );
    this._bounding_box.x_offset =
      this.width / 2 -
      this._bounding_box.width / 2 -
      (this._set_bounding_box.x_offset * aCos -
        this._set_bounding_box.y_offset * aSin);
    this._bounding_box.y_offset =
      this.height / 2 -
      this._bounding_box.height / 2 -
      (this._set_bounding_box.y_offset * aCos -
        this._set_bounding_box.x_offset * aSin);
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
    this._local_position.x = this.world_position.x - parent.world_position.x;
    this._local_position.y = this.world_position.y - parent.world_position.y;
    this._inherited_rotation = parent.world_rotation;
    this._rotation = this._rotation - this._inherited_rotation;
    this._prev_parent_pos.x = parent.world_position.x;
    this._prev_parent_pos.y = parent.world_position.y;
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

  _defaultInit() {
    if (this.sprite_src === undefined) {
      this.sprite_loading_complete = true;
      return;
    }
    this.sprite_img = new Image();
    this.sprite_img.src = this.sprite_src;
    this.sprite_img.onload = () => {
      this.sprite_loading_complete = true;
    };
  }

  moveTo(
    vector: Vector | Vector2d,
    time?: number,
    easing?: "linear" | "ease-in-out"
  ) {
    this.moveTo_finished = false;
    this.moveTo_vector = vector;
    this.moveTo_time = time || 60;
    if (easing) this.easing = easing;
  }

  move(delta_time: number) {
    if (this.moveTo_vector === undefined) return;
    console.log("moving");
    const timer_progress = this._moveTo_progress / this.moveTo_time;
    const easeProgress =
      this.easing === "linear"
        ? timer_progress
        : false || this.easing === "ease-in-out"
        ? easeInOut(timer_progress)
        : timer_progress;
    this.world_position.lerp(
      {
        x: this.moveTo_vector.x,
        y: this.moveTo_vector.y,
      },
      easeProgress
    );
    if (this._moveTo_progress < this.moveTo_time) this._moveTo_progress += delta_time;
  }

  clearMove() {
    this.moveTo_vector = undefined;
    this.moveTo_time = 60;
    this._moveTo_progress = 1;
    this.moveTo_finished = true;
  }

  physicsUpdate(delta_time: number) {
    if (this.is_static) return;
    if (this.parent) {
      if (
        this._prev_parent_pos.x !== this.parent.world_position.x ||
        this._prev_parent_pos.y !== this.parent.world_position.y
      ) {
        this._prev_parent_pos = this.parent.world_position;
        this._setRelativeWorldPosition();
        console.log("calling 1")
      }
      if (this._inherited_rotation !== this.parent.world_rotation) {
        this._inherited_rotation = this.parent.world_rotation;
        this._setRelativeWorldPosition();
        this._setRelativeBoundingBox();
        console.log("calling 2")
      }
    }
    if (this.moveTo_vector !== undefined) {
      if (this._moveTo_progress !== this.moveTo_time) {
        this.move(delta_time);
      } else {
        this.moveTo_finished = true;
      }
      return;
    } else {
      this._moveTo_progress = 1;
    }
    this.setWorldPosition(this.world_position.add(this.velocity.multiply(delta_time)));
    this.velocity.tendToZero(this.deceleration * delta_time);
  }

  interactableUpdate(delta_time: number) {
    if (!this.is_interactable) return;
    this.distance_to_player = this.world_position.distanceTo(Player.position);
    if (this.distance_to_player <  1 && !this.rendering_interactable) {
      Player.interactable_entities_in_range.push(this);
      this.rendering_interactable = true;
    } else if (this.distance_to_player > 1 && this.rendering_interactable) {
      Player.interactable_entities_in_range.splice(
        Player.interactable_entities_in_range.indexOf(this),
        1
      );
      this.rendering_interactable = false;
    }
  }

  init() {}

  update(delta_time: number) {}

  defaultInteract() {
    this.interacting = true;
  }

  interact() {}

  uninteract() {
    this.interacting = false;
  }

  _renderSprite() {
    if (!this.sprite_loading_complete) return;
    Game.renderEntity(this);
    if (this.rendering_interactable && this.render_interactable_bubble) {
      Game.renderInteractableBubble({
        x: this.world_position.x + (this.width / 2 - 0.28125),
        y: this.world_position.y - 0.5625,
      });
    }
  }
  _renderDebug() {
    if (!Game.context) return;
    Game.renderStrokeRect(
      this.world_position.x + this.bounding_box.x_offset,
      this.world_position.y + this.bounding_box.y_offset,
      this.bounding_box.width,
      this.bounding_box.height
    );
  }
}
