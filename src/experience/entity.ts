import { Camera, Game } from "./globals";
import { Vector } from "./objects";
import { Player } from "./player";
import { BoundingBox, Vector2d } from "./types";
import { easeInOut } from "./utils";

export class Entity {
  position: Vector;
  width: number;
  height: number;
  bounding_box: BoundingBox;
  custom_bounding_box = false;
  sprite_src: string | undefined;
  sprite_img: HTMLImageElement | undefined;
  loading_complete: boolean;
  animation: number;
  animation_frame: number;
  is_static: boolean;
  is_interactable: boolean;
  collision_overlap = false;
  collision_physics = false;
  interacting = false;
  debug: boolean;
  max_speed = 5;
  deceleration = 1;
  acceleration = 2;
  velocity: Vector;
  distance_to_player = 0;
  rendering_interactable = false;
  moveTo_vector: Vector | Vector2d | undefined;
  moveTo_time = 60;
  moveTo_frame = 1;
  moveTo_finished = false;
  easing: "linear" | "ease-in-out" | undefined;
  static entities: Entity[] = [];

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    sprite_src?: string
  ) {
    this.position = new Vector(x, y);
    this.width = width;
    this.height = height;
    this.sprite_src = sprite_src;
    this.is_static = true;
    this.loading_complete = false;
    this.is_interactable = false;
    this.debug = false;
    this.animation = 0;
    this.animation_frame = 0;
    this.velocity = new Vector(0, 0, {
      x: this.max_speed,
      y: this.max_speed,
    });
    this.bounding_box = {
      width: width,
      height: height,
      x_offset: 0,
      y_offset: 0,
    };
    Entity.entities.push(this);
  }

  animate(animation: number, speed: number, limit: number) {
    if (this.animation !== animation) {
      this.animation_frame = 0;
      this.animation = animation;
    }
    if (Game.current_frame % Math.round(Game.FPS / speed) === 0) {
      if (this.animation_frame < limit) {
        this.animation_frame++;
      } else {
        this.animation_frame = 0;
      }
    }
  }

  static updateAll() {
    for (const entity of Entity.entities) {
      entity.physicsUpdate();
      entity.interactableUpdate();
      entity.update();
    }
  }

  static renderAll() {
    for (const entity of Entity.entities) {
      entity.renderSprite();
      if (entity.debug) entity.renderDebug();
    }
  }

  static initAll() {
    for (const entity of Entity.entities) {
      entity._defaultInit();
      entity.init();
    }
  }

  setBoundingBox(width: number, height: number, x_offset: number, y_offset: number) {
    this.bounding_box.width = width;
    this.bounding_box.height = height;
    this.bounding_box.x_offset = x_offset;
    this.bounding_box.y_offset = y_offset;
    this.custom_bounding_box = true;
  }

  setUnitPosition(x: number, y: number) {
    this.position.x = x * Game.grid_size;
    this.position.y = y * Game.grid_size;
  }

  _defaultInit() {
    if (this.sprite_src === undefined) {
      this.loading_complete = true;
      return;
    }
    this.sprite_img = new Image();
    this.sprite_img.src = this.sprite_src;
    this.sprite_img.onload = () => {
      this.loading_complete = true;
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

  move() {
    if (this.moveTo_vector === undefined) return;
    console.log("moving");
    const timer_progress = this.moveTo_frame / this.moveTo_time;
    const easeProgress =
      this.easing === "linear"
        ? timer_progress
        : false || this.easing === "ease-in-out"
        ? easeInOut(timer_progress)
        : timer_progress;
    this.position.lerp(
      {
        x: this.moveTo_vector.x,
        y: this.moveTo_vector.y,
      },
      easeProgress
    );
    if (this.moveTo_frame !== this.moveTo_time) this.moveTo_frame += 1;
  }

  clearMove() {
    this.moveTo_vector = undefined;
    this.moveTo_time = 60;
    this.moveTo_frame = 1;
    this.moveTo_finished = true;
  }

  physicsUpdate() {
    if(this.width !== this.bounding_box.width || this.height !== this.bounding_box.height && !this.custom_bounding_box) {
      this.bounding_box.width = this.width;
      this.bounding_box.height = this.height;
    }
    if (this.is_static) return;
    if (this.moveTo_vector !== undefined) {
      if (this.moveTo_frame !== this.moveTo_time) {
        this.move();
      } else {
        this.moveTo_finished = true;
      }
      return;
    } else {
      this.moveTo_frame = 1;
    }
    this.position.addTo(this.velocity);
    this.velocity.tendToZero(this.deceleration);
  }

  interactableUpdate() {
    if (!this.is_interactable) return;
    this.distance_to_player = this.position.distanceTo(Player.position);
    if (this.distance_to_player < 100 && !this.rendering_interactable) {
      Player.interactable_entities_in_range.push(this);
      console.log("in range")
      this.rendering_interactable = true;
    } else if (this.distance_to_player > 100 && this.rendering_interactable) {
      Player.interactable_entities_in_range.splice(
        Player.interactable_entities_in_range.indexOf(this),
        1
      );
      this.rendering_interactable = false;
    }
  }

  init() {}

  update() {}

  defaultInteract() {
    this.interacting = true;
  }

  interact() {}

  uninteract() {
    this.interacting = false;
  }

  renderInteractableBubble() {
    if (!Game.context || !this.rendering_interactable) return;
    Game.renderSprite(
      Game.interact_bubble,
      this.position.x,
      this.position.y,
      32,
      32
    );
  }

  renderSprite() {
    if (!this.loading_complete || !this.sprite_img) return;
    Game.renderSprite(
      this.sprite_img,
      this.position.x,
      this.position.y,
      this.width,
      this.height,
      this.animation,
      this.animation_frame
    );
    if (this.rendering_interactable) {
      Game.renderSprite(
        Game.interact_bubble,
        this.position.x + (this.width / 2 - 18),
        this.position.y - 36,
        32,
        32
      );
    }
  }
  renderDebug() {
    if (!Game.context) return;
    Game.renderStrokeRect(
      this.position.x + this.bounding_box.x_offset,
      this.position.y + this.bounding_box.y_offset,
      this.bounding_box.width,
      this.bounding_box.height,
    );
    if (this.rendering_interactable && !this.sprite_img) {
      Game.renderSprite(
        Game.interact_bubble,
        this.position.x + (this.width / 2 - 18),
        this.position.y - 36,
        32,
        32
      );
    }
  }
}
