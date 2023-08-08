import { image_pool } from "./game/imagePool";
import { type Vector2d } from "./types";
import { type Vector } from "./vector";

type Anim = {
  column: number;
  limit: number;
  speed: number;
  frame: number;
  start?: number;
};

export class Sprite {
  sprite_img: HTMLImageElement;
  width: number;
  height: number;
  scale: number;
  offset: Vector2d | Vector = { x: 0, y: 0 };
  rotation = 0;
  lock_rotation = false;
  current_animation_name?: string;
  current_animation?: Anim;
  animations: { default: Anim; [name: string]: Anim };
  animation_interval: NodeJS.Timer | number | undefined;

  constructor(
    sprite_url: string,
    width: number,
    height: number,
    scale?: number,
    animations?: { default: Anim; [name: string]: Anim }
  ) {
    if (image_pool[sprite_url]) {
      this.sprite_img = image_pool[sprite_url];
    } else {
      console.error("no image found with name " + sprite_url);
      this.sprite_img = new Image();
    }
    this.width = width;
    this.height = height;
    this.scale = scale || 1;
    this.animations = animations || {
      default: { column: 0, limit: 1, speed: 1, frame: 0 },
    };
  }

  playAnimation(animation: string, loop = false) {
    if (this.current_animation_name === animation) return;
    this.stopAnimation();
    this.current_animation_name = animation;
    this.current_animation = this.animations[animation];
    if(!this.current_animation) return;
    this.current_animation.frame = this.current_animation.start || 0;
    this.animation_interval = setInterval(() => {
      if(!this.current_animation) return;
      this.current_animation.frame++;
      if (this.current_animation.frame >= this.current_animation.limit) {
        if (loop) {
          this.current_animation.frame = 0;
        } else {
          this.stopAnimation();
        }
      }
    }, 1000 / this.current_animation.speed);
  }

  stopAnimation() {
    if (this.animation_interval) {
      clearInterval(this.animation_interval);
      this.animation_interval = undefined;
    }
  }

  clearAnimation() {
    this.stopAnimation();
    this.current_animation = undefined;
    this.current_animation_name = undefined;
  }
}
