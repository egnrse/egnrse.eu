/**
 * @file player.js
 * @author Elia Nitsche
 * @date 29.02.2024
 * @brief implements player controllable game elements
 */
import { g } from './gameLibrary.js';
import Animation from './animation.js';

export default class Player {
	pos;		//position
	size;
	velocity;	//todo	
	color;
	stepSize;

	anim;		//animation object

	/** @param position, size, velocity, color*/
	constructor(pos=g.Point2D(), size=g.Point2D(2,2), vel=g.Point2D(), color="blue") {
		//console.log("create Player");
		this.pos = pos; 
		if(size.x==0||size.y==0) console.log("Warning: created an object of size "+size.x+","+size.y);
		this.size = size;
		this.velocity = vel;
		this.color = color;

		this.stepSize = size;
		this.anim = new Animation();
	}

	/**
	 * @brief moves the player by a step
	 * @param key*/
	step(key) {
		switch(key) {
			case 37:	// left arrow
				this.pos.x += -this.stepSize.x;
				break;
			case 38:	// up arrow
				this.pos.y += -this.stepSize.y;
				break;
			case 39:	// right arrow
				this.pos.x += this.stepSize.x;
				break;
			case 40:	// down arrow
				this.pos.y += this.stepSize.y;
				break;
			case 65:	// a
				this.pos.x += -this.stepSize.x;
				break;
			case 87:	// w
				this.pos.y += -this.stepSize.y;
				break;
			case 68:	// d
				this.pos.x += this.stepSize.x;
				break;
			case 83:	// s
				this.pos.y += this.stepSize.y;
				break;
			default:
				console.log("playerMove: unkown key " + key)
		}
	}

	/**
	 * @brief draws this to ctx
	 */
	draw(ctx) {
		//console.log("player draw");
		ctx.beginPath();
		ctx.fillStyle = this.getColor;
		ctx["fillRect"](this.getX, this.getY, this.getWidth, this.getHeight);
		ctx.fill();
	}

	/**
	 * @updates animations
	 * @param delta time between the last function call and this call
	 * @return true if animation is done, false if not
	 */
	update(delta) {
		let val = this.anim.update(delta);
		if(val == true) {
			//console.log(this.anim.update(delta));
			//animation is done
			this.anim = new Animation();
			return true;
		}
		else if(val == false) return false;
		else console.log("Player.update(): bad return value: "+val);
	}

	/**
	 * @brief returns parameters of this with some calculations for animations
	 */
	get getPos() {
		return g.Point2D(this.getX, this.getY);
	}
	get getX() {
		return this.pos.x + this.anim.pos.x;
	}
	get getY() {
		return this.pos.y + this.anim.pos.y;
	}
	get getSize() {
		return g.Point2D(this.getWidth, this.getHeight);
	}
	get getWidth() {
		return this.size.x*this.anim.sizeMulti.x + this.anim.sizeAdd.x;
	}
	get getHeight() {
		return this.size.y*this.anim.sizeMulti.y + this.anim.sizeAdd.y;
	}
	get getColor() {
		return g.getHexColor(this.color);
	}
}
