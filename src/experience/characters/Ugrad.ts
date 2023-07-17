import { Character } from "../character";
import { Dialogue } from "../dialogue";
import { game_state } from "../game/state";

export const ugrad_dialogues = {

}

export class Ugrad extends Character { 

    intro_complete = false;

    constructor() {
      super("Ugrad", 7, 91, 1, 1);
      this.is_interactable = true;
      this.current_dialogue = "game-start";
      this.debug = true;
      this.dialogues = ["gmae-start", "movement-tutorial", "interact-tutorial"];
    }
  
    checkDialogues() {
      if(game_state.intro_complete) {
        if (!game_state.movement_tutorial_complete){
          this.current_dialogue = "movement-tutorial";
          return;
        }
        if(!game_state.interact_tutorial_complete) {
          this.current_dialogue = "interact-tutorial";
          return;
        }
      }
    }
  }
  