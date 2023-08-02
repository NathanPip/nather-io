import {
  createSignal,
  type Component,
  onMount,
  createEffect,
  Show,
} from "solid-js";
import { useHomePageContext } from "~/routes";
import { Camera, Renderer, GameLevel, keys } from "~/experience/globals";
import { Door, Portal, TestCharacter } from "~/experience/game/entities";
import { DialogueInterface } from "./DialogueInterface";
import { Entity } from "../entity";
import { Player } from "../player";
import { Dialogue, currentDialogue, displayDialogue } from "../dialogue";
import { loadDialogues } from "../game/dialogues";
import { Ugrad } from "../characters/Ugrad";
import GuidanceMenu from "./GuidanceMenu";
import { uiState } from "../game/state";
import { Pickup } from "../base-entities/pickup";
import { Sprite } from "../sprite";
import PlayerInventory from "./PlayerInventory";
import { DataReceiver } from "../game-entities/data-packet";
import { imagesLoaded, loadImages } from "../game/imagePool";

const Experience: Component = () => {
  const [homePageState] = useHomePageContext();
  const [loading, setLoading] = createSignal(true);
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
    });
    loadImages();
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
      Renderer.default_render_scale = window.innerWidth/1280;
      Renderer.render_scale = window.innerWidth/1280;
    }
  });

  createEffect(() => {
    if (homePageState.scrollDown && imagesLoaded()) {
      start();
    }
  });

  const setupEntities = () => {
    // const testEntity = new TestEntity(1000, 1000, 64, 64);
    // const testEntity2 = new TestEntity2(300, 1000, 64, 64, testEntity.position);
    const ugrad = new Ugrad();
    // const testPickup = new Pickup("test_pickup")
    // testPickup.sprite = new Sprite("/sprites/data-packet.png", 64, 64, .5);
    // testPickup.setWorldPosition({x:5, y:94});
    // testPickup.show();
    // const door = new Door("door-1", 5, 94);
    const receiver = new DataReceiver(9, 90);
    const game_start_portal = new Portal(
      "game_start_portal",
      11,
      90,
      "entrance_portal"
    );
    const entrance_portal = new Portal("entrance_portal", 46, 80);
    entrance_portal.setRotation(180);
  };

  const start = () => {
    GameLevel.dev_mode = true;
    GameLevel.level_image = new Image();
    Renderer.init();
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
      if (delta_time === 0) return;
      if (prevFrame() === 0) {
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
    setLoading(false);
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
    Player.render();
    Entity.renderAll();
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
      <div style={{"image-rendering": "crisp-edges"}} class="relative h-screen w-full">
        <canvas style={{"image-rendering": "crisp-edges"}} class="absolute" ref={background_canvas} />
        <canvas style={{"image-rendering": "crisp-edges"}} class="absolute" ref={main_canvas} />
        <PlayerInventory />
        <Show when={uiState.show_guidance}>
          <GuidanceMenu />
        </Show>
        <Show when={displayDialogue()}>
          <DialogueInterface dialogue={currentDialogue() as Dialogue} />
        </Show>
        <div class="pointer-events-none absolute h-full w-full" />
      </div>
  );
};

export default Experience;
