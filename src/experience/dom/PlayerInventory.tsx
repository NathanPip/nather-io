import { type Component, For } from "solid-js";
import { uiState } from "../game/state";
import { type Pickup } from "../base-entities/pickup";

const PlayerInventory: Component = () => {
  const itemClickHandler = (item: Pickup) => {
    if (uiState.inHand === item) {
      item.hide();
    } else {
      item.show();
    }
  };

  return (
    <div class="absolute bottom-0 mb-4 flex w-full justify-center gap-4 px-12">
      <For each={uiState.player_inventory}>
        {(item) => (
          <div
            onClick={() => {
              itemClickHandler(item);
            }}
            class={`flex border-2 border-stone-900 p-1 transition-all hover:cursor-pointer ${
              uiState.inHand === item ? "-translate-y-3" : ""
            }`}
          >
            <img src={item.sprite?.sprite_img.src}></img>
          </div>
        )}
      </For>
    </div>
  );
};

export default PlayerInventory;
