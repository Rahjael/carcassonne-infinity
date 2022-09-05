import { Point } from "./point.js";
import { Tile } from "./tile.js";
import { TILES_POOL } from "./allPics.js";
// import { ProgressBar } from "./progressBar.js";

function sleep(milliseconds) {
  // This is not ideal but I need it for testing purposes
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}

const GLOBALS = {
  TILES: {
    array: [],
    sideLength: 100,
    defaultImgPath: './assets/tiles/',
    defaultTiles: null,
    getRandom: function () {
      let randomIndex = Math.floor(Math.random() * this.defaultTiles.length);
      let randomTile = this.defaultTiles[randomIndex].getCopy(new Point(GLOBALS.CANVAS.ref.width / 2 - 200, GLOBALS.CANVAS.ref.height / 2));

      return randomTile;
    },
    findNearestInTileRange: function (point) {
      for (let i = 0; i < this.array.length; i++) {
        let tile = this.array[i];
        if (tile.center.getDistanceTo(point) < GLOBALS.TILES.sideLength / 2) {
          return tile;
        }
      }
      return null;
    },
    getAppropriateTile: function (center) {
      // Prepare a random tile for that spot
      const newTile = this.getRandom();
      newTile.center = center;

      // Scan the neighbours of the given center      
      let offset = newTile.radius * 2;
      // Top neighbour
      let targetTile = new Point(center.x, center.y - offset);
      newTile.neighbours[0] = this.findNearestInTileRange(targetTile);
      if(newTile.neighbours[0]) newTile.neighbours[0].neighbours[2] = newTile;
      // Right neighbour
      targetTile = new Point(center.x + offset, center.y);
      newTile.neighbours[1] = this.findNearestInTileRange(targetTile);
      if(newTile.neighbours[1]) newTile.neighbours[1].neighbours[3] = newTile;
      // Bottom neighbour
      targetTile = new Point(center.x, center.y + offset);
      newTile.neighbours[2] = this.findNearestInTileRange(targetTile);
      if(newTile.neighbours[2]) newTile.neighbours[2].neighbours[0] = newTile;
      // Left neighbour
      targetTile = new Point(center.x - offset, center.y);
      newTile.neighbours[3] = this.findNearestInTileRange(targetTile);
      if(newTile.neighbours[3]) newTile.neighbours[3].neighbours[1] = newTile;

      // console.log('neighbours requirements', newTile.neighbours)

      // Now we get the required sides code for that spot
      for (let i = 0; i < newTile.neighbours.length; i++) {
        if(newTile.neighbours[i]) {
          newTile.sides[i] = newTile.neighbours[i].sides[(i + 2) % 4];
        }
        else {
          newTile.sides[i] = null;
        }
      }

      // console.log('sides required: ', newTile.sides);

      const candidates = this.defaultTiles.filter(tile => {
        let doesMatch = true;
        for (let i = 0; i < tile.sides.length; i++) {
          if(newTile.sides[i] === null) continue;
          if(tile.sides[i] != newTile.sides[i]) {
            doesMatch = false;
            break;
          }
        }

        return doesMatch;
      });

      // candidates.forEach(cand => console.log('cand: ', cand.image.src.replace('http://localhost:5500/assets/tiles/', ''), ...cand.sides));

      // console.log('newTile sides: ', ...newTile.sides)

      // Get a random candidate and copy its properties
      const candidate = candidates[Math.floor(Math.random() * candidates.length)];
      newTile.image = candidate.image;
      newTile.sides = [...candidate.sides];
      newTile.type = candidate.type;

      // console.log('candidate sides: ', ...candidate.sides, candidate);
      // console.log('newTile sides: ', ...newTile.sides)
      

      return newTile;
    }
  },
  CANVAS: {
    ref: document.querySelector('canvas'),
    ctx: document.querySelector('canvas').getContext('2d'),  
    gridOffset: new Point(0, 0),
    gridScaleFactor: 1,
    scaleMultiplier: 0.8,
    startTime: null,
    previousTime: null
  },
  POINTER: {
    previous: null,
    current: null,
    isDown: false,
    lastScrollPosition: null,
    getPosition: (event) => {
      let rect = GLOBALS.CANVAS.ref.getBoundingClientRect();
      let x = (event.clientX - rect.left) / (rect.right - rect.left) * GLOBALS.CANVAS.ref.width;
      let y = (event.clientY - rect.top) / (rect.bottom - rect.top) * GLOBALS.CANVAS.ref.height;  
      return new Point(x, y);
    }
  },
  CAMERA: {
    center: null,
    draw: function () {
      let ctx = GLOBALS.CANVAS.ctx;

      ctx.beginPath();
      ctx.arc(this.center.x, this.center.y, 10, 0, Math.PI * 2);
      ctx.stroke();
    },
    isOnATile: function () {
      for (let i = 0; GLOBALS.TILES.array.length; i++) {
        const tile = GLOBALS.TILES.array[i];        
        const tileApparentCenter = new Point(tile.center.x, tile.center.y).add(GLOBALS.CANVAS.gridOffset);
        const distance = this.center.getDistanceTo(tileApparentCenter);
        if (distance < GLOBALS.TILES.sideLength / 2) {
          return tile;
        }
      }
      return false;
    }
  }
}
GLOBALS.CANVAS.ref.addEventListener('pointerdown', (event) => {
  GLOBALS.POINTER.previous = GLOBALS.POINTER.getPosition(event);
  GLOBALS.POINTER.isDown = true;
});
GLOBALS.CANVAS.ref.addEventListener('pointermove', (event) => {
  // console.log('pointer is moving')
  if(GLOBALS.POINTER.isDown) {
    // Get distance vector from previous coords to current,
    // add it to the offset and store new pointer coords for next frame
    GLOBALS.POINTER.current = GLOBALS.POINTER.getPosition(event);
    const offsetVector = Point.getPointVector(GLOBALS.POINTER.previous, GLOBALS.POINTER.current);
    GLOBALS.CANVAS.gridOffset.add(offsetVector);
    GLOBALS.POINTER.previous = GLOBALS.POINTER.getPosition(event);
  }  
});
GLOBALS.CANVAS.ref.addEventListener('pointerup', (event) => {
  GLOBALS.POINTER.isDown = false;
});
GLOBALS.CANVAS.ref.addEventListener('wheel', (event) => {
  // console.log('scroll event fired', event.wheelDelta);
  if(event.wheelDelta > 0) {
    GLOBALS.CANVAS.gridScaleFactor /=  GLOBALS.CANVAS.scaleMultiplier;
  }
  else if(event.wheelDelta < 0) {
    GLOBALS.CANVAS.gridScaleFactor *=  GLOBALS.CANVAS.scaleMultiplier;
  }
  
});


