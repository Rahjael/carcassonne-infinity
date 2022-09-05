import { Point } from "./point.js";

export class Tile {
  constructor(GLOBALS, center, imageURL, radius, sides = [null, null, null, null]) {
    this.GLOBALS = GLOBALS;
    this.center = center;
    this.radius = radius;
    this.image = (() => {
      const image = new Image();
      image.src = imageURL;
      return image;
    })();
    this.imageName;
    this.isFirstFrame = true;
    this.opacity = 0;
    this.color = 'red';

    this.neighbours = [null, null, null, null];

    /**
     * Sides are:
     * - city
     * - road
     * - field
     * 
     * The sides array is intended as clockwise, starting from the top side
     */
    this.sides = sides;

    /**
     * Types are:
     * - city
     * - road
     * - field
     * - monastery
     */
    this.type = null;
  }

  getCopy(newCenter) {
    return new Tile(this.GLOBALS, newCenter, this.image.src, this.radius, [...this.sides]);
  }

  getTopleft() {
    return new Point(this.center.x - this.radius, this.center.y - this.radius);
  }

  update() {
    if (this.opacity < 1) {
      this.opacity += Math.random() * 0.1;
    }
    else {
      this.opacity = 1;
    }

  }

  draw() {
    const ctx = this.GLOBALS.CANVAS.ctx;
    const topleft = this.getTopleft().add(this.GLOBALS.CANVAS.gridOffset);
    const center = new Point(this.center.x, this.center.y).add(this.GLOBALS.CANVAS.gridOffset);

    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.strokeStyle = this.color;
    // ctx.strokeRect(topleft.x, topleft.y, this.radius * 2, this.radius * 2);
    ctx.drawImage(this.image, topleft.x, topleft.y, this.radius * 2, this.radius * 2);
    ctx.restore();

    // Debug code to show center and topleft points
    // ctx.beginPath();
    // ctx.arc(topleft.x, topleft.y, 5, 0, 2 * Math.PI);
    // ctx.fill();
    // ctx.beginPath();
    // ctx.arc(center.x, center.y, 5, 0, 2 * Math.PI);
    // ctx.fill();
  }


  populateNeighbours(randomly = false) {
    let offset = this.radius * 2;
    this.neighbours.forEach((neighbour, i) => {
      if (!neighbour) {
        // Get the position for the new tile
        let newCenter;
        if (i === 0) { // This is top side
          // Update the new tile
          newCenter = new Point(this.center.x, this.center.y - offset);
          //[null, null, this, null];
        }
        else if (i === 1) { // This is right side
          // Update the new tile
          newCenter = new Point(this.center.x + this.radius * 2, this.center.y);
          //[null, null, null, this];
        }
        else if (i === 2) { // This is bottom side
          newCenter = new Point(this.center.x, this.center.y + this.radius * 2);
        }
        else if (i === 3) { // This is left side
          newCenter = new Point(this.center.x - this.radius * 2, this.center.y);
        }

        // Now get a tile according to parameter
        let newTile;
        if(randomly) {
          newTile = this.GLOBALS.TILES.getRandom();
        }
        else {
          // console.log('neighbour ', i);
          newTile = this.GLOBALS.TILES.getAppropriateTile(newCenter);
          // console.log('selected: ', newTile.image.src.replace('http://localhost:5500/assets/tiles/', ''), ...newTile.sides)
        }
        
        // Update the new tile's neighbours
        // Top neighbour
        let targetTile = new Point(newCenter.x, newCenter.y - offset);
        newTile.neighbours[0] = this.GLOBALS.TILES.findNearestInTileRange(targetTile);
        if(newTile.neighbours[0]) newTile.neighbours[0].neighbours[2] = newTile;
        // Right neighbour
        targetTile = new Point(newCenter.x + offset, newCenter.y);
        newTile.neighbours[1] = this.GLOBALS.TILES.findNearestInTileRange(targetTile);
        if(newTile.neighbours[1]) newTile.neighbours[1].neighbours[3] = newTile;
        // Bottom neighbour
        targetTile = new Point(newCenter.x, newCenter.y + offset);
        newTile.neighbours[2] = this.GLOBALS.TILES.findNearestInTileRange(targetTile);
        if(newTile.neighbours[2]) newTile.neighbours[2].neighbours[0] = newTile;
        // Left neighbour
        targetTile = new Point(newCenter.x - offset, newCenter.y);
        newTile.neighbours[3] = this.GLOBALS.TILES.findNearestInTileRange(targetTile);
        if(newTile.neighbours[3]) newTile.neighbours[3].neighbours[1] = newTile;

        newTile.center = newCenter;
        this.GLOBALS.TILES.array.push(newTile);
      }
    });
  }


}