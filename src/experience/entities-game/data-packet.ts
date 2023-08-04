import { Pickup } from "../entities-base/pickup";
import { Character } from "../entities-base/character";
import { startDialogue } from "../systems/dialogue";
import { Entity } from "../entity";
import { dialogues } from "../game/dialogues";
import { Sprite } from "../sprite";

export class DataPacket extends Pickup {
  type = "data-packet";
  data_type = "default";
  constructor() {
    super("data-packet");
    this.addSprite(new Sprite("data-packet", 32, 32, 1));
  }
}

export class DataReceiver extends Entity {
  constructor(x: number, y: number) {
    super("data-receiver", x, y, 1, 1);
    const receiverSprite = new Sprite("data-receiver-sheet", 64, 64, 1, {
      default: { column: 0, limit: 5, speed: 3, frame: 0 },
      loading: { column: 1, limit: 5, speed: 8, frame: 0 },
      reject: { column: 2, limit: 5, speed: 3, frame: 0 },
      resolve: { column: 3, limit: 5, speed: 3, frame: 0 },
    });
    receiverSprite.playAnimation("default", true);
    this.addSprite(receiverSprite);
    this.collision_physics = true;
    this.is_interactable = true;
    this.render_interactable_bubble = true;
    this.interactable_distance = 2;

    this.onInteract((ent) => {
      console.log(ent)
      if (!ent) return;
      if(!ent.inHand) return;
      if(ent.inHand.type !== "data-packet") return;
      const packet = ent.inHand as DataPacket;
      packet.drop();
      this.addChild(packet);
      packet.setRotation(0);
      packet.setLocalPosition({ x: .9, y: .25 });
    })
  }

  update(delta_time: number) {

  }

}

export class TutorialDataPacket extends DataPacket {
  constructor() {
    super();
    this.onInteract(() => {
      startDialogue(dialogues["interact-tutorial-pickup"]);
    });
    this.setWorldPosition(
      Character.characters["Ugrad"].world_position.add({ x: 0, y: 1 })
    );
  }
}
