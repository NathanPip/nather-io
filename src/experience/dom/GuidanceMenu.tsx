import { Component, Show, createEffect, onCleanup } from "solid-js";
import { createStore } from "solid-js/store";
import { game_state, setUIState, uiState } from "../game/state";
import { startDialogue } from "../dialogue";
import { dialogues } from "../game/dialogues";
import { Character } from "../character";

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
    addEventListener("keydown", (e) => inputHandler(e));

    onCleanup(() => {
      removeEventListener("keydown", (e) => inputHandler(e));
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
      Character.characters["Ugrad"].interact();
    }
  }

  return (
    <div class="ml-auto flex w-fit flex-wrap justify-center">
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
  );
};

const GuidanceMenu: Component = () => {
  return (
    <div class="absolute left-0 top-0 m-6 w-1/4 rounded-lg border-2 border-stone-950 p-4">
      <Show when={uiState.show_movement_tutorial}>
        <MovementTutorial />
      </Show>
    </div>
  );
};

export default GuidanceMenu;
