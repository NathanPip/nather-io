import { Entity } from "./entity";
import { Game, GameLevel, keys } from "./globals";
import { Vector } from "./objects";
import { checkCollision } from "./utils";

export class Player {
    static position: Vector = new Vector(500, 700);
    static width = 64;
    static height = 64;
    static max_speed = 5;
    static deceleration = 0.5;
    static acceleration = 2;
    static velocity: Vector = new Vector(0, 0, {
      x: this.max_speed,
      y: this.max_speed,
    });
    static previous_velocityX = 0;
    static character_sprite_sheet: HTMLImageElement;
    static loading_complete = false;
    static animation = 0;
    static animation_frame = 0;
    static render_collision_debug = false;
    static interactable_entities_in_range: Entity[] = [];
    static interact_pressed = false;
    static interacting_entity: Entity | undefined;
  
    static checkBoundaryCollisions() {
      for (const boundary of GameLevel.boundaries) {
        if (
          checkCollision(
            {
              x: this.position.x + this.velocity.x,
              y: this.position.y,
              width: this.width,
              height: this.height,
            },
            {
              x: boundary.position.x,
              y: boundary.position.y,
              width: boundary.width,
              height: boundary.height,
            }
          )
        ) {
          this.velocity.x = 0;
        }
        if (
          checkCollision(
            {
              x: this.position.x,
              y: this.position.y + this.velocity.y,
              width: this.width,
              height: this.height,
            },
            {
              x: boundary.position.x,
              y: boundary.position.y,
              width: boundary.width,
              height: boundary.height,
            }
          )
        ) {
          this.velocity.y = 0;
        }
      }
    }
  
    static interact() {
      console.log("interact called");
      const entity = this.interactable_entities_in_range
        .sort((a, b) => a.distance_to_player - b.distance_to_player)[0];
      entity.defaultInteract();
      entity.interact();
      this.interacting_entity = entity;
    }

    static uninteract() {
        if (!this.interacting_entity) return;
        this.interacting_entity.uninteract();
        this.interacting_entity = undefined;
    }
  
    static checkInput() {
      if (keys.w) {
        this.velocity.addTo({ x: 0, y: -this.acceleration });
      }
      if (keys.d) {
        this.velocity.addTo({ x: this.acceleration, y: 0 });
      }
      if (keys.s) {
        this.velocity.addTo({ x: 0, y: this.acceleration });
      }
      if (keys.a) {
        this.velocity.addTo({ x: -this.acceleration, y: 0 });
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
  
    static animate(animation: number, speed: number, limit: number) {
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
  
    static init() {
      this.character_sprite_sheet = new Image();
      this.character_sprite_sheet.src = "./nather-io-player-sheet.png";
      this.character_sprite_sheet.onload = () => {
        this.loading_complete = true;
      };
    }
  
    static update() {
      if (this.velocity.x !== 0) {
        this.previous_velocityX = this.velocity.x;
      }
      this.checkInput();
      this.checkInteract();
      this.checkBoundaryCollisions();
      this.position.addTo(this.velocity);
      this.velocity.tendToZero(this.deceleration);
      if (this.velocity.x === 0 && this.velocity.y === 0) {
        this.previous_velocityX > 0
          ? this.animate(0, 1, 0)
          : this.animate(2, 1, 0);
      } else {
        this.previous_velocityX > 0
          ? this.animate(1, 8, 3)
          : this.animate(3, 8, 3);
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
        this.animation,
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