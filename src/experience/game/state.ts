import { createStore } from "solid-js/store";
import {type Part} from "solid-js/store/types"

export const game_state = {
  intro_complete: false,
  show_movement_tutorial: false,
  movement_tutorial_complete: false,
  show_interact_tutorial: false,
  interact_tutorial_complete: false,
  movement_tutorial_keys: {
    up: false,
    down: false,
    left: false,
    right: false,
  },
};

export const [uiState, _setUIState] = createStore({
  show_guidance: false,
  show_movement_tutorial: false,
});

export function setUIState(object: Part<typeof uiState>, value: boolean) {
  _setUIState(object, value);
  _setUIState("show_guidance", value);
}
