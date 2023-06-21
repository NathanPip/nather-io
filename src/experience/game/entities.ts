import { Character } from "../character";
import { Entity } from "../entity";
import { Camera, Game } from "../globals";
import { Vector } from "../objects";
import { Vector2d } from "../types";
import { easeInOut } from "../utils";
import { dialogues } from "./dialogues";

export class Boundary extends Entity {
  collision_physics = true;
  renderDebug() {
    if (!Game.context) return;
    Game.renderFillRect(
      this.position.x,
      this.position.y,
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
    Camera.moveTo(this.position, 200, "ease-in-out");
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
  original_position: Vector2d;
  x_translation = 0;
  y_translation = 0;
  opening: boolean;
  closing: boolean;
  is_open: boolean;
  speed = 30;
  open_amt = 0;
  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    sprite_src: string
  ) {
    super(x, y, width, height, sprite_src);
    this.is_interactable = true;
    this.collision_physics = true;
    this.debug = true;
    this.is_open = false;
    this.opening = false;
    this.closing = false;
    this.is_static = false;
    this.original_position = {
      x: this.position.x,
      y: this.position.y,
    };
  }

  open() {
    this.closing = false;
    this.opening = true;
  }
  close() {
    this.opening = false;
    this.closing = true;
  }

  updateOriginalPosition() {
    this.original_position = {
      x: this.position.x,
      y: this.position.y,
    };
  }

  update() {
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
    }
    this.position.lerpFrom(
      this.original_position,
      {
        x: this.original_position.x + this.x_translation * this.width,
        y: this.original_position.y + this.y_translation * this.height,
      },
      progress
    );
  }
}

export class TopDoor extends Door {
  constructor(x: number, y: number, width: number, height: number) {
    super(x, y, width, height, "./sprites/Top_Door.png");
    this.x_translation = 1;
    this.y_translation = 0;
    this.setBoundingBox(this.width, this.height / 8, 0, this.height / 6);
  }
}
export class BottomDoor extends Door {
  constructor(x: number, y: number, width: number, height: number) {
    super(x, y, width, height, "./sprites/Top_Door.png");
    this.x_translation = -1;
    this.y_translation = 0;
    this.setBoundingBox(this.width, this.height / 8, 0, this.height - this.height / 6);
  }
}
export class LeftDoor extends Door {
  constructor(x: number, y: number, width: number, height: number) {
    super(x, y, width, height, "./sprites/Top_Door.png");
    this.x_translation = 0;
    this.y_translation = 1;
    this.setBoundingBox(this.width / 8, this.height, this.width/6, this.height);
  }
}
export class RightDoor extends Door {
  constructor(x: number, y: number, width: number, height: number) {
    super(x, y, width, height, "./sprites/Top_Door.png");
    this.x_translation = 1;
    this.y_translation = 0;
    this.setBoundingBox(this.width / 8, this.height, this.width - this.width/6, this.height);
  }
}
