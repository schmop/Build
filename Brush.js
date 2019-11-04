import Utils from './Utils.js';
import Grid from './Grid.js';
import Map from './Map.js';
import MarchingSquares from './MarchingSquares.js';
import Color from './Color.js';
import vec2 from './vec2.js';

export default class Brush {

  constructor(marching) {
    this.marching = marching;
    this.size = window.brush.value;
    this.isAdding = window.brushToggle.checked;
    this.active = !window.spawnBalls.checked;

    this.registerListeners();

    this.fillColor = new Color(0,0,0,0.2);
    window.game.addUpdateable(this);
    window.game.addRenderable(this);
  }


  destroy() {
    window.game.removeRenderable(this);
    window.game.removeUpdateable(this);
  }

  registerListeners() {
    window.brush.addEventListener("change", (event) => {
      this.size = window.brush.value;
    });

    window.brushToggle.addEventListener("change", (event) => {
      this.isAdding = window.brushToggle.checked;
    });

    window.spawnBalls.addEventListener("change", (event) => {
      this.active = !window.spawnBalls.checked;
    });
  }

  update() {
    if (window.game.mouse.down) {
      let somethingChanged = false;
      let gridPos = window.game.mouse.pos.scale(1 / Map.BLOCK_SIZE);
      let scaledRadius = this.size / Map.BLOCK_SIZE;
      this.marching.grid.forEach((cell, index, grid) => {
        if (grid.indexToPos(index).distance(gridPos) < scaledRadius) {
          grid.grid[index] = Utils.clamp(this.isAdding ? cell + 0.1 : cell - 0.1, 0, 1);
          somethingChanged = true;
        }
      });
      if (somethingChanged) {
        this.marching.gridToLines();
      }
    }
  }

  render(ctx) {
    ctx.beginPath();
    ctx.fillStyle = this.fillColor.toString();
    ctx.arc(window.game.mouse.pos.x, window.game.mouse.pos.y, this.size, 0, 2 * Math.PI);
    ctx.fill();
  }
}
