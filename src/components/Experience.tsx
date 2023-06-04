"use client";
import { createSignal, type Component, onMount, createEffect } from "solid-js";
import { createStore } from "solid-js/store";
import { useHomePageContext } from "~/routes";

type Vector = { x: number; y: number };

class Entity {
  position: Vector;
  width: number;
  height: number;
  static entities: Entity[] = [];
  static context: CanvasRenderingContext2D | null;

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

class Camera {
  static position: Vector = { x: 0, y: 0 };
  static width = 0;
  static height = 0;
  static render_scale = 2;
  static grid_size = 64;
}

class GameLevel {
  static window_width: number;
  static window_height: number;
  static camera_offset: Vector = { x: 0, y: 0 };
  static current_level = 0;
  static levels: { [key: number]: GameLevel } = {};
  static dev_mode = false;
  static context: CanvasRenderingContext2D | null;
  static level_size = 64;
  static image_loaded = false;
  static level_image: any;

  static init() {
    if(!GameLevel.context || !GameLevel.level_image) return;
    GameLevel.level_image.src = "./nather-io-map.png"
    GameLevel.level_image.onload = () => {
      GameLevel.image_loaded = true;
    };
  }

  static render() {
    if(!GameLevel.image_loaded) return;
    GameLevel.context!.drawImage(GameLevel.level_image, Camera.position.x, Camera.position.y, GameLevel.level_image.width*Camera.render_scale, GameLevel.level_image.height*Camera.render_scale);
  }

  static renderDebug() {
    // if (!GameLevel.dev_mode) return;
    for (let i = 0; i < this.level_size; i++) {
      for (let j = 0; j < this.level_size; j++) {
        if (GameLevel.context == null) return;
        GameLevel.context.strokeRect(
          j * Camera.grid_size * Camera.render_scale + Camera.position.x,
          i * Camera.grid_size * Camera.render_scale + Camera.position.y,
          Camera.grid_size * Camera.render_scale,
          Camera.grid_size * Camera.render_scale
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
  const [backgroundContext, setBackgroundContext] = createSignal<CanvasRenderingContext2D | null>(null)

  const [keymaps, setKeyMaps] = createStore<{ [key: string]: boolean }>({
    w: false,
    d: false,
    s: false,
    a: false,
  });

  onMount(() => {
    Camera.width = window.innerWidth;
    Camera.height = window.innerHeight;
    window.addEventListener("resize", () => {
      Camera.width = window.innerWidth;
      Camera.height = window.innerHeight;
    });
  });

  createEffect(() => {
    if (main_canvas && background_canvas) {
      console.log("ran")
      setMainContext(main_canvas.getContext("2d"));
      setBackgroundContext(background_canvas.getContext("2d"));
      Entity.context = main_canvas.getContext("2d");
      GameLevel.context = background_canvas.getContext("2d");
      main_canvas.width = window.innerWidth;
      main_canvas.height = window.innerHeight;
      background_canvas.width = window.innerWidth;
      background_canvas.height = window.innerHeight;
    }
  })

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
    setControls();
    setInterval(() => {
      draw();
      update();
    }, 1000/FPS);
  };

  const setControls = () => {
    addEventListener("keydown", (e: KeyboardEvent) => {
      setKeyMaps(e.key, true);
    });
    addEventListener("keyup", (e: KeyboardEvent) => {
      setKeyMaps(e.key, false);
    });

    addEventListener("wheel", (e) => {
      if (e.deltaY < 0) {
        Camera.render_scale += 0.01;
      } else if (e.deltaY > 0) {
        Camera.render_scale -= 0.01;
      }
    });
  };

  const draw = () => {
    if (!mainContext() || !backgroundContext()) return;
    mainContext()?.clearRect(0, 0, Camera.width, Camera.height);
    backgroundContext()?.clearRect(0, 0, Camera.width, Camera.height);
    Entity.renderAll();
    GameLevel.render();
    GameLevel.renderDebug();
  };
  const update = () => {
    if (keymaps.w) Camera.position.y += 5;
    if (keymaps.d) Camera.position.x -= 5;
    if (keymaps.s) Camera.position.y -= 5;
    if (keymaps.a) Camera.position.x += 5;
    Entity.updateAll();
  };
  return (
    <div class="relative w-full">
      <canvas class="absolute" ref={background_canvas} />
      <canvas class="absolute" ref={main_canvas} />
    </div>
  );
};

export default Experience;
