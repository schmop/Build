import Utils from './Utils.js';
import Color from './Color.js';
import vec2 from './vec2.js';
import Map from './Map.js';

export default class Build {

	constructor(canvasId, gameMode) {
		this.canvasId = canvasId;
		this.mouse = {
			pos: new vec2(-1, -1),
			down: false,
		};
	}

	initCanvas() {
		Utils.removeAllEventListeners(document.getElementById(this.canvasId));
		this.canvas = document.getElementById(this.canvasId);
		this.width = Math.floor(window.innerWidth / Map.BLOCK_SIZE) * Map.BLOCK_SIZE;
		this.height = this.width * (window.innerHeight / window.innerWidth) - this.canvas.getBoundingClientRect().top;
		// round to blocksize
		this.height = Math.floor(this.height / Map.BLOCK_SIZE) * Map.BLOCK_SIZE;
		this.canvas.width = this.width;
		this.canvas.height = this.height;
		this.ctx = this.canvas.getContext("2d", {alpha: false});
	}

	init() {
		this.initCanvas();
		this.renderables = [];
		this.updateables = [];
		this.nextTicks = [];
		this.registerListeners();
		this.initMap();
	}

	initMap() {
		if (this.map != null) {
			this.map.destroy();
		}
		this.map = new Map();
	}

	registerListeners() {
		Utils.removeAllEventListeners(window, "keydown");

		let updateMouseByTouchEvent = (touch) => {
			let rect = touch.target.getBoundingClientRect();
			this.mouse.pos = new vec2(touch.targetTouches[0].pageX - rect.left, touch.targetTouches[0].pageY - rect.top);
		};
		let mouseMoveCallback = (event) => {
			if ('touches' in event) {
				updateMouseByTouchEvent(event);
				event.preventDefault();
			} else {
				this.mouse.pos = new vec2(event.offsetX, event.offsetY);
			}
		};
		this.canvas.addEventListener('mousemove', mouseMoveCallback);
		this.canvas.addEventListener('touchmove', mouseMoveCallback, false);
		let mouseStartCallback = (event) => {
			this.mouse.down = true;
			if ('touches' in event) {
				updateMouseByTouchEvent(event);
			}
		};
		this.canvas.addEventListener('mousedown', mouseStartCallback);
		this.canvas.addEventListener('touchstart', mouseStartCallback, false);
		let mouseEndCallback = (event) => {
			this.mouse.down = false;
			if ('touches' in event) {
				this.nextTick(() => {
					this.mouse.pos = new vec2(-1, -1);
				});
			}
		};
		this.canvas.addEventListener('mouseup', mouseEndCallback);
		this.canvas.addEventListener('touchend', mouseEndCallback, false);
		this.canvas.addEventListener('touchcancel', mouseEndCallback, false);

		this.canvas.addEventListener('mouseout', (event) => {
			this.mouse.pos = new vec2(-1, -1);
		});
		window.addEventListener('keydown', (event) => {
			if (event.key === 'Enter') {
				this.initMap();
			}
			else if (event.key === 'Escape') {
				this.clear();
			}
			else if (event.key === 'Backspace') {
			}
		});
	}

	nextTick(callback) {
		this.nextTicks.push(callback);
	}

	clear() {
		this.updateables = [];
		this.renderables = [];
		this.nextTicks 	 = [];
	}

	startGame() {
		requestAnimationFrame(this.tick.bind(this));
	}

	tick() {
		this.execNextTicks();
		this.update();
		this.render();
		requestAnimationFrame(this.tick.bind(this));
	}

	update() {
		this.updateables.forEach(updateable => {
			updateable.update();
		});
	}

	render() {
		//this.ctx.clearRect(0, 0, this.width, this.height);
		this.ctx.fillStyle = "white";
		this.ctx.fillRect(0, 0, this.width, this.height);

		this.renderables.forEach(renderable => {
		  renderable.obj.render(this.ctx);
		});
	}

	execNextTicks() {
		this.nextTicks.forEach(callback => {
			if (typeof callback === 'function') {
				callback();
			}
		});
		this.nextTicks = [];
	}

	addUpdateable(obj) {
		this.updateables.push(obj);
	}

	addRenderable(obj, layer) {
		layer = layer || 0;
		this.renderables.push({obj: obj, layer: layer});
		this.renderables.sort((r1, r2) => r1.layer - r2.layer);
	}

	removeUpdateable(obj) {
		this.updateables = this.updateables.filter(updateable => updateable !== obj);
	}

	removeRenderable(obj) {
		this.renderables = this.renderables.filter(renderable => renderable.obj !== obj);
	}
};