function createDefaultTiles() {
  const tiles = [];
  for (let i = 0; i < TILES_POOL.length; i++) {
    const imageName = TILES_POOL[i].img
    const radius = GLOBALS.TILES.sideLength / 2;
    const x = (i * radius * 2) + radius;
    const y = radius;
    const imageURL = GLOBALS.TILES.defaultImgPath + imageName;
    const sides = [...TILES_POOL[i].sides];
    const newTile = new Tile(GLOBALS, new Point(x, y), imageURL, radius, sides);
    newTile.imageName = imageName;
    if (imageName.includes('Castle')) {
      newTile.type = 'city';
    }
    else if(imageName.includes('Monastery')) {
      newTile.type = 'monastery';
    }
    else {
      newTile.type = 'road';
    }
    // console.log('created tile', newTile.imageName);

    tiles.push(newTile);
  }  
  return tiles;
}

const ctx = GLOBALS.CANVAS.ctx;
function animate(time) {
  if(GLOBALS.CANVAS.startTime) {
    GLOBALS.CANVAS.startTime = time;
    GLOBALS.CANVAS.previousTime = time;
  }
  let interval = time - GLOBALS.CANVAS.previousTime;

  // If there are no tiles on the board, pick a random one and put it at the center
  if(!GLOBALS.TILES.array.length) {
    GLOBALS.TILES.array.push(GLOBALS.TILES.getRandom());
  }

  if(interval > 16) {
    ctx.clearRect(0, 0, GLOBALS.CANVAS.ref.width, GLOBALS.CANVAS.ref.height);
    ctx.save();
    let factor = GLOBALS.CANVAS.gridScaleFactor;
    ctx.scale(factor, factor);
    GLOBALS.TILES.array.forEach(tile => {
      tile.update();
      tile.draw();
    });
    ctx.restore();

    GLOBALS.CAMERA.draw();
  
  
    // Draw a line from every tile center to the camera
    // and highlights touched tile
    GLOBALS.TILES.array.forEach(tile => {
      const ctx = GLOBALS.CANVAS.ctx;
      const tileApparentCenter = new Point(tile.center.x, tile.center.y).add(GLOBALS.CANVAS.gridOffset);

      if(tileApparentCenter.getDistanceTo(GLOBALS.CAMERA.center) < GLOBALS.TILES.sideLength / 2) {
        const topleft = tile.getTopleft().add(GLOBALS.CANVAS.gridOffset);
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = 'yellow';
        ctx.lineWidth = 5;
        ctx.strokeRect(topleft.x, topleft.y, tile.radius * 2, tile.radius * 2);
        ctx.restore();

        ctx.beginPath();
        ctx.strokeStyle = 'red';
        ctx.moveTo(GLOBALS.CAMERA.center.x, GLOBALS.CAMERA.center.y);
        ctx.lineTo(tileApparentCenter.x, tileApparentCenter.y);
        ctx.stroke();

        tile.populateNeighbours();
      }

    });

  



  
    GLOBALS.CANVAS.previousTime = time;

  }

  requestAnimationFrame(animate);
}

/**
 * No other definitions from this point onwards
 */


// Initialize everything
GLOBALS.CANVAS.ref.width = window.innerWidth * 0.95;
GLOBALS.CANVAS.ref.height = window.innerHeight * 0.95;

// GLOBALS.CANVAS.ref.style.display = 'none';


GLOBALS.TILES.defaultTiles = createDefaultTiles();

// Hide loading banner when document is ready
document.querySelector('#loading-banner').style.display = 'none';


GLOBALS.CAMERA.center = new Point(ctx.canvas.width / 2, ctx.canvas.height / 2);

// GLOBALS.TILES.defaultTiles.forEach(tile => console.log(tile.imageName, ...tile.sides));


// Run animation
animate();