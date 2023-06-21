import { Game } from "./globals";
import { Vector } from "./objects";
import { Player } from "./player";

export class Entity {
    position: Vector;
    width: number;
    height: number;
    sprite_src: string | undefined;
    sprite_img: HTMLImageElement | undefined;
    loading_complete: boolean;
    animation: number;
    animation_frame: number;
    is_static: boolean;
    is_interactable: boolean;
    interacting = false;
    debug: boolean;
    max_speed = 5;
    deceleration = 1;
    acceleration = 2;
    velocity: Vector;
    distance_to_player = 0;
    rendering_interactable = false;
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
      }
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
  
    physicsUpdate() {
      if (this.is_static) return;
      this.position.addTo(this.velocity);
      this.velocity.tendToZero(this.deceleration);
    }
  
    interactableUpdate() {
      if (!this.is_interactable) return;
      this.distance_to_player = this.position.distanceTo(Player.position);
      if (this.distance_to_player < 100) {
        Player.interactable_entities_in_range.push(this);
        this.rendering_interactable = true;
      } else {
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
    }
    renderDebug() {
      if (!Game.context) return;
      Game.renderStrokeRect(
        this.position.x,
        this.position.y,
        this.width,
        this.height
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
  }