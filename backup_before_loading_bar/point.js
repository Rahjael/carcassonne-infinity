export class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  
  static getPointVector(a, b) {
    return new Point(b.x - a.x, b.y - a.y);
  }
  add(point) {
    // this.x = Math.floor(this.x + point.x);
    // this.y = Math.floor(this.y + point.y);
    this.x = this.x + point.x;
    this.y = this.y + point.y;
    return this;
  }
  getDistanceTo(point) {
    return Math.sqrt((point.x - this.x) ** 2 + (point.y - this.y) ** 2);
  }
}