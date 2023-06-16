import { type Rect } from "./types";

export const checkCollision = (obj1: Rect, obj2: Rect) => {
    return (
      obj1.x < obj2.x + obj2.width &&
      obj1.x + obj1.width > obj2.x &&
      obj1.y < obj2.y + obj2.height &&
      obj1.y + obj1.height > obj2.y
    );
  };
  
export const lerp = (min: number, max: number, a: number) => {
  return min + ((max-min)*a);
}

export const easeInOut = (x: number) => {
  return -(Math.cos(Math.PI * x) - 1) / 2;
}