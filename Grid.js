import vec2 from './vec2.js';

export default class Grid {
  constructor(cols) {
    this.cols = cols;
    this.grid = {};
  }

  remove(value) {
    Object.keys(this.grid).forEach(key => {
      if (this.grid[key] === value) {
        delete this.grid[key];
      }
    })
  }

  forEach(callback) {
    Object.keys(this.grid).forEach(key => callback(this.grid[key], key, this));
  }

  indexToPos(index) {
    return new vec2(index % this.cols, Math.floor(index / this.cols));
  }

  get(column, row) {
    if (!(column instanceof vec2)) {
      column = new vec2(column, row);
    }
    return this.grid[column.x % this.cols + column.y * this.cols];
  }

  set(column, row, value) {
    if (!(column instanceof vec2)) {
      column = new vec2(column, row);
    } else {
      value = row;
    }
    this.grid[column.x % this.cols + column.y * this.cols] = value;
  }
}
