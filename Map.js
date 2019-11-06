import Utils from './Utils.js';
import Grid from './Grid.js';
import Color from './Color.js';
import Brush from './Brush.js';
import vec2 from './vec2.js';
import MarchingSquares from './MarchingSquares.js';

export default class Map {

  static get BLOCK_SIZE() { return 16; }
  //static get MS_TRESH() { return 0.5; }
  static get MS_MAX() { return 1; }
  get columns() { return Math.floor(window.game.width / Map.BLOCK_SIZE); }
  get rows() { return Math.floor(window.game.height / Map.BLOCK_SIZE); }

  constructor() {
    this.grid = new Grid(this.columns);
    this.fillMap();
    this.marching = new MarchingSquares(this.grid, window.slider.value);
    this.brush = new Brush(this.marching);
  }

  destroy() {
    this.marching.destroy();
    this.brush.destroy();
  }

  fillMap() {
    for (let x = 0; x < this.columns; x++) {
      for (let y = 0; y < this.rows; y++) {
        this.grid.set(x,y,Utils.rand(0, Map.MS_MAX));
      }
    }
  }
}
