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
    const sprite = new Sprite("data-packet", 64, 64, .5, {
      default: { column: 0, limit: 4, speed: 4, frame: 0 },
      loading: { column: 1, limit: 4, speed: 8, frame: 0 },
    })
    sprite.playAnimation("default", true);
    this.addSprite(sprite);
  }

  setData(data: string) {
    this.data_type = data;
  }
}

export class DataReceiver extends Entity {
  failed = false;
  passed = false;
  passing_data: string;
  constructor(x: number, y: number, passing_data: string) {
    super("data-receiver", x, y, 2, 2);
    const receiverStand = new Sprite("data-receiver-stand", 128, 128, 1);
    const receiverSprite = new Sprite("data-receiver-sheet", 64, 64, 1, {
      default: { column: 0, limit: 5, speed: 3, frame: 0 },
      loading: { column: 1, limit: 2, speed: 8, frame: 0 },
      resolve: { column: 2, limit: 5, speed: 3, frame: 0 },
      reject: { column: 3, limit: 5, speed: 3, frame: 0 },
    });
    receiverSprite.offset = { x: 64, y: 64};
    receiverSprite.lock_rotation = true;
    receiverSprite.playAnimation("default", true);
    this.addSprite(receiverStand);
    this.addSprite(receiverSprite);
    this.collision_physics = true;
    this.is_interactable = true;
    this.render_interactable_bubble = true;
    this.interactable_distance = 2.5;
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
            { x: -0.3, y: .75 },
            1
          );
          EntityLerper.addLerp(packet, "rotation", 0, 1);
        }, 1000).then(() => {
          console.log("done")
        }).then(() => {
          if(!this.sprites || !packet.sprites) return;
          this.sprites[1].playAnimation("loading", true);
          packet.sprites[0].playAnimation("loading", true);
        }, 1100).then(() => {
          if(!this.sprites || !packet.sprites) return;
          packet.sprites[0].playAnimation("default", true);
          if(packet.data_type === this.passing_data) {
            this.sprites[1].playAnimation("resolve", true);
            this.onPass();
            this.passed = true;
          } else {
            this.sprites[1].playAnimation("reject", true);
            this.onFail();
            this.failed = true;
          }
        })
    });
  }

  onPass() {}

  onFail() {}

  update(delta_time: number) {}
}

export class TutorialDataPacket extends DataPacket {
  picked_up = false;
  constructor() {
    super();
    this.id = "tutorial-packet";
    this.data_type = "tutorial";
    this.onInteract(() => {
      if(!this.picked_up) {
        startDialogue(dialogues["interact-tutorial-pickup"]);
        this.picked_up = true;
      }
    });
    this.setWorldPosition(
      Character.characters["Ugrad"].world_position.add({ x: 0, y: 1 })
    );
  }
}

export class TutorialDataReceiver extends DataReceiver {
  constructor(x: number, y: number) {
    super(x, y, "enter");
    this.id = "tutorial-receiver";
  }
  onPass () {
    if(!this.passed) {
      action(() => {/*nothing*/}, 700).run().then(() => {
        startDialogue(dialogues["interact-tutorial-receiver-pass"]);
      })
    }
  }
  onFail (){
    if(!this.failed){
      action(() => {/*nothing*/}, 700).run().then(() => {
        startDialogue(dialogues["interact-tutorial-receiver-fail"]);
      })
    }
  }
}
