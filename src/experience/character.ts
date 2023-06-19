import { Entity } from "./entity";

export class Character extends Entity {
    name: string | undefined;
    static characters: Character[] = [];
    constructor(
      x: number,
      y: number,
      width: number,
      height: number,
      sprite_src?: string
    ) {
      super(x, y, width, height, sprite_src);
      Character.characters.push(this);
    }
  
    interact() {}
  
    update() {
  
    }
  }