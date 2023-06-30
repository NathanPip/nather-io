import { Entity } from "./entity";
import { Game, GameLevel, keys } from "./globals";
import { Vector } from "./objects";
import { checkCollision } from "./utils";

type Animation = {
  column: number;
  limit: number;
  speed: number;
  start?: number;
};

export class Player {
  static position: Vector = new Vector(29, 59);
  static width = 1;
  static height = 1;
  static max_speed = 4;
  static deceleration = 12;
  static acceleration = 30;
  static velocity: Vector = new Vector(0, 0, {
    x: this.max_speed,
    y: this.max_speed,
  });
  static previous_velocityX = 0;
  static previous_velocityY = 0;
  static character_sprite_sheet: HTMLImageElement;
  static loading_complete = false;
  static animation: string | undefined;
  static animation_frame = 0;
  static animation_interval: NodeJS.Timer | number | undefined;
  static animations: { [name: string]: Animation } = {
    "walk-right": { column: 1, limit: 4, speed: 6 },
    "walk-left": { column: 3, limit: 4, speed: 6 },
    "idle-right": { column: 0, limit: 1, speed: 0 },
    "idle-left": { column: 2, limit: 1, speed: 0 },
  };
  static render_collision_debug = true;
  static interactable_entities_in_range: Entity[] = [];
  static interact_pressed = false;
  static interacting_entity: Entity | undefined;

  static checkCollisions(delta_time: number) {
    for (const entity of Entity.entities) {
      if (!entity.collision_physics) continue;
      if (
        checkCollision(
          {
            x: this.position.x + this.velocity.x * delta_time,
            y: this.position.y,
            width: this.width,
            height: this.height,
          },
          {
            x: entity.world_position.x + entity.bounding_box.x_offset,
            y: entity.world_position.y + entity.bounding_box.y_offset,
            width: entity.bounding_box.width,
            height: entity.bounding_box.height,
          }
        )
      ) {
        if (this.velocity.x === 0) {
          this.previous_velocityX > 0
            ? (this.velocity.x = -0.1)
            : (this.velocity.x = 0.1);
          return;
        }
        this.velocity.x = 0;
      }
      if (
        checkCollision(
          {
            x: this.position.x,
            y: this.position.y + this.velocity.y * delta_time,
            width: this.width,
            height: this.height,
          },
          {
            x: entity.world_position.x + entity.bounding_box.x_offset,
            y: entity.world_position.y + entity.bounding_box.y_offset,
            width: entity.bounding_box.width,
            height: entity.bounding_box.height,
          }
        )
      ) {
        if (this.velocity.y === 0) {
          this.previous_velocityY > 0
            ? (this.velocity.y = -0.1)
            : (this.velocity.y = 0.1);
          return;
        }
        this.velocity.y = 0;
      }
    }
  }

  static interact() {
    const entity = this.interactable_entities_in_range.sort(
      (a, b) => a.distance_to_player - b.distance_to_player
    )[0];
    if (!entity) return;
    entity.defaultInteract();
    entity.interact();
    this.interacting_entity = entity;
  }

  static uninteract() {
    if (!this.interacting_entity) return;
    this.interacting_entity.uninteract();
    this.interacting_entity = undefined;
  }

  static checkInput(delta_time: number) {
      if (keys.w) {
        this.velocity.addTo({ x: 0, y: -this.acceleration * delta_time });
      }
      if (keys.d) {
        this.velocity.addTo({ x: this.acceleration * delta_time, y: 0 });
      }
      if (keys.s) {
        this.velocity.addTo({ x: 0, y: this.acceleration * delta_time });
      }
      if (keys.a) {
        this.velocity.addTo({ x: -this.acceleration * delta_time, y: 0 });
      }
  }

  static checkInteract() {
    if (keys.e && !this.interact_pressed) {
      this.interact();
      this.interact_pressed = true;
    } else if (!keys.e) {
      this.interact_pressed = false;
    }
  }

  static stopAnimation() {
    if (this.animation_interval) {
      clearInterval(this.animation_interval);
      this.animation_interval = undefined;
    }
  }

  static clearAnimation() {
    this.stopAnimation();
    this.animation = undefined;
    this.animation_frame = 0;
  }

  static playAnimation(animation: string, loop = false) {
    if (this.animation === animation) return;
    if (this.animation !== undefined) {
      this.stopAnimation();
    }
    this.animation = animation;
    this.animation_frame = this.animations[animation].start || 0;
    this.animation_interval = setInterval(() => {
      this.animation_frame++;
      if (this.animation_frame >= this.animations[animation].limit) {
        if (loop) {
          this.animation_frame = 0;
        } else {
          this.stopAnimation();
        }
      }
    }, 1000 / this.animations[animation].speed);
  }

  static init() {
    this.character_sprite_sheet = new Image();
    this.character_sprite_sheet.src = "./nather-io-player-sheet.png";
    this.character_sprite_sheet.onload = () => {
      this.loading_complete = true;
    };
  }

  static update(delta_time: number) {
    if (this.velocity.x !== 0) {
      this.previous_velocityX = this.velocity.x;
    }
    if (this.velocity.y !== 0) {
      this.previous_velocityY = this.velocity.y;
    }
    this.checkInput(delta_time);
    this.checkInteract();
    this.checkCollisions(delta_time);
    this.position.addTo(this.velocity.multiply(delta_time));
    this.velocity.tendToZero(this.deceleration * delta_time);
    if (this.velocity.x === 0 && this.velocity.y === 0) {
      this.previous_velocityX > 0
        ? this.playAnimation("idle-right", true)
        : this.playAnimation("idle-left", true);
    } else {
      this.previous_velocityX > 0
        ? this.playAnimation("walk-right", true)
        : this.playAnimation("walk-left", true);
    }
  }

  static render() {
    if (!Game.context || !this.loading_complete) return;
    Game.renderSprite(
      this.character_sprite_sheet,
      this.position.x,
      this.position.y,
      this.width,
      this.height,
      this.animations[this.animation || ""]
        ? this.animations[this.animation as string].column
        : 0,
      this.animation_frame
    );
    if (this.render_collision_debug) {
      Game.renderStrokeRect(
        this.position.x,
        this.position.y,
        this.width,
        this.height
      );
    }
  }
}
