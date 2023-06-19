import { Camera, Entity, Game, Player, Vector } from "./objects";

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
