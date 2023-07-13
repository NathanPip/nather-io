import { Component, createEffect, onCleanup } from "solid-js";
import { createStore } from "solid-js/store";

const MovementTutorial = () => {
  const [keyPressed, setKeysPressed] = createStore({
    w: false,
    a: false,
    s: false,
    d: false,
  });

  createEffect(() => {
    const inputHandler = (e: KeyboardEvent) => {
      if (e.key === "w") setKeysPressed("w", true);
      if (e.key === "a") setKeysPressed("a", true);
      if (e.key === "s") setKeysPressed("s", true);
      if (e.key === "d") setKeysPressed("d", true);
    };
    addEventListener("keydown", (e) => inputHandler(e));

    onCleanup(() => {
      removeEventListener("keydown", (e) => inputHandler(e));
    });
  });

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
      <MovementTutorial />
    </div>
  );
};

export default GuidanceMenu;
