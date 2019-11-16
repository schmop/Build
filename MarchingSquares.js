import Utils from './Utils.js';
import Grid from './Grid.js';
import Map from './Map.js';
import Ramp from './Ramp.js';
import Color from './Color.js';
import vec2 from './vec2.js';

class Line {
  get pos() { return this.from.add(this.to).scale(0.5); }
  constructor(from, to) {
    this.from = from;
    this.to = to;
  }
}

class Tile {
  get outlines() {
    let lines = [];
    let oldVertex = null;
    this.vertices.forEach(vertex => {
      if (oldVertex != null) {
        lines.push(new Line(oldVertex, vertex));
      }
      oldVertex = vertex;
    });
    lines.push(new Line(oldVertex, this.vertices[0]));
    return lines;
  }

  constructor(coordinates) {
    this.vertices = [];
    for (let i = 0; i < coordinates.length; i += 2) {
      this.vertices.push(new vec2(coordinates[i], coordinates[i + 1]));
    }
  }
}

export default class MarchingSquares {

  static get CASES() {
    return [
      [],
      [0, 0.5, 0.5, 1, 0, 1],
      [0.5, 1, 1, 0.5, 1, 1],
      [0, 0.5, 1, 0.5, 1, 1, 0, 1],
      [0.5, 0, 1, 0.5, 1, 0],
      [0, 0.5, 0.5, 0, 1, 0, 1, 0.5, 0.5, 1, 0, 1],
      [0.5, 0, 1, 0, 1, 1, 0.5, 1],
      [0, 0.5, 0.5, 0, 1, 0, 1, 1, 0, 1],
      [0, 0.5, 0.5, 0, 0, 0],
      [0.5, 0, 0.5, 1, 0, 1, 0, 0],
      [0, 0.5, 0.5, 1, 1, 1, 1, 0.5, 0.5, 0, 0, 0],
      [0.5, 0, 1, 0.5, 1, 1, 0, 1, 0, 0],
      [0, 0.5, 1, 0.5, 1, 0, 0, 0],
      [0.5, 1, 1, 0.5, 1, 0, 0, 0, 0, 1],
      [0, 0.5, 0.5, 1, 1, 1, 1, 0, 0, 0],
      [0, 0, 1, 0, 1, 1, 0, 1]
    ];
  }

  constructor(grid, threshold) {
    this.grid = grid;
    this.threshold = threshold || 0.5;
    this.tiles = [];
    this.ramp = new Ramp();
    this.gridToLines();

    window.game.addRenderable(this);
  }

  changeThresh(val) {
    this.threshold = val;
    this.gridToLines();
  }

  destroy() {
    window.game.removeRenderable(this);
    this.ramp.destroy();
  }

  gridToLines() {
    let lines = [];
    this.tiles = [];
    let cases = MarchingSquares.CASES;
    let y = 0;
    while (this.grid.get(0,y) != null && this.grid.get(0,y+1) != null) {
      for (let x = 0; x < this.grid.cols; x++) {
        let lineCase = (this.grid.get(x    , y    ) > this.threshold) << 3
                |  (this.grid.get(x + 1, y    ) > this.threshold) << 2
                |  (this.grid.get(x + 1, y + 1) > this.threshold) << 1
                |  (this.grid.get(x    , y + 1) > this.threshold)
        ;
        if (lineCase === 0) {
          continue;
        }
        let tile = new Tile(cases[lineCase]);
        tile.vertices = tile.vertices.map(vertex => {
          return vertex.add(x,y).scale(Map.BLOCK_SIZE, Map.BLOCK_SIZE);
        });
        this.tiles.push(tile);
        lines.push(...(tile.outlines));
      }
      y++;
    }
    this.ramp.resetQuadTree();
    lines.forEach(line => {
      this.ramp.lines.addObject(line);
    });
  }

  render(ctx) {
    if (this.tiles.length === 0) {
      return;
    }
    ctx.fillStyle = "black";
    ctx.beginPath();
    this.tiles.forEach(tile => {

      ctx.moveTo(tile.vertices[0].x, tile.vertices[0].y);
      for (let i = 1; i < tile.vertices.length; i++) {
        ctx.lineTo(tile.vertices[i].x, tile.vertices[i].y);
      }

      //ctx.lineTo(tile.vertices[0].x, tile.vertices[0].y);
    });
    ctx.closePath();
    ctx.fill();
  }
}
