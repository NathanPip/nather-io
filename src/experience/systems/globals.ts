import { createSignal } from "solid-js";
import { Boundary } from "../game/entities";
import { collisionMap } from "../game/nather-io-map-data";
import { Vector } from "../vector";
import { Player } from "../player";
import { type Vector2d } from "../types";
import { easeInOut, lerp } from "../utils";
import { Entity } from "../entity";
import { Sprite } from "../sprite";

export const keys: { [key: string]: boolean } = {
  w: false,
  d: false,
  s: false,
  a: false,
};

export class Camera {
  static position: Vector = new Vector(320, 5952);
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
    Camera.following_vector = Player.world_position;
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
    this.moveTo_time = time || 15;
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
    Renderer.render_scale = lerp(
      Renderer.render_scale,
      Renderer.default_render_scale * this.zoom_multiplier,
      progress
    );
    if (this.zoom_frame < this.zoom_time) this.zoom_frame += delta_time;
  }

  static _unzoom(delta_time: number) {
    if ((Renderer.render_scale = Renderer.default_render_scale)) return;
    const progress = this.zoom_frame / this.zoom_time;
    Renderer.render_scale = lerp(
      Renderer.render_scale,
      Renderer.default_render_scale,
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
          this.moveTo_vector.x * Renderer.tile_size * Renderer.render_scale -
          this.width / 2,
        y:
          this.moveTo_vector.y * Renderer.tile_size * Renderer.render_scale -
          this.height / 2,
      },
      easeProgress
    );
    if (this.moveTo_progress < this.moveTo_time)
      this.moveTo_progress += delta_time;
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
    } else if (Renderer.render_scale !== Renderer.default_render_scale) {
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
          this.following_vector.x * Renderer.tile_size * Renderer.render_scale -
          this.width / 2,
        y:
          this.following_vector.y * Renderer.tile_size * Renderer.render_scale -
          this.height / 2,
      },
      this.following_lag * delta_time
    );
  }
}

export class Renderer {
  static context: CanvasRenderingContext2D | null;
  static delta_time = 0;
  static elapsed_time = 0;
  static default_render_scale = 2;
  static game_dom: HTMLDivElement | undefined;
  static render_scale = 2;
  static tile_size = 64;
  static current_frame = 0;
  static interact_bubble: Sprite;
  static default_draw_color = "black";

  static init() {
    this.interact_bubble = new Sprite("interact-bubble", 32, 32);
  }

  static renderInteractableBubble(position: Vector | Vector2d) {
    if (!this.context) return;
    Renderer.renderSprite(position.x, position.y, .5, .5, this.interact_bubble);
  }

  static renderSprite(
    x: number,
    y: number,
    width: number,
    height: number,
    sprite: Sprite,
    rotation = 0,
    scale = 1
  ) {
    if (!this.context) return;
    this.context.save();
    this.context.translate(
      (x * this.tile_size) * this.render_scale -
        Camera.position.x +
        (width * this.tile_size * scale * this.render_scale * scale) / 2,
      (y * this.tile_size) * this.render_scale -
        Camera.position.y +
        (height * this.tile_size * scale * this.render_scale * scale) / 2
    );
    this.context.rotate((rotation * Math.PI) / 180);
    this.context.scale(this.render_scale * scale, this.render_scale * scale);
    this.context.drawImage(
      sprite.sprite_img,
      sprite.width * (sprite.current_animation ? sprite.current_animation.frame : 0) + 1,
      sprite.height * (sprite.current_animation ? sprite.current_animation.column : 0) + 1,
      sprite.width - 1,
      sprite.height - 1,
      ((-width * this.tile_size + sprite.offset.x)) / 2,
      ((-height * this.tile_size + sprite.offset.y)) / 2,
      sprite.width * sprite.scale * scale,
      sprite.height * sprite.scale * scale
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
  static level_size = 96;
  static image_loaded = false;
  static level_image: HTMLImageElement;

  static createBoundaries() {
    for (let i = 0; i < GameLevel.level_size; i++) {
      for (let j = 0; j < GameLevel.level_size; j++) {
        const currentCell = collisionMap[i * GameLevel.level_size + j];
        if (
          currentCell === 2 ||
          currentCell === 3 ||
          currentCell === 4 ||
          currentCell === 5 ||
          currentCell === 7 ||
          currentCell === 12 ||
          currentCell === 13 ||
          currentCell === 15 ||
          currentCell === 16 ||
          currentCell === 18 ||
          currentCell === 19 ||
          currentCell === 21 ||
          currentCell === 22 ||
          currentCell === 24 ||
          currentCell === 25 ||
          currentCell === 30 ||
          currentCell === 32 ||
          currentCell === 33 ||
          currentCell === 34 ||
          currentCell === 35
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
    this.level_image.src = "./sprites/map.png";
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
      this.level_image.width * Renderer.render_scale,
      this.level_image.height * Renderer.render_scale
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
        Renderer.renderStrokeRect(j, i, 1, 1);
      }
    }
  }
}
