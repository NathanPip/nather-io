import { type Vector2d } from "./types";
import { collisionMap } from "./nather-io-map-data";
import { keys } from "./globals";
import { checkCollision, easeInOut, lerp } from "./utils";

export class Vector {
  x: number;
  y: number;
  max_vector: Vector2d = { x: Infinity, y: Infinity };
  constructor(x: number, y: number, max_vector?: Vector2d) {
    this.x = x;
    this.y = y;
    if (max_vector) this.max_vector = max_vector;
  }

  addTo(other: Vector | Vector2d) {
    this.x += other.x;
    this.y += other.y;
    this.constrainToMax();
  }

  add(other: Vector | Vector2d) {
    return new Vector(this.x + other.x, this.y + other.y);
  }

  multiplyTo(other: Vector | Vector2d) {
    this.x *= other.x;
    this.y *= other.y;
    this.constrainToMax();
  }

  multiply(other: Vector | Vector2d) {
    return new Vector(this.x * other.x, this.y * other.y);
  }

  // inBetween(other: Vector | Vector2d) {
  //   return new Vector(this.x - other.x, this.y - other.y);
  // }

  lerp(other: Vector | Vector2d, progress: number) {
    this.x += (other.x - this.x) * progress;
    this.y += (other.y - this.y) * progress;
  }

  tendToZero(amt: number) {
    Math.abs(this.x) - amt < 0
      ? (this.x = 0)
      : (this.x += (-amt * Math.abs(this.x)) / this.x);
    Math.abs(this.y) - amt < 0
      ? (this.y = 0)
      : (this.y += (-amt * Math.abs(this.y)) / this.y);
  }

  constrainToMax() {
    if (Math.abs(this.x) > this.max_vector.x)
      this.x = (this.max_vector.x * this.x) / Math.abs(this.x);
    if (Math.abs(this.y) > this.max_vector.y)
      this.y = (this.max_vector.y * this.y) / Math.abs(this.y);
  }

  distanceTo(vec: Vector | Vector2d) {
    return Math.sqrt(Math.pow(this.x - vec.x, 2) + Math.pow(this.y - vec.y, 2));
  }
}

export class Input {
  static keys: { [key: string]: boolean } = {};

  static isHoldingKey(key: string) {
    if (this.keys[key] === undefined) {
      this.keys[key] = false;
    }
    return this.keys[key];
  }
}

export class Camera {
  static position: Vector = new Vector(0, 0);
  static width = 0;
  static height = 0;
  static following_vector: Vector = new Vector(0, 0);
  static following_lag = 0.1;
  static moveTo_vector: Vector | Vector2d | undefined;
  static moveTo_frame = 1;
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

  static _zoom() {
    const progress = this.zoom_frame / this.zoom_time;
    Game.render_scale = lerp(
      Game.render_scale,
      Game.default_render_scale * this.zoom_multiplier,
      progress
    );
    if (this.zoom_frame !== this.zoom_time) this.zoom_frame += 1;
  }

  static _unzoom() {
    if ((Game.render_scale = Game.default_render_scale)) return;
    const progress = this.zoom_frame / this.zoom_time;
    Game.render_scale = lerp(
      Game.render_scale,
      Game.default_render_scale,
      progress
    );
    if (this.zoom_frame !== this.zoom_time) this.zoom_frame += 1;
  }

  static move() {
    if (this.moveTo_vector === undefined) return;
    const timer_progress = this.moveTo_frame / this.moveTo_time;
    const easeProgress =
      this.easing === "linear"
        ? timer_progress
        : false || this.easing === "ease-in-out"
        ? easeInOut(timer_progress)
        : timer_progress;
    this.position.lerp(
      {
        x: this.moveTo_vector.x * Game.render_scale - this.width / 2,
        y: this.moveTo_vector.y * Game.render_scale - this.height / 2,
      },
      easeProgress
    );
    if (this.moveTo_frame !== this.moveTo_time) this.moveTo_frame += 1;
  }

