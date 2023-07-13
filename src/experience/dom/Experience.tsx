import { createSignal, type Component, onMount, createEffect, Show } from "solid-js";
import { useHomePageContext } from "~/routes";
import { Camera, Renderer, GameLevel, keys } from "~/experience/globals";
import { Door, Portal, TestCharacter } from "~/experience/game/entities";
import { DialogueInterface } from "./DialogueInterface";
import { Entity } from "../entity";
import { Player } from "../player";
import { Dialogue, currentDialogue } from "../dialogue";
import { loadDialogues } from "../game/dialogues";
import { Ugrad } from "../characters/Ugrad";
import GuidanceMenu from "./GuidanceMenu";

const Experience: Component = () => {
  const [homePageState] = useHomePageContext();

  const [prevFrame, setPrevFrame] = createSignal(0);

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
      Renderer.context = main_canvas.getContext("2d");
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
    // const testEntity = new TestEntity(1000, 1000, 64, 64);
    // const testEntity2 = new TestEntity2(300, 1000, 64, 64, testEntity.position);
    const character = new TestCharacter("test", 27, 56, 1, 1);
    const ugrad = new Ugrad();
    const game_start_portal = new Portal("game_start_portal", 11, 90, "entrance_portal");
    const entrance_portal = new Portal("entrance_portal", 46, 80);
    entrance_portal.setRotation(180);
    const door1 = new Door("left_door", 27, 54, true);
    const door2 = new Door("right_door", 33, 54, true);
  };

  const start = () => {
    Renderer.init();
    GameLevel.dev_mode = true;
    GameLevel.level_image = new Image();
    GameLevel.init();
    Player.init();
    Camera.init();
    setupEntities();
    loadDialogues();
    Entity.initAll();
    //Camera movement test
    // Camera.moveTo({x: 1500, y:900}, 1000, "ease-in-out");
    // Camera.zoom(1.25, 10000);
    // setTimeout(() => {
    //   Camera.clearMove();
    //   Camera.unzoom();
    // }, 10000)
    setControls();
    setPrevFrame(0);
    const loop = (timestep: number) => {
      const delta_time = (timestep - prevFrame()) / 1000;
      if(delta_time === 0) return;
      if(prevFrame() === 0){
        setPrevFrame(timestep);
        requestAnimationFrame(loop);
        return;
      }
      setPrevFrame(timestep);
      Renderer.elapsed_time += delta_time;
      Renderer.delta_time = delta_time;
      update(delta_time);
      draw();
      Renderer.current_frame++;
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
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
        Renderer.render_scale += 0.01;
      } else if (e.deltaY > 0) {
        Renderer.render_scale -= 0.01;
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
  const update = (delta_time: number) => {
    Entity.updateAll(delta_time);
    Player.update(delta_time);
    Camera.update(delta_time);
  };
  return (
    <div class="relative w-full h-screen">
      <canvas class="absolute" ref={background_canvas} />
      <canvas class="absolute" ref={main_canvas} />
      <GuidanceMenu />
      <Show when={currentDialogue() !== undefined}>
        <DialogueInterface dialogue={(currentDialogue() as Dialogue)}/>
      </Show>
      <div class="w-full h-full absolute pointer-events-none" />
    </div>
  );
};

export default Experience;
