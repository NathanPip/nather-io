import { Character } from "../character";
import { Entity } from "../entity";
import { Camera, Game } from "../globals";
import { Vector } from "../objects";
import { dialogues } from "./dialogues";

export class Boundary extends Entity {
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
