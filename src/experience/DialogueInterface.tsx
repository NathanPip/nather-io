import { createSignal, type Component, Show, createEffect } from "solid-js";
import { type Character } from "./objects";

export const DialogueInterface: Component<{
  character: Character | undefined;
}> = (props) => {

  const [currentLine, setCurrentLine] = createSignal("");

  // createEffect(() => {
  // })

  return (
    <Show when={props.character}>
      <div class="absolute w-2/3 -translate-x-1/2 left-1/2 top-3/4 bg-opacity-90 bg-stone-300 border-4 border-black flex rounded-lg p-4 ">
        <img id="dialogue_img" class="mr-10 w-1/4 border-2 p-1 border-black" src="nather-io-player-sheet.png" />
        <p class="text-5xl leading-[4rem] font-game">
          One ass, two ass, three ass, catch a bass throwin cash, love the stache but bitch you're trash,
          never seen a titty sad, but my twink boi is bad, call me mom I'll fuck your dad
        </p>
      </div>
    </Show>
  );
};
