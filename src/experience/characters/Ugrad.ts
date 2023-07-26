import { Character } from "../character";
import { Dialogue } from "../dialogue";
import { game_state } from "../game/state";
import { Sprite } from "../sprite";

export const ugrad_dialogues = {};

export class Ugrad extends Character {
  intro_complete = false;

  constructor() {
    super("Ugrad", 5, 90, 2, 2);
    this.sprite = new Sprite("ugrad-sheet", 128, 128, 1, {
      default: { column: 0, limit: 1, speed: 0, frame: 0 },
    });
    this.interactable_distance = 2.5
    this.collision_physics = true;
    this.is_interactable = true;
    this.current_dialogue = "game-start";
    // this.debug = true;
    this.dialogues = ["game-start", "movement-tutorial", "interact-tutorial"];
  }

  checkDialogues() {
    if (game_state.intro_complete) {
      if (!game_state.movement_tutorial_complete) {
        this.current_dialogue = "movement-tutorial";
        return;
      }
      if (!game_state.interact_tutorial_complete) {
        this.current_dialogue = "interact-tutorial-talk";
        return;
      }
    }
  }
}
