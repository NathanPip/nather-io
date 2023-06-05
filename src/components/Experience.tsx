"use client";
import { createSignal, type Component, onMount, createEffect } from "solid-js";
import { createStore } from "solid-js/store";
import { useHomePageContext } from "~/routes";
import { collisionMap } from "~/experience/nather-io-map-data";

type Vector = { x: number; y: number };

type Rect = { x: number; y: number; width: number; height: number };

const keys: { [key: string]: boolean } = {
  w: false,
  d: false,
  s: false,
  a: false,
};

const checkCollision = (obj1: Rect, obj2: Rect) => {
  return (
    obj1.x < obj2.x + obj2.width &&
    obj1.x + obj1.width > obj2.x &&
    obj1.y < obj2.y + obj2.height &&
    obj1.y + obj1.height > obj2.y
  );
};

class Game {
  static context: CanvasRenderingContext2D | null;
  static render_scale = 2;
  static grid_size = 64;
}

class Entity {
  position: Vector;
  width: number;
  height: number;
  static entities: Entity[] = [];

  constructor(x: number, y: number, width: number, height: number) {
    this.position = { x, y };
    this.width = width;
    this.height = height;
    Entity.entities.push(this);
  }

  static updateAll() {
    for (const entity of Entity.entities) {
      entity.update();
    }
  }

  static renderAll() {
    for (const entity of Entity.entities) {
      entity.render();
    }
  }

  update() {}
  render() {}
}

class Boundary extends Entity {
  renderDebug() {
    if (!Game.context) return;
    Game.context.fillStyle = "red";
    Game.context.fillRect(
      this.position.x * Game.render_scale - Camera.position.x,
      this.position.y * Game.render_scale - Camera.position.y,
      this.width * Game.render_scale,
      this.height * Game.render_scale
    );
    Game.context.fillStyle = "black";
  }
}

class Player {
  static position: Vector = { x: 500, y: 700 };
  static width = 64;
  static height = 64;
  static _speed = 5;

  static get speed() {
    return Player._speed;
  }

  static render() {
    if (!Game.context) return;
    Game.context.fillRect(
      Player.position.x * Game.render_scale - Camera.position.x,
      Player.position.y * Game.render_scale - Camera.position.y,
      Player.width * Game.render_scale,
      Player.height * Game.render_scale
    );
  }

