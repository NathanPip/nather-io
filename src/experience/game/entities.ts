import { Character } from "../character";
import { Entity } from "../entity";
import { Camera, Game } from "../globals";
import { Vector } from "../objects";
import { Vector2d } from "../types";
import { easeInOut } from "../utils";
import { dialogues } from "./dialogues";

export class Boundary extends Entity {
  collision_physics = true;
  _renderDebug() {
    if (!Game.context) return;
    Game.renderFillRect(
      this.world_position.x,
      this.world_position.y,
      this.width,
      this.height,
      `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${
        Math.random() * 255
      }, .5)`
    );
  }
}

export class TestCharacter extends Character {
  constructor(
    name: string,
    x: number,
    y: number,
    width: number,
    height: number,
    sprite_src?: string
  ) {
    super(name, x, y, width, height, sprite_src);
    this.is_interactable = true;
    this.debug = true;
    this.dialogues = ["test-first", "test-second"];
  }
}

export class Door extends Entity {
  x_translation = 0;
  y_translation = 0;
  locked: boolean;
  auto_door = false;
  opening: boolean;
  closing: boolean;
  is_open: boolean;
  door: Entity;
  speed = 30;
  open_amt = 0;
  constructor(
    id: string,
    x: number,
    y: number,
    locked?: boolean,
    auto?: boolean
  ) {
    super(id, x, y, 2, 1);
    this.is_open = false;
    this.locked = locked || false;
    this.door = new Entity(`${id}-door`, this.world_position.x, this.world_position.y, 2, 1, "./sprites/Top_Door.png");
    this.door.is_static = false;
    this.door.collision_physics = true;
    this.is_interactable = true;
    this.door.setBoundingBox(this.width, this.height / 8, 0, this.height / 4 );
    this.door.debug = true;
    this.addChild(this.door);
    this.opening = false;
    this.closing = false;
    if(auto) this.auto_door = auto;
  }

  unlock() {
    this.locked = false;
  }

  lock() {
    this.locked = true;
  }

  open() {
    this.closing = false;
    this.opening = true;
  }
  close() {
    this.opening = false;
    this.closing = true;
  }

  update() {
    if (this.locked) return;
    if (this.distance_to_player < 2 && !this.is_open && this.auto_door) {
      this.open();
      this.is_open = true;
      console.log("open");
    } else if (this.distance_to_player > 3 && this.is_open && this.auto_door) {
      this.close();
      this.is_open = false;
      console.log("close");
    }
    if (this.opening && this.open_amt <= this.speed) {
      this.open_amt += 1;
    } else if (this.closing && this.open_amt >= 0) {
      this.open_amt -= 1;
    }
    let progress = this.open_amt / this.speed;
    progress = easeInOut(progress);
    if (progress === 0 || progress === 1) {
      this.opening = false;
      this.closing = false;
      return
    }
    this.door.setLocalPosition(this.door.local_position.lerpFrom(
      {x: 0, y: 0},
      {
        x: 2,
        y: 0,
      },
      progress
    ));
  }
}