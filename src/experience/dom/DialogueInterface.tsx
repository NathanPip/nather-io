import { type Component, Show, For, createEffect, onCleanup } from "solid-js";
import {
  Dialogue,
  canSkipDialogue,
  currentDialogueLine,
  endDialogue,
  nextLine,
  setCurrentDialogueLine,
} from "../systems/dialogue";
import { Player } from "../player";

export const DialogueInterface: Component<{
  dialogue: Dialogue;
}> = (props) => {
  const clickHandler = () => {
    if (!canSkipDialogue()) return;
    nextLine(props.dialogue);
  };

  createEffect(() => {
    if (!currentDialogueLine()) return;
    if (!currentDialogueLine()!.choices) return;
    const eventHandler = (e: KeyboardEvent) => {
      const num = parseInt(e.key);
      if (isNaN(num)) return;
      const choices = Object.keys(currentDialogueLine()!.choices!);
      if (num > choices.length) return;
      currentDialogueLine()!.choices![choices[num - 1]]();
    };
    addEventListener("keydown", eventHandler);

    onCleanup(() => {
      removeEventListener("keydown", eventHandler);
    });
  });

  return (
    <div
      onClick={clickHandler}
      class="absolute bottom-12 left-1/2 flex max-h-fit w-2/3 -translate-x-1/2 rounded-lg border-4 border-black bg-stone-300 bg-opacity-90 p-4"
    >
      <img
        id="dialogue_img"
        class="mr-10 h-64 w-64 border-2 border-black p-1"
        src="nather-io-player-sheet.png"
      />
      <div class="flex w-full flex-col justify-between">
        <p class="pointer-events-none font-game text-4xl leading-[4rem]">
          {currentDialogueLine()?.line}
        </p>
        <Show when={currentDialogueLine()?.choices}>
          <ol class="ml-12 mt-6 flex list-decimal flex-col gap-2">
            <For each={Object.keys(currentDialogueLine()!.choices!)}>
              {(choice) => (
                <li
                  class="w-fit border-b-2 border-black p-1 px-3 py-1 font-game text-4xl transition-all duration-300 ease-in-out hover:cursor-pointer [&>p]:hover:-translate-y-1"
                  onClick={currentDialogueLine()!.choices![choice]}
                >
                  <p class="transition-transform duration-300">{choice}</p>
                </li>
              )}
            </For>
          </ol>
        </Show>
        <button
          class="ml-auto rounded-lg border-2 border-black p-1 px-3 py-1 font-game text-3xl transition-all duration-300 ease-in-out hover:-translate-y-1"
          onClick={() => {
            endDialogue();
            Player.uninteract();
          }}
        >
          Leave
        </button>
      </div>
    </div>
  );
};
