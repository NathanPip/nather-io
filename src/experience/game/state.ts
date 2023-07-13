import { createStore } from "solid-js/store";

export const [gameState, setGameState] = createStore({
    intro_complete: false,
    show_movement_tutorial: false,
    movement_tutorial_complete: false,
    show_interact_tutorial: false,
    interact_tutorial_complete: false,
})