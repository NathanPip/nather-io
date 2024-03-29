import { Component, Show, createEffect, onCleanup } from "solid-js";
import { createStore } from "solid-js/store";
import { game_state, setUIState, uiState } from "../game/state";
import { startDialogue } from "../systems/dialogue";
import { dialogues } from "../game/dialogues";
import { Character } from "../entities-base/character";

const MovementTutorial = () => {
  const [keyPressed, setKeysPressed] = createStore({
    w: false,
    a: false,
    s: false,
    d: false,
  });

  createEffect(() => {
    const inputHandler = (e: KeyboardEvent) => {
      if (e.key === "w") {
        setKeysPressed("w", true);
        game_state.movement_tutorial_keys.up = true;
        checkComplete();
      }
      if (e.key === "a") {
        setKeysPressed("a", true);
        game_state.movement_tutorial_keys.left = true;
        checkComplete();
      }
      if (e.key === "s") {
        setKeysPressed("s", true);
        game_state.movement_tutorial_keys.down = true;
        checkComplete();
      }
      if (e.key === "d") {
        setKeysPressed("d", true);
        game_state.movement_tutorial_keys.right = true;
        checkComplete();
      }
    };
    addEventListener("keydown", inputHandler);

    onCleanup(() => {
      removeEventListener("keydown", inputHandler);
    });
  });

  // Runs everytime a key is pressed

  const checkComplete = () => {
    if(
      game_state.movement_tutorial_keys.up &&
      game_state.movement_tutorial_keys.down &&
      game_state.movement_tutorial_keys.left &&
      game_state.movement_tutorial_keys.right 
    ) {
      game_state.movement_tutorial_complete =  true;
      setUIState("show_movement_tutorial", false);
      startDialogue(dialogues["interact-tutorial-start"]);
    }
  }

  return (
    <>
    <p class="flex-1 font-bold text-xl">Press the WASD keys to move your Ugra around</p>
    <div class="ml-auto mt-auto flex w-fit flex-wrap justify-center flex-2">
      <div class="w-full">
        <div class={`w-fit mx-auto transition-all ${keyPressed.w ? "bg-stone-900" : ""}`}>
          <img
            class={`w-16 mx-auto transition-all ${
              keyPressed.w ? "invert" : ""
            }`}
            src="./game-icons/W-Icon.svg"
          />
        </div>
      </div>
      <div class={`m-4 transition-all ${keyPressed.a ? "bg-stone-900" : ""}`}>
        <img
          class={`w-16  transition-all ${keyPressed.a ? "invert" : ""}`}
          src="./game-icons/A-Icon.svg"
        />
      </div>
      <div class={`m-4 transition-all ${keyPressed.s ? "bg-stone-900" : ""}`}>
        <img
          class={`w-16  transition-all ${keyPressed.s ? "invert" : ""}`}
          src="./game-icons/S-Icon.svg"
        />
      </div>
      <div class={`m-4 transition-all ${keyPressed.d ? "bg-stone-900" : ""}`}>
        <img
          class={`w-16  transition-all ${keyPressed.d ? "invert" : ""}`}
          src="./game-icons/D-Icon.svg"
        />
      </div>
    </div>
    </>
  );
};

const InteractTutorial = () => {
  return <p class="flex-1 font-bold text-xl">Approach Ugrad and press E</p>
}

const GuidanceMenu: Component = () => {
  return (
    <div class="absolute left-0 top-0 m-6 w-1/3 rounded-lg border-2 border-stone-950 p-4 min-h-[20vh]">
      <h2 class="mx-auto text-center text-2xl font-bold mb-4 tracking-widest border-b-2 border-b-stone-900">UGRAS Guidance</h2>
      <div class="flex justify-between mt-auto">
      <Show when={uiState.show_movement_tutorial}>
        <MovementTutorial />
      </Show>
      <Show when={uiState.show_interact_tutorial}>
        <InteractTutorial />
      </Show>
      </div>
    </div>
  );
};

export default GuidanceMenu;
