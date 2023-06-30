import { createSignal } from "solid-js";
import { Boundary } from "./game/entities";
import { collisionMap } from "./game/nather-io-map-data";
import { Vector } from "./objects";
import { Player } from "./player";
import { type Vector2d } from "./types";
import { easeInOut, lerp } from "./utils";
import { Entity } from "./entity";

export const keys: { [key: string]: boolean } = {
  w: false,
  d: false,
  s: false,
  a: false,
};

export class Camera {
  static position: Vector = new Vector(0, 0);
  static width = 0;
  static height = 0;
  static following_vector: Vector = new Vector(0, 0);
  static following_lag = 5;
  static moveTo_vector: Vector | Vector2d | undefined;
  static moveTo_progress = 0;
  static moveTo_time = 15;
  static moveTo_finished = false;
  static zoomed = false;
  static zoom_frame = 1;
  static zoom_time = 60;
  static zoom_multiplier = 1.25;
  static easing: "linear" | "ease-in-out" = "linear";

  static returnToPlayer() {
    Camera.following_vector = Player.position;
  }

  static init() {
    Camera.returnToPlayer();
  }

  static moveTo(
    vector: Vector | Vector2d,
    time?: number,
    easing?: "linear" | "ease-in-out"
  ) {
    this.moveTo_vector = vector;
    this.moveTo_time = time || 60;
    if (easing) this.easing = easing;
  }

  static zoom(amt?: number, time?: number) {
    this.zoom_frame = 1;
    amt ? (this.zoom_multiplier = amt) : (this.zoom_multiplier = 1.25);
    time ? (this.zoom_time = time) : (this.zoom_time = 60);
    this.zoomed = true;
  }

  static unzoom(amt?: number, time?: number) {
    this.zoom_frame = 1;
    amt ? (this.zoom_multiplier = amt) : (this.zoom_multiplier = 1.25);
    time ? (this.zoom_time = time) : (this.zoom_time = 60);
    this.zoomed = false;
  }

  static _zoom(delta_time: number) {
    const progress = this.zoom_frame / this.zoom_time;
    Game.render_scale = lerp(
      Game.render_scale,
      Game.default_render_scale * this.zoom_multiplier,
      progress
    );
    if (this.zoom_frame < this.zoom_time) this.zoom_frame += delta_time;
  }

  static _unzoom(delta_time: number) {
    if ((Game.render_scale = Game.default_render_scale)) return;
    const progress = this.zoom_frame / this.zoom_time;
    Game.render_scale = lerp(
      Game.render_scale,
      Game.default_render_scale,
      progress
    );
    if (this.zoom_frame < this.zoom_time) this.zoom_frame += delta_time;
  }

  static move(delta_time: number) {
    if (this.moveTo_vector === undefined) return;
    const timer_progress = this.moveTo_progress / this.moveTo_time;
    const easeProgress =
      this.easing === "linear"
        ? timer_progress
        : false || this.easing === "ease-in-out"
        ? easeInOut(timer_progress)
        : timer_progress;
    this.position.lerp(
      {
        x:
          this.moveTo_vector.x * Game.tile_size * Game.render_scale -
          this.width / 2,
        y:
          this.moveTo_vector.y * Game.tile_size * Game.render_scale -
          this.height / 2,
      },
      easeProgress
    );
    if (this.moveTo_progress < this.moveTo_time) this.moveTo_progress += delta_time;
  }

  static clearMove() {
    this.moveTo_vector = undefined;
    this.moveTo_time = 2;
    this.moveTo_progress = 0;
    this.moveTo_finished = false;
  }

  static update(delta_time: number) {
    // console.log(this.position);
    if (this.zoomed) {
      this._zoom(delta_time);
    } else if (Game.render_scale !== Game.default_render_scale) {
      this._unzoom(delta_time);
    }
    if (this.moveTo_vector !== undefined) {
      if (this.moveTo_progress !== this.moveTo_time) {
        this.move(delta_time);
      } else {
        this.moveTo_finished = true;
      }
      return;
    } else {
      this.moveTo_progress = 0;
      this.moveTo_finished = false;
    }
    this.position.lerp(
      {
        x:
          this.following_vector.x * Game.tile_size * Game.render_scale -
          this.width / 2,
        y:
          this.following_vector.y * Game.tile_size * Game.render_scale -
          this.height / 2,
      },
      this.following_lag * delta_time
    );
  }
}

export class Game {
  static context: CanvasRenderingContext2D | null;
  static delta_time = 0;
  static elapsed_time = 0;
  static default_render_scale = 1.6;
  static game_dom: HTMLDivElement | undefined;
  static render_scale = 1.6;
  static tile_size = 64;
  static current_frame = 0;
  static FPS = 60;
  static interact_bubble: HTMLImageElement;
  static default_draw_color = "black";

  static init() {
    this.interact_bubble = new Image();
    this.interact_bubble.src = "./nather-io-interact-bubble.png";
  }

  static renderInteractableBubble(position: Vector | Vector2d) {
    if (!this.context) return;
    Game.renderSprite(Game.interact_bubble, position.x, position.y, 0.5, 0.5);
  }

  static renderEntity(entity: Entity) {
    if (!this.context) return;
    this.context.save();
    this.context.translate(
      entity.world_position.x * this.tile_size * this.render_scale -
        Camera.position.x +
        (entity.width * this.tile_size * this.render_scale) / 2,
      entity.world_position.y * this.tile_size * this.render_scale -
        Camera.position.y +
        (entity.height * this.tile_size * this.render_scale) / 2
    );
    this.context.rotate((entity.world_rotation * Math.PI) / 180);
    this.context.scale(this.render_scale, this.render_scale);
    if (entity.sprite_img)
      this.context.drawImage(
        entity.sprite_img,
        entity.width * this.tile_size * entity._animation_frame,
        entity.height * this.tile_size * entity.animation,
        entity.width * this.tile_size,
        entity.height * this.tile_size,
        -entity.width * this.tile_size / 2,
        -entity.height * this.tile_size / 2,
        entity.width * this.tile_size,
        entity.height * this.tile_size
      );
    this.context.restore();
  }

