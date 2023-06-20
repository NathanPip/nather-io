import { createSignal, type Component, onMount, createEffect, Show } from "solid-js";
import { useHomePageContext } from "~/routes";
import { Camera, Game, GameLevel, keys } from "~/experience/globals";
import { TestCharacter, TestEntity, TestEntity2 } from "~/experience/game/entities";
import { DialogueInterface } from "./DialogueInterface";
import { Entity } from "../entity";
import { Player } from "../player";
import { currentDialogue } from "../dialogue";
import { loadDialogues } from "../game/dialogues";

const Experience: Component = () => {
  const [homePageState] = useHomePageContext();


  let main_canvas: HTMLCanvasElement | undefined;
  let background_canvas: HTMLCanvasElement | undefined;
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
      start();
    }
  });

  const setupEntities = () => {
    const testEntity = new TestEntity(1000, 1000, 64, 64);
    // const testEntity2 = new TestEntity2(300, 1000, 64, 64, testEntity.position);
    const character = new TestCharacter("test", 300, 1000, 64, 64);
  };

  const start = () => {
    Game.init();
    GameLevel.dev_mode = true;
    GameLevel.level_image = new Image();
    GameLevel.init();
    Player.init();
    Camera.init();
    setupEntities();
    loadDialogues();
    Entity.entities.forEach(e => {e.init()})
    //Camera movement test
    Camera.moveTo({x: 1500, y:900}, 1000, "ease-in-out");
    Camera.zoom(1.25, 10000);
    setTimeout(() => {
      Camera.clearMove();
      Camera.unzoom();
    }, 10000)
    setControls();
    setInterval(() => {
      update();
      draw();
      Game.current_frame++;
    }, 1000 / Game.FPS);
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
    // GameLevel.renderGrid();
  };
  const update = () => {
    Entity.updateAll();
    Player.update();
    Camera.update();
  };
  return (
    <div class="relative w-full h-screen">
      <canvas class="absolute" ref={background_canvas} />
      <canvas class="absolute" ref={main_canvas} />
      <Show when={currentDialogue() !== undefined}>
        <DialogueInterface dialogue={currentDialogue()}/>
      </Show>
    </div>
  );
};

export default Experience;
