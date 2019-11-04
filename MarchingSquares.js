import Utils from './Utils.js';
import Grid from './Grid.js';
import Map from './Map.js';
import Color from './Color.js';
import vec2 from './vec2.js';

class Line {
  get from() { return new vec2(this.fromx, this.fromy); }
  get to() { return new vec2(this.tox, this.toy); }
  constructor(fromx, fromy, tox, toy) {
    this.fromx = fromx;
    this.fromy = fromy;
    this.tox = tox;
    this.toy = toy;
  }
}

export default class MarchingSquares {

  static get CASES() {
    return [
      [],
      [new Line(0, 0.5, 0.5, 1)],
      [new Line(0.5, 1, 1, 0.5)],
      [new Line(0, 0.5, 1, 0.5)],
      [new Line(0.5, 0, 1, 0.5)],
      [new Line(0, 0.5, 0.5, 0), new Line(0.5, 1, 1, 0.5)],
      [new Line(0.5, 0, 0.5, 1)],
      [new Line(0, 0.5, 0.5, 0)],
      [new Line(0, 0.5, 0.5, 0)],
      [new Line(0.5, 0, 0.5, 1)],
      [new Line(0, 0.5, 0.5, 1), new Line(0.5, 0, 1, 0.5)],
      [new Line(0.5, 0, 1, 0.5)],
      [new Line(0, 0.5, 1, 0.5)],
      [new Line(0.5, 1, 1, 0.5)],
      [new Line(0, 0.5, 0.5, 1)],
      []
    ];
  }

  constructor(grid, threshold) {
    this.grid = grid;
    this.threshold = threshold || 0.5;
    this.gridToLines();

    window.game.addRenderable(this);
  }

  changeThresh(val) {
    this.threshold = val;
    this.gridToLines();
  }

  destroy() {
    window.game.removeRenderable(this);
  }

  gridToLines() {
    this.lines = [];
    let cases = MarchingSquares.CASES;
    let y = 0;
    while (this.grid.get(0,y) != null && this.grid.get(0,y+1) != null) {
      for (let x = 0; x < this.grid.cols; x++) {
        let lineCase = (this.grid.get(x    , y    ) > this.threshold) << 3
                |  (this.grid.get(x + 1, y    ) > this.threshold) << 2
                |  (this.grid.get(x + 1, y + 1) > this.threshold) << 1
                |  (this.grid.get(x    , y + 1) > this.threshold)
        ;
        let lines = cases[lineCase].map(line => {
          let from = line.from.add(x,y).scale(Map.BLOCK_SIZE, Map.BLOCK_SIZE);
          let to = line.to.add(x,y).scale(Map.BLOCK_SIZE, Map.BLOCK_SIZE);
          return new Line(from.x, from.y, to.x, to.y);
        })
        this.lines.push(...lines);
      }
      y++;
    }
  }

  render(ctx) {
    ctx.beginPath();
    ctx.strokeStyle = "black";
    this.lines.forEach(line => {
      ctx.moveTo(line.fromx, line.fromy);
      ctx.lineTo(line.tox, line.toy);
    });
    ctx.stroke();
  }
}
