import { Entity } from "./entity";
import { Renderer, GameLevel, keys } from "./globals";
import { Vector } from "./vector";
import { checkCollision } from "./utils";
import { Sprite } from "./sprite";

type Anim = {
  column: number;
  limit: number;
  speed: number;
  start?: number;
};

export class Player {
  static sprite = new Sprite("./nather-io-player-sheet.png", 64, 64, 1, {
    "default": { column: 0, limit: 1, speed: 0, frame: 0},
    "walk-right": { column: 1, limit: 4, speed: 6, frame: 0 },
    "walk-left": { column: 3, limit: 4, speed: 6, frame: 0 },
    "idle-right": { column: 0, limit: 1, speed: 0, frame: 0 },
    "idle-left": { column: 2, limit: 1, speed: 0, frame: 0 },
  })
  static position: Vector = new Vector(5, 93);
  static width = 1;
  static height = 1;
  static rotation = 0;
  static input_enabled = true;
  static max_speed = 4;
  static deceleration = 20;
  static acceleration = 40;
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
  static animations: { [name: string]: Anim } = {
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

  static interact(ent?: string | Entity, _bubble?: boolean) {
    if(ent)  {
      if(typeof ent === "string") {
        for (const e of Entity.entities) {
          if (e.id === ent) {
            this.interacting_entity = e;
            if (_bubble) return;
            e.interact();
            return;
          }
        }
        console.error("no entity with name " + ent + " found");
        return;
      }
      this.interacting_entity = ent;
      if(_bubble) return;
      ent.interact();
      return;
    }
    const entity = this.interactable_entities_in_range.sort(
      (a, b) => a.distance_to_player - b.distance_to_player
    )[0];
    if (!entity) return;
    this.interacting_entity = entity;
    if (_bubble) return;
    entity.interact();
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
    if(this.input_enabled) {
      this.checkInput(delta_time);
      this.checkInteract();
    }
    this.checkCollisions(delta_time);
    this.position.addTo(this.velocity.multiply(delta_time));
    this.velocity.tendToZero(this.deceleration * delta_time);
    if (this.velocity.x === 0 && this.velocity.y === 0) {
      this.previous_velocityX > 0
        ? this.sprite.playAnimation("idle-right", true)
        : this.sprite.playAnimation("idle-left", true);
    } else {
      this.previous_velocityX > 0
        ? this.sprite.playAnimation("walk-right", true)
        : this.sprite.playAnimation("walk-left", true);
    }
  }

  static render() {
    if (!Renderer.context || !this.loading_complete) return;
    Renderer.renderSprite(
      this.position.x,
      this.position.y,
      this.sprite,
      this.rotation,
    );
    if (this.render_collision_debug) {
      Renderer.renderStrokeRect(
        this.position.x,
        this.position.y,
        this.width,
        this.height
      );
    }
  }
}
