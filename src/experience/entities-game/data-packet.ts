import { Pickup } from "../entities-base/pickup";
import { Character } from "../entities-base/character";
import { startDialogue } from "../systems/dialogue";
import { Entity } from "../entity";
import { dialogues } from "../game/dialogues";
import { Sprite } from "../sprite";
import { action } from "../systems/action";
import { EntityLerper } from "../systems/lerper";

export class DataPacket extends Pickup {
  type = "data-packet";
  data_type = "default";
  constructor() {
    super("data-packet");
    this.addSprite(new Sprite("data-packet", 32, 32, 1));
  }
}

export class DataReceiver extends Entity {
  passing_data: string;
  constructor(x: number, y: number, passing_data: string) {
    super("data-receiver", x, y, 1, 1);
    const receiverSprite = new Sprite("data-receiver-sheet", 64, 64, 1, {
      default: { column: 0, limit: 5, speed: 3, frame: 0 },
      loading: { column: 1, limit: 2, speed: 8, frame: 0 },
      reject: { column: 2, limit: 5, speed: 3, frame: 0 },
      resolve: { column: 3, limit: 5, speed: 3, frame: 0 },
    });
    receiverSprite.playAnimation("default", true);
    this.addSprite(receiverSprite);
    this.collision_physics = true;
    this.is_interactable = true;
    this.render_interactable_bubble = true;
    this.interactable_distance = 2;
    this.passing_data = passing_data;

    this.onInteract((ent) => {
      console.log(ent);
      if (!ent) return;
      if (!ent.inHand) return;
      if (ent.inHand.type !== "data-packet") return;
      const packet = ent.inHand as DataPacket;
      action(() => {
        packet.drop();
        this.addChild(packet);
      }, 10)
        .run()
        .then(() => {
          EntityLerper.addLerp(
            packet,
            "localPosition",
            { x: -0.4, y: 0.25 },
            1
          );
          EntityLerper.addLerp(packet, "rotation", 0, 1);
        }, 1000).then(() => {
          console.log("done")
        }).then(() => {
          if(!this.sprites) return;
          this.sprites[0].playAnimation("loading", true);
        }, 1100).then(() => {
          if(!this.sprites) return;
          if(packet.data_type === this.passing_data) {
            this.sprites[0].playAnimation("resolve", true);
          } else {
            this.sprites[0].playAnimation("reject", true);
          }
        })
    });
  }

  update(delta_time: number) {}
}

export class TutorialDataPacket extends DataPacket {
  constructor() {
    super();
    this.data_type = "tutorial";
    this.onInteract(() => {
      startDialogue(dialogues["interact-tutorial-pickup"]);
    });
    this.setWorldPosition(
      Character.characters["Ugrad"].world_position.add({ x: 0, y: 1 })
    );
  }
}