  static checkBoundaryCollisions(offset_x: number, offset_y: number) {
    for (const boundary of GameLevel.boundaries) {
      if (
        checkCollision(
          {
            x: this.position.x + offset_x,
            y: this.position.y + offset_y,
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
      ) return true;
    }
    return false;
  }

  static update() {
    if (keys.w) {
      if(this.checkBoundaryCollisions(0, -6)) return;
      Player.position.y -= Player.speed;
    }
    if (keys.d) {
      if(this.checkBoundaryCollisions(6, 0)) return;
      Player.position.x += Player.speed;
    }
    if (keys.s) {
      if(this.checkBoundaryCollisions(0, 6)) return;
      Player.position.y += Player.speed;
    }
    if (keys.a) {
      if(this.checkBoundaryCollisions(-6, 0)) return;
      Player.position.x -= Player.speed
    }
  }
}

class Camera {
  static position: Vector = { x: 0, y: 0 };
  static width = 0;
  static height = 0;
  static followingVector: Vector = { x: 0, y: 0 };

  static returnToPlayer() {
    Camera.followingVector = Player.position;
  }

  static init() {
    Camera.returnToPlayer();
  }

  static update() {
    Camera.position.x =
      Camera.followingVector.x * Game.render_scale - Camera.width / 2;
    Camera.position.y =
      Camera.followingVector.y * Game.render_scale - Camera.height / 2;
  }
}

class GameLevel {
  static window_width: number;
  static window_height: number;
  static camera_offset: Vector = { x: 0, y: 0 };
  static current_level = 0;
  static levels: { [key: number]: GameLevel } = {};
  static boundaries: Boundary[] = [];
  static dev_mode = false;
  static context: CanvasRenderingContext2D | null;
  static level_size = 64;
  static image_loaded = false;
  static level_image: any;

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
              boundary.position.x + boundary.height === j * this.level_size &&
              boundary.position.y === i * this.level_size
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
    console.log(this.boundaries.length);
  }

  static init() {
    if (!this.context || !this.level_image) return;
    this.level_image.src = "./nather-io-map.png";
    this.level_image.onload = () => {
      GameLevel.image_loaded = true;
    };
    this.createBoundaries();
  }

  static render() {
    if (!this.image_loaded) return;
    this.context!.drawImage(
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
    // if (!GameLevel.dev_mode) return;
    for (let i = 0; i < this.level_size; i++) {
      for (let j = 0; j < this.level_size; j++) {
        if (this.context == null) return;
        this.context.strokeRect(
          j * Game.grid_size * Game.render_scale - Camera.position.x,
          i * Game.grid_size * Game.render_scale - Camera.position.y,
          Game.grid_size * Game.render_scale,
          Game.grid_size * Game.render_scale
        );
      }
    }
  }
}

const Experience: Component = () => {
  const [homePageState] = useHomePageContext();

  let main_canvas: HTMLCanvasElement | undefined;
  let background_canvas: HTMLCanvasElement | undefined;
  const FPS = 60;
  const [mainContext, setMainContext] =
    createSignal<CanvasRenderingContext2D | null>(null);
  const [backgroundContext, setBackgroundContext] =
    createSignal<CanvasRenderingContext2D | null>(null);

  onMount(() => {
    Camera.width = window.innerWidth;
    Camera.height = window.innerHeight;
    window.addEventListener("resize", () => {
      Camera.width = window.innerWidth;
      Camera.height = window.innerHeight;
      Player.position.x = window.innerWidth / 2;
      Player.position.y = window.innerHeight / 2;
    });
  });

  createEffect(() => {
    if (main_canvas && background_canvas) {
      console.log("ran");
      setMainContext(main_canvas.getContext("2d"));
      setBackgroundContext(background_canvas.getContext("2d"));
      Game.context = main_canvas.getContext("2d");
      GameLevel.context = background_canvas.getContext("2d");
      main_canvas.width = window.innerWidth;
      main_canvas.height = window.innerHeight;
      background_canvas.width = window.innerWidth;
      background_canvas.height = window.innerHeight;
    }
  });

  createEffect(() => {
    if (homePageState.scrollDown) {
      console.log("scrolled");
      start();
    }
  });

  const start = () => {
    GameLevel.dev_mode = true;
    GameLevel.level_image = new Image();
    GameLevel.init();
    Camera.init();
    setControls();
    setInterval(() => {
      draw();
      update();
    }, 1000 / FPS);
  };

  const setControls = () => {
    addEventListener("keydown", (e: KeyboardEvent) => {
      keys[e.key] = true;
    });
    addEventListener("keyup", (e: KeyboardEvent) => {
      keys[e.key] = false;
    });

    addEventListener("wheel", (e) => {
      if (e.deltaY < 0) {
        Game.render_scale += 0.01;
      } else if (e.deltaY > 0) {
        Game.render_scale -= 0.01;
      }
    });
  };

  const draw = () => {
    if (!mainContext() || !backgroundContext()) return;
    mainContext()?.clearRect(0, 0, Camera.width, Camera.height);
    backgroundContext()?.clearRect(0, 0, Camera.width, Camera.height);
    Entity.renderAll();
    Player.render();
    GameLevel.render();
    // GameLevel.renderBoundaries();
    GameLevel.renderGrid();
  };
  const update = () => {
    Entity.updateAll();
    Player.update();
    Camera.update();
  };
  return (
    <div class="relative w-full">
      <canvas class="absolute" ref={background_canvas} />
      <canvas class="absolute" ref={main_canvas} />
    </div>
  );
};

export default Experience;
