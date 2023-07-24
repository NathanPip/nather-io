import { createStore } from "solid-js/store";
import {type Part} from "solid-js/store/types"
import { Pickup } from "../base-entities/pickup";

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

type TUIState = {
  show_guidance: boolean;
  show_movement_tutorial: boolean;
  player_inventory: Pickup[];
  inHand?: Pickup;
}

export const [uiState, setUIState] = createStore({
  show_guidance: true,
  show_movement_tutorial: false,
  player_inventory: [],
  inHand: undefined,
} as TUIState);