  static clearMove() {
    this.moveTo_vector = undefined;
    this.moveTo_time = 60;
  }

  static update() {
    if (this.zoomed) {
      this._zoom();
    } else if (Game.render_scale !== Game.default_render_scale) {
      this._unzoom();
    }
    if (this.moveTo_vector !== undefined) {
      if (this.moveTo_frame !== this.moveTo_time) {
        this.move();
      } else {
        this.moveTo_finished = true;
      }
      return;
    } else {
      this.moveTo_frame = 1;
      this.moveTo_finished = false;
    }
    this.position.lerp(
      {
        x: this.following_vector.x * Game.render_scale - this.width / 2,
        y: this.following_vector.y * Game.render_scale - this.height / 2,
      },
      this.following_lag
    );
  }
}

export class Game {
  static context: CanvasRenderingContext2D | null;
  static default_render_scale = 1.6;
  static game_dom: HTMLDivElement | undefined;
  static render_scale = 1.6;
  static grid_size = 64;
  static current_frame = 0;
  static FPS = 60;
  static interact_bubble: HTMLImageElement;
  static default_draw_color = "black";

  static init() {
    this.interact_bubble = new Image();
    this.interact_bubble.src = "./nather-io-interact-bubble.png";
  }

  static renderSprite(
    image: HTMLImageElement,
    x: number,
    y: number,
    width: number,
    height: number,
    animation = 0,
    animation_frame = 0,
    scale = 1
  ) {
    if (!this.context) return;
    this.context.drawImage(
      image,
      width * animation_frame,
      height * animation,
      width,
      height,
      x * this.render_scale * scale - Camera.position.x,
      y * this.render_scale * scale - Camera.position.y,
      width * this.render_scale * scale,
      height * this.render_scale * scale
    );
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
      x * this.render_scale - Camera.position.x,
      y * this.render_scale - Camera.position.y,
      width * this.render_scale,
      height * this.render_scale
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
      x * this.render_scale - Camera.position.x,
      y * this.render_scale - Camera.position.y,
      width * this.render_scale,
      height * this.render_scale
    );
    this.context.fillStyle = this.default_draw_color;
  }
}

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

export class Character extends Entity {
  name: string | undefined;
  static characters: Character[] = [];
  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    sprite_src?: string
  ) {
    super(x, y, width, height, sprite_src);
    Character.characters.push(this);
  }

  interact() {}

  update() {
    
  }
}

export class Boundary extends Entity {
  renderDebug() {
    if (!Game.context) return;
    Game.renderFillRect(
      this.position.x,
      this.position.y,
      this.width,
      this.height,
      `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${
        Math.random() * 255
      }, .5)`
    );
  }
}

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
              boundary.position.x + boundary.width === j * this.level_size &&
              boundary.position.y === i * this.level_size
            ) {
              if (j * this.level_size > boundary.position.x) {
                boundary.width += this.level_size;
              } else if (j * this.level_size < boundary.position.x) {
                boundary.position.x -= this.level_size;
                boundary.width += this.level_size;
              }
              addedTo = true;
            } else if (
              boundary.position.y + boundary.height === i * this.level_size &&
              boundary.position.x === j * this.level_size
            ) {
              if (i * this.level_size > boundary.position.y) {
                boundary.height += this.level_size;
              } else if (i * this.level_size < boundary.position.y) {
                boundary.position.y += this.level_size;
                boundary.height += this.level_size;
              }
              addedTo = true;
            }
          }
          if (addedTo) continue;
          this.boundaries.push(
            new Boundary(
              j * this.level_size,
              i * this.level_size,
              this.level_size,
              this.level_size
            )
          );
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
      boundary.renderDebug();
    }
  }

  static renderGrid() {
    for (let i = 0; i < this.level_size; i++) {
      for (let j = 0; j < this.level_size; j++) {
        if (this.context == null) return;
        Game.renderStrokeRect(
          j * Game.grid_size,
          i * Game.grid_size,
          Game.grid_size,
          Game.grid_size
        );
      }
    }
  }
}