  static renderSprite(
    image: HTMLImageElement,
    x: number,
    y: number,
    width: number,
    height: number,
    animation = 0,
    animation_frame = 0,
    angle = 0,
    scale = 1
  ) {
    if (!this.context) return;
    this.context.save();
    this.context.translate(
      x * this.tile_size * this.render_scale * scale -
        Camera.position.x +
        (width * this.tile_size * this.render_scale) / 2,
      y * this.tile_size * this.render_scale * scale -
        Camera.position.y +
        (height * this.tile_size * this.render_scale) / 2
    );
    this.context.rotate((2 * angle * Math.PI) / 360);
    this.context.scale(this.render_scale, this.render_scale);
    this.context.drawImage(
      image,
      width * this.tile_size * animation_frame,
      height * this.tile_size * animation,
      width * this.tile_size,
      height * this.tile_size,
      (-width * this.tile_size) / 2,
      (-height * this.tile_size) / 2,
      width * this.tile_size * scale,
      height * this.tile_size * scale
    );
    this.context.restore();
  }

  static renderFillRect(
    x: number,
    y: number,
    width: number,
    height: number,
    color?: string
  ) {
    if (!this.context) return;
    if (color !== undefined) this.context.fillStyle = color;
    this.context.fillRect(
      x * this.tile_size * this.render_scale - Camera.position.x,
      y * this.tile_size * this.render_scale - Camera.position.y,
      width * this.tile_size * this.render_scale,
      height * this.tile_size * this.render_scale
    );
    this.context.fillStyle = this.default_draw_color;
  }

  static renderStrokeRect(
    x: number,
    y: number,
    width: number,
    height: number,
    color?: string
  ) {
    if (!this.context) return;
    if (color !== undefined) this.context.fillStyle = color;
    this.context.strokeRect(
      x * this.tile_size * this.render_scale - Camera.position.x,
      y * this.tile_size * this.render_scale - Camera.position.y,
      width * this.tile_size * this.render_scale,
      height * this.tile_size * this.render_scale
    );
    this.context.fillStyle = this.default_draw_color;
  }
}

export class GameLevel {
  static window_width: number;
  static window_height: number;
  static camera_offset: Vector = new Vector(0, 0);
  static current_level = 0;
  static levels: { [key: number]: GameLevel } = {};
  static boundaries: Boundary[] = [];
  static dev_mode = false;
  static context: CanvasRenderingContext2D | null;
  static level_size = 64;
  static image_loaded = false;
  static level_image: HTMLImageElement;

  static createBoundaries() {
    for (let i = 0; i < GameLevel.level_size; i++) {
      for (let j = 0; j < GameLevel.level_size; j++) {
        const currentCell = collisionMap[i * GameLevel.level_size + j];
        if (
          currentCell === 34 ||
          currentCell === 32 ||
          currentCell === 33 ||
          currentCell === 31 ||
          currentCell === 13 ||
          currentCell === 18 ||
          currentCell === 19 ||
          currentCell === 1 ||
          currentCell === 2 ||
          currentCell === 3 ||
          currentCell === 4 ||
          currentCell === 22 ||
          currentCell === 21 ||
          currentCell === 23 ||
          currentCell === 24 ||
          currentCell === 15 ||
          currentCell === 17 ||
          currentCell === 11 ||
          currentCell === 12 ||
          currentCell === 18 ||
          currentCell === 6 ||
          currentCell === 16
        ) {
          let addedTo = false;
          for (const boundary of GameLevel.boundaries) {
            if (
              boundary.world_position.x + boundary.width === j &&
              boundary.world_position.y === i
            ) {
              if (j > boundary.world_position.x) {
                boundary.setSize(boundary.width + 1, boundary.height);
              } else if (j < boundary.world_position.x) {
                boundary.world_position.x -= 1;
                boundary.setSize(boundary.width + 1, boundary.height);
              }
              addedTo = true;
            } else if (
              boundary.world_position.y + boundary.height === i &&
              boundary.world_position.x === j
            ) {
              if (i > boundary.world_position.y) {
                boundary.setSize(boundary.width, boundary.height + 1);
              } else if (i < boundary.world_position.y) {
                boundary.world_position.y += 1;
                boundary.setSize(boundary.width, boundary.height + 1);
              }
              addedTo = true;
            }
          }
          if (addedTo) continue;
          this.boundaries.push(new Boundary("wall", j, i, 1, 1));
        }
      }
    }
  }

  static init() {
    if (!this.context || !this.level_image) return;
    this.level_image.src = "./nather-io-map.png";
    this.level_image.onload = () => {
      this.image_loaded = true;
    };
    this.createBoundaries();
  }

  static render() {
    if (!this.image_loaded || !this.context) return;
    this.context.drawImage(
      this.level_image,
      -Camera.position.x,
      -Camera.position.y,
      this.level_image.width * Game.render_scale,
      this.level_image.height * Game.render_scale
    );
  }

  static renderBoundaries() {
    for (const boundary of this.boundaries) {
      boundary._renderDebug();
    }
  }

  static renderGrid() {
    for (let i = 0; i < this.level_size; i++) {
      for (let j = 0; j < this.level_size; j++) {
        if (this.context == null) return;
        Game.renderStrokeRect(j, i, 1, 1);
      }
    }
  }
}
