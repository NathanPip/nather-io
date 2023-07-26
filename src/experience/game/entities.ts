import { Character } from "../character";
import { Entity } from "../entity";
import { Camera, Renderer } from "../globals";
import { Vector } from "../vector";
import { Player } from "../player";
import { Vector2d } from "../types";
import { easeInOut } from "../utils";
import { dialogues } from "./dialogues";
import { game_state } from "./state";

export class Boundary extends Entity {
  collision_physics = true;
  _renderDebug() {
    if (!Renderer.context) return;
    Renderer.renderFillRect(
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
  speed = 1;
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
    this.door = new Entity(
      `${id}-door`,
      this.world_position.x,
      this.world_position.y,
      2,
      1,
      "door"
    );
    this.door.is_static = false;
    this.door.collision_physics = true;
    this.is_interactable = true;
    this.door.setBoundingBox(this.width, this.height / 8, 0, this.height / 4);
    this.door.debug = true;
    this.addChild(this.door);
    this.opening = false;
    this.closing = false;
    if (auto) this.auto_door = auto;
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

  update(delta_time: number) {
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
      this.open_amt += delta_time;
    } else if (this.closing && this.open_amt >= 0) {
      this.open_amt -= delta_time;
    }
    let progress = this.open_amt / this.speed;
    progress = easeInOut(progress);
    if (progress <= 0 || progress >= 1) {
      this.opening = false;
      this.closing = false;
      return;
    }
    this.door.setLocalPosition(
      this.door.local_position.lerpFrom(
        { x: 0, y: 0 },
        {
          x: 2,
          y: 0,
        },
        progress
      )
    );
  }
}

export class Portal extends Entity {
  _dest_portal_name?: string;
  portal_exit: Entity;
  is_open = false;
  dest_vec?: Vector2d | Vector;
  constructor(
    id: string,
    x: number,
    y: number,
    dest_portal?: string | Vector | Vector2d
  ) {
    super(id, x, y, 1, 1);
    this.is_interactable = true;
    if (typeof dest_portal === "string") {
      this._dest_portal_name = dest_portal;
    } else if (dest_portal !== undefined) {
      this.dest_vec = dest_portal;
    }
    this.debug = true;
    this.collision_physics = true;
    this.interactable_distance = 2;
    this.render_interactable_bubble = true;
    this.portal_exit = new Entity(
      "portal-exit",
      this.world_position.x,
      this.world_position.y,
      1,
      1
    );
    this.portal_exit.is_static = false;
    this.portal_exit.setParent(this);
    this.portal_exit.setLocalPosition({ x: 0, y: 1 });
    this.portal_exit.debug = true;
    this.onInteract(() => {
      if (this.dest_vec) {
        Player.world_position.x = this.dest_vec.x;
        Player.world_position.y = this.dest_vec.y;
      }
    })
  }

  open() {
    this.is_open = true;
    this.is_interactable = true;
  }

  close() {
    this.is_open = false;
    this.is_interactable = false;
  }

  init() {
    if (this._dest_portal_name) {
      this.dest_vec = (
        Entity.getEntity(this._dest_portal_name) as Portal
      ).portal_exit.world_position;
    }
  }

}
