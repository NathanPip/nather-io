import { createSignal } from "solid-js";
import { Entity } from "./entity";
import { Camera } from "./globals";
import { dialogues } from "./game/dialogues";

export class Character extends Entity {
    name: string;
    dialogues: string[] | undefined;
    current_dialogue: string;
    can_interact = true;
    display_dialogue = false;
    static characters: {[name: string]: Character} = {};
    constructor(
      name: string,
      x: number,
      y: number,
      width: number,
      height: number,
      sprite_src?: string
    ) {
      super(name, x, y, width, height, sprite_src);
      this.name = name;
      this.is_interactable = true;
      for(const c in Character.characters) {
        if (c === name) throw new Error("Character with name " + name + " already exists");
      }
      Character.characters[name] = (this);
      this.current_dialogue = `${name}-default`;
    }

    init() {
        if(this.dialogues === undefined) {
            this.can_interact = false;
        }
        this.checkDialogues();
    }

    defaultCheckDialogues() {
      if(!this.dialogues) return;
        for(const dialogue of this.dialogues) {
            if(dialogues[dialogue] === undefined) throw new Error("Dialogue with name " + dialogue + " does not exist");
            if(dialogues[dialogue].index < dialogues[dialogue].lines.length) {
                this.current_dialogue = dialogue;
                return;
            }
        }
        this.current_dialogue = `${this.name}-default`;
    }

    checkDialogues() {
        this.defaultCheckDialogues();
    }

    uninteract() {
        this.interacting = false;
        this.can_interact = true;
        // this.rendering_interactable = true;
        Camera.clearMove();
    }
  
    interact() {
        if(!this.can_interact) return;
        // this.rendering_interactable = false;
        this.can_interact = false;
        Camera.moveTo(this.world_position);
        this.checkDialogues();
        dialogues[this.current_dialogue].startDialogue();
    }
  
    update(delta_time: number) {

    }
  }