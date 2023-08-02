import { Pickup } from "../base-entities/pickup";
import { Character } from "../character";
import { startDialogue } from "../dialogue";
import { Entity } from "../entity";
import { dialogues } from "../game/dialogues";
import { Sprite } from "../sprite";

export class DataPacket extends Pickup {
  constructor() {
    super("data-packet");
    this.addSprite(new Sprite("data-packet", 64, 64, 0.5));
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
    // this.setBoundingBox(.5,.5,.5,.5)
  }

  update(delta_time: number) {
    // if(this.world_rotation < 90)
      // this.setRotation(this.world_rotation + 20 * delta_time);
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
