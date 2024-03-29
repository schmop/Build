import Color from './Color.js';
import vec2 from './vec2.js';
import Ball from './Ball.js';
import Utils from './Utils.js';
import QuadTree from './QuadTree.js';

export default class Ramp {
  constructor() {
    this.resetQuadTree();
    this.balls = new QuadTree(50, this.game.width, this.game.height);
    this.game.addUpdateable(this);
  }

  destroy() {
    this.game.removeUpdateable(this);
    this.balls.forEach(ball => ball.destroy());
  }

  static get BALL_SIZE() { return 5; }
  static get POINT_SIZE() { return 10; }
  static get FRICTION() { return 0.95; }

  get game() { return window.game; }

  resetQuadTree() {
    this.lines = new QuadTree(50, this.game.width + 1, this.game.height + 1);
  }

  update() {
    this.checkCollisionOnBalls();
    if (!this.game.map.brush.active && this.game.mouse.down) {
      this.spawnBall();
    }
  }

  spawnBall() {
    this.balls.addObject(
      new Ball(
        window.game.mouse.pos.x,
        window.game.mouse.pos.y,
        5,
        Color.random()
      )
    )
  }

  checkCollisionOnBalls() {
    this.balls.forEach(ball => {
      let linesNearby = this.lines.getObjectsNearby(ball, true);
      linesNearby.forEach(line => {
        let lastPoint = line.from;
        let point = line.to;
        let np = ball.pos.add(ball.vel);
        let closest = np.closestPointOnLine(lastPoint, point);
        if (closest.distance(np) < ball.size) {
          // mirror velocity to create a bounce
          let normal;
          if (closest === lastPoint) {
            normal = np.sub(lastPoint).normalize();
          } else if(closest === point) {
            normal = np.sub(point).normalize();
          } else {
            let dir = point.sub(lastPoint).normalize();
            normal = new vec2(dir.y, -dir.x);
          }
          const force = Math.abs(ball.vel.dot(normal));
          ball.vel = ball.vel.sub(normal.scale(ball.vel.dot(normal) * 2)).scale(Ramp.FRICTION);
        }
        closest = ball.pos.closestPointOnLine(lastPoint, point);
        if (closest.distance(ball.pos) < ball.size) {
          np = ball.pos.add(ball.vel);
          let pushOutDir = np.sub(closest).normalize();
          ball.pos = closest.add(pushOutDir.scale(ball.size));
        }
      });
    });
  }
}
