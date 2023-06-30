import { Entity } from "../entity";
import { Camera } from "../globals";
import { type Door } from "./entities";

export const openDoor = (door_id: string) => {
    const door = Entity.getEntity(door_id) as Door;
    if (!door) return;
    Camera.moveTo(door.world_position, 1, "ease-in-out");
    setTimeout(() => {
      door.unlock();
      door.open();
    }, 1000);
    setTimeout(() => {
      Camera.clearMove();
    }, 3000);
}