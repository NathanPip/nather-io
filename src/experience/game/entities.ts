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

export class TestEntity extends Entity {
  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    sprite_src?: string
  ) {
    super(x, y, width, height, sprite_src);
    this.is_interactable = true;
    this.debug = true;
  }

  interact() {
    console.log("interacted_with");
    Camera.moveTo(this.world_position, 200, "ease-in-out");
    // Camera.zoom(1.1, 300);
  }
}

export class TestEntity2 extends TestEntity {
  location: Vector | undefined;
  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    location: Vector,
    sprite_src?: string
  ) {
    super(x, y, width, height, sprite_src);
    this.is_interactable = true;
    this.debug = true;
    this.location = location;
  }
  interact() {
    if (!this.location) return;
    Camera.moveTo(this.location, 200, "ease-in-out");
    setTimeout(() => {
      Camera.clearMove();
    }, 4000);
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
  opening: boolean;
  closing: boolean;
  is_open: boolean;
  door: Entity;
  speed = 30;
  open_amt = 0;
  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
  ) {
    super(x, y, width, height);
    this.is_open = false;
    this.door = new Entity(this.world_position.x, this.world_position.y, 2, 1, "./sprites/Top_Door.png");
    this.door.is_static = false;
    this.door.collision_physics = true;
    this.is_interactable = true;
    this.door.setBoundingBox(this.width, this.height / 8, 0, this.height / 4 );
    this.door.debug = true;
    // this.door.setOriginPoint(this.door.width/2, this.door.height/2);
    this.addChild(this.door);
    // this.door.setLocalPosition({x: 5, y: 2});
    this.opening = false;
    this.closing = false;
    this.setRotation(90);
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
    // this.setRotation(this.world_rotation + 1);
    if (this.distance_to_player < 2 && !this.is_open) {
      this.open();
      this.is_open = true;
      console.log("open");
    } else if (this.distance_to_player > 3 && this.is_open) {
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