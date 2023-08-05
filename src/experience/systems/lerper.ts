import { Entity } from "../entity";
import { Vector2d } from "../types";
import { Vector, lerpVector } from "../vector";
import { lerp } from "../utils";
type LerperLerpType = {
  ent: Entity;
  prop: LerpingPropType;
  start: Vector2d | Vector | number;
  location: Vector2d | Vector | number;
  time: number;
  progress: number;
};

type LerpingPropType = "worldPosition" | "localPosition" | "rotation";

export class EntityLerper {
  static lerpActions: LerperLerpType[] = [];

  static addLerp(
    ent: Entity,
    prop: LerpingPropType,
    location: Vector2d | Vector | number,
    time: number
  ) {
    const lerpObj: LerperLerpType = {
      ent,
      start: { x: 0, y: 0 },
      prop,
      location,
      time,
      progress: 0,
    };
    if (prop === "localPosition") {
      lerpObj.start = {x: ent.local_position.x, y: ent.local_position.y};
    }
    if (prop === "worldPosition") {
      lerpObj.start = {x: ent.world_position.x, y: ent.world_position.y};
    }
    if (prop === "rotation") {
      lerpObj.start = ent.local_rotation;
    }
    this.lerpActions.push(lerpObj);
  }

  static cancelLerp(ent: Entity) {
    for (const lerp of this.lerpActions) {
      if (lerp.ent === ent) {
        this.lerpActions.splice(this.lerpActions.indexOf(lerp), 1);
      }
    }
  }

  static update(delta_time: number) {
    for (const lerpAction of this.lerpActions) {
      lerpAction.progress += delta_time / lerpAction.time;
      if (lerpAction.progress >= 1) {
        if (typeof lerpAction.location !== "number") {
          if (lerpAction.prop === "localPosition") {
            lerpAction.ent.setLocalPosition(lerpAction.location);
          }
          if (lerpAction.prop === "worldPosition") {
            lerpAction.ent.setWorldPosition(lerpAction.location);
          }
        } else {
          if (lerpAction.prop === "rotation") {
            lerpAction.ent.setRotation(lerpAction.location);
          }
        }
        this.lerpActions.splice(this.lerpActions.indexOf(lerpAction), 1);
        console.log("all done")
      } else {
        if (
          typeof lerpAction.location !== "number" &&
          typeof lerpAction.start !== "number"
        ) {
          if (lerpAction.prop === "localPosition") {
            console.log(lerpAction.start, lerpAction.ent.local_position)
            lerpAction.ent.setLocalPosition(
              lerpVector(
                lerpAction.start,
                lerpAction.location,
                lerpAction.progress
              )
            );
          }
          if (lerpAction.prop === "worldPosition") {
            lerpAction.ent.setWorldPosition(
              lerpVector(
                lerpAction.start,
                lerpAction.location,
                lerpAction.progress
              )
            );
          }
        } else if (
          typeof lerpAction.location === "number" &&
          typeof lerpAction.start === "number"
        ) {
          if (lerpAction.prop === "rotation") {
            lerpAction.ent.setRotation(
              lerp(lerpAction.start, lerpAction.location, lerpAction.progress)
            );
          }
        }
      }
    }
  }
}
