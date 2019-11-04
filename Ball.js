import Utils from './Utils.js';
import vec2 from './vec2.js';

export default class Ball {

	constructor(x, y, size, color) {
		this.pos = new vec2(x,y);
		this.vel = new vec2(Utils.rand(-2, 2), Utils.rand(-2, 2));
		this.size = size;
		this.color = color;

		this.game.addUpdateable(this);
		this.game.addRenderable(this);
	}

	destroy() {
		this.game.removeUpdateable(this);
		this.game.removeRenderable(this);
	}

	// statics
	static get AIR_FRICTION() { return 0.99; }
	static get GRAVITY() { return 0.2; }
	static get BOUNCE_COST() { return 0.7; }

	get game() { return window.game; }
	get width() { return this.game.width; }
	get height() { return this.game.height; }
	get otherBalls() { return this.game.map.marching.ramp.balls; }
	get hovered() { return this.pos.distance(this.game.mouse.pos) <= this.size; }
	get clicked() { return this.hovered && this.game.mouse.down; }

	update() {
		this.handleAcceleration();
		this.handleVelocity();
	}

	handleAcceleration() {
		this.vel.y += Ball.GRAVITY;
		this.vel = this.vel.scale(Ball.AIR_FRICTION);
	}

	clampPositionToBounds() {
		this.pos.x = Utils.clamp(this.pos.x, this.size, this.width - this.size);
		this.pos.y = Utils.clamp(this.pos.y, this.size, this.height - this.size);
	}

	checkCollision() {
		let npos = this.pos.add(this.vel);

		this.otherBalls.forEach(ball => {
			if (ball === this) {
				return;
			}
			const dist = npos.distance(ball.pos);
			if (dist < this.size + ball.size) {
				let mpos = ball.pos.scale(this.size).add(npos.scale(ball.size)).scale(1 / (ball.size + this.size));
				ball.pos = mpos.add(ball.pos.sub(mpos).normalize().scale(ball.size));
				this.pos = mpos.add(npos.sub(mpos).normalize().scale(this.size));
				let bounceForceDir = ball.pos.sub(mpos).normalize().scale(this.vel.length() * this.size / ball.size);
				ball.vel = ball.vel.add(bounceForceDir).scale(Ball.BOUNCE_COST);
				bounceForceDir = this.pos.sub(mpos).normalize().scale(ball.vel.length() * ball.size / this.size);
				this.vel = this.vel.add(bounceForceDir).scale(Ball.BOUNCE_COST);
				ball.clampPositionToBounds();
				this.clampPositionToBounds();
				npos = this.pos.clone();
			}
		});

		if (npos.y < this.size || npos.y >= this.height - this.size) {
			this.vel.y *= -1 * Ball.BOUNCE_COST;
		}
		if (npos.x < this.size || npos.x >= this.width - this.size) {
			this.vel.x *= -1 * Ball.BOUNCE_COST;
		}
	}

	handleVelocity() {
		this.checkCollision();
		this.pos = this.pos.add(this.vel);
	}

	render(ctx) {
		ctx.beginPath();
		ctx.fillStyle = this.color.toString();

		ctx.arc(this.pos.x, this.pos.y, this.size, 0, 2 * Math.PI);
		ctx.fill();
	}
}
