import { createSignal } from "solid-js";
import { Entity } from "../entity";
import { Camera } from "../systems/globals";
import { dialogues } from "../game/dialogues";
import { startDialogue } from "../systems/dialogue";
import { Pickup } from "./pickup";

export class Character extends Entity {
  name: string;
  tag = "Character";
  dialogues: string[] | undefined;
  inventory: Pickup[] = [];
  inHand?: Pickup;
  current_dialogue: string;
  can_interact = true;
  display_dialogue = false;
  static characters: { [name: string]: Character } = {};
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
    this.render_interactable_bubble = true;
    this.onInteract(() => {
      if (!this.can_interact) return;
      // this.rendering_interactable = false;
      this.can_interact = false;
      Camera.moveTo({
        x: this.world_position.x + this.width / 2,
        y: this.world_position.y + this.height / 2,
      });
      this.checkDialogues();
      startDialogue(dialogues[this.current_dialogue]);
    });
    for (const c in Character.characters) {
      if (c === name)
        throw new Error("Character with name " + name + " already exists");
    }
    Character.characters[name] = this;
    this.current_dialogue = `${name}-default`;
  }

  init() {
    if (this.dialogues === undefined) {
      this.can_interact = false;
    }
    this.checkDialogues();
  }

  defaultCheckDialogues() {
    if (!this.dialogues) return;
    for (const dialogue of this.dialogues) {
      if (dialogues[dialogue] === undefined)
        throw new Error("Dialogue with name " + dialogue + " does not exist");
      if (dialogues[dialogue].index < dialogues[dialogue].lines.length) {
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

  update(delta_time: number) {}
}
