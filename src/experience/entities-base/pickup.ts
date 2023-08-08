import { Character } from "./character";
import { Entity } from "../entity";
import { Player } from "../player";
import { type Vector2d } from "../types";
import { normalizeVector, type Vector } from "../vector";

export class Pickup extends Entity {
  owner?: Character | Player;
  owner_name?: string;
  tag = "Pickup";
  constructor(
    name: string,
    sprite?: string,
    owner?: string,
    position?: Vector2d | Vector
  ) {
    if (position) {
      super(name, position.x, position.y, 0.5, 0.5, sprite);
    } else {
      super(name, 0, 0, 0.5, 0.5, sprite);
    }
    this.deceleration = 7;
    this.is_static = false;
    this.is_interactable = true;
    this.render_interactable_bubble = true;
    this.interactable_distance = 1.5;
    this.owner_name = owner;
    this.onInteract(() => {
      if (!this.owner) {
        this.pickup(Player);
        Player.addToInventory(this);
      }
    });
  }

  pickup(owner: Character | string | undefined | Player) {
    if (owner === undefined) return;
    if (typeof owner === "string") {
      this.pickup(Entity.getEntity(owner));
    } else {
      this.owner = owner;
    }
    this.render_interactable_bubble = false;
  }

  init() {
    if (this.owner_name) {
      this.owner = Entity.getEntity(this.owner_name);
    }
  }

  drop() {
    if (!this.owner) return;
    this.owner.uninteract();
    Player.removeFromInventory(this);
    this.owner = undefined;
    this.render_interactable_bubble = true;
  }

  throw(direction: Vector2d | Vector) {
    this.drop();
    this.velocity.set(direction).multiplyTo(10);
  }

  hide() {
    this.rendering = false;
  }

  show() {
    this.rendering = true;
  }

  update(delta_time: number) {
    if (this.rendering) {
      if (this.owner) {
        this.setWorldPosition(
          (this.owner as Character).world_position
            .add({ x: 0.25, y: 0.5 })
            .add((this.owner as Character).velocity.multiply(0.05))
        );
      }
    }
  }
}
