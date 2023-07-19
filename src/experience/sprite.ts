type Anim = {
  column: number;
  limit: number;
  speed: number;
  frame: number;
  start?: number;
};

const image_pool: { [url: string]: HTMLImageElement } = {};

export class Sprite {
  sprite_img: HTMLImageElement;
  width: number;
  height: number;
  scale: number;
  current_animation_name: string;
  current_animation: Anim;
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
      this.sprite_img = new Image();
      this.sprite_img.src = sprite_url;
      image_pool[sprite_url] = this.sprite_img;
    }
    this.width = width;
    this.height = height;
    this.scale = scale || 1;
    this.animations = animations || {
      default: { column: 0, limit: 1, speed: 1, frame: 0 },
    };
    this.current_animation_name = Object.keys(this.animations)[0];
    this.current_animation = this.animations[this.current_animation_name];
  }

  playAnimation(animation: string, loop = false) {
    if (this.current_animation_name === animation) return;
    this.stopAnimation();
    this.current_animation_name = animation;
    this.current_animation = this.animations[animation];
    this.current_animation.frame = this.current_animation.start || 0;
    this.animation_interval = setInterval(() => {
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
    this.current_animation.frame = 0;
    this.current_animation = this.animations["default"];
  }
}
