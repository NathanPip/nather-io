import { type Vector2d } from "./types";

export class Vector {
  x: number;
  y: number;
  max_vector: Vector2d = { x: Infinity, y: Infinity };
  constructor(x: number, y: number, max_vector?: Vector2d) {
    this.x = x;
    this.y = y;
    if (max_vector) this.max_vector = max_vector;
  }

  set(vector: Vector | Vector2d): this {
    this.x = vector.x;
    this.y = vector.y;
    return this;
  }

  addTo(other: Vector | Vector2d) {
    this.x += other.x;
    this.y += other.y;
    this.constrainToMax();
  }

  add(other: Vector | Vector2d) {
    return new Vector(this.x + other.x, this.y + other.y);
  }

  multiplyTo(other: Vector | Vector2d | number) {
    if(typeof other === "number") {
      this.x *= other;
      this.y *= other;
      this.constrainToMax();
      return;
    }
    this.x *= other.x;
    this.y *= other.y;
    this.constrainToMax();
  }

  multiply(other: Vector | Vector2d | number) {
    if(typeof other === "number") return new Vector(this.x * other, this.y * other);
    return new Vector(this.x * other.x, this.y * other.y);
  }

  // inBetween(other: Vector | Vector2d) {
  //   return new Vector(this.x - other.x, this.y - other.y);
  // }

  lerp(other: Vector | Vector2d, progress: number) {
    this.x += (other.x - this.x) * progress;
    this.y += (other.y - this.y) * progress;
    return this;
  }

  lerpFrom(from: Vector | Vector2d, other: Vector | Vector2d, progress: number) {
    this.x = from.x + ((other.x - from.x) * progress);
    this.y = from.y + ((other.y - from.y) * progress);
    return this;
  }

  tendToZero(amt: number) {
    Math.abs(this.x) - amt < 0
      ? (this.x = 0)
      : (this.x += (-amt * Math.abs(this.x)) / this.x);
    Math.abs(this.y) - amt < 0
      ? (this.y = 0)
      : (this.y += (-amt * Math.abs(this.y)) / this.y);
  }

  constrainToMax() {
    if (Math.abs(this.x) > this.max_vector.x)
      this.x = (this.max_vector.x * this.x) / Math.abs(this.x);
    if (Math.abs(this.y) > this.max_vector.y)
      this.y = (this.max_vector.y * this.y) / Math.abs(this.y);
  }

  distanceTo(vec: Vector | Vector2d) {
    return Math.sqrt(Math.pow(this.x - vec.x, 2) + Math.pow(this.y - vec.y, 2));
  }
}

export function normalizeVector(vec: Vector | Vector2d): Vector2d {
  const mag = Math.sqrt(Math.pow(vec.x, 2) + Math.pow(vec.y, 2));
  return {x: vec.x / mag, y: vec.y / mag};
}
