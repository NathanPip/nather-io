import { Pickup } from "../base-entities/pickup";
import { Character } from "../character";
import { startDialogue } from "../dialogue";
import { dialogues } from "../game/dialogues";
import { Sprite } from "../sprite";

export class DataPacket extends Pickup {
  constructor() {
    super("data-packet", "./sprites/data-packet.png");
    this.sprite = new Sprite("/sprites/data-packet.png", 64, 64, 0.5);
  }
}

export class TutorialDataPacket extends DataPacket {
  constructor() {
    super();
    this.onInteract(() => {
      startDialogue(dialogues["interact-tutorial-pickup"]);
    })
    this.setWorldPosition(Character.characters["Ugrad"].world_position.add({x: 0, y:1}));
  }
}
