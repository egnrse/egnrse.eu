/**
 * @file environment.js
 * @author Elia Nitsche
 * @date 29.02.2024
 * @brief implements environment game elements
 */
import { g } from './gameLibrary.js';
import Animation from './animation.js';

export default class Environment {
	pos;		//position
	size;
	velocity;	//todo
	color;
	shape;		// a draw method of ctx (eg. fillRect, strokeRect)
	lineWidth;  
	
	solid;		//hitbox?//todo
	hidden;		//todo
	
	anim;


	/** @param position, size, velocity, color, shape, solid, hidden*/
	//constructor(pos=g.Point2D(), size=g.Point2D(2,2), vel=g.Point2D(), color="red", shape="fillRect", solid=true, hidden=false) {
	constructor(pos=g.Point2D(), size=g.Point2D(2,2), vel=g.Point2D(), color="red", shape="fillRect", solid=true, hidden=false) {
		//console.log("create env");
		this.pos = pos; 
		if(size.x==0||size.y==0) console.log("Warning: created an object of size "+size.x+","+size.y);
		this.size = size;
		this.velocity = vel;
		this.color = color;
		this.shape = shape;
		this.lineWidth = 3;

		this.solid = solid;
		this.hidden = hidden;

		this.anim = new Animation();
	}

	/**
	 * @brief draws this to ctx
	 */
	draw(ctx) {
		//console.log("env draw");
		if(!this.hidden) {
			ctx.beginPath();
			ctx.fillStyle = this.getColor;
			ctx.strokeStyle = this.getColor;
			ctx.lineWidth = this.lineWidth;
			ctx[this.shape](this.getX, this.getY, this.getWidth, this.getHeight);
			//console.log("x:"+this.getX+", y:"+this.getY+", w:"+this.getWidth+", h:"+this.getHeight);
			ctx.fill();
		}
	}

	/**
	 * @brief updates animations
	 * @param delta time between the last call and this call
	 * @return true if all animations are done
	 */
	update(delta) {
		let val = this.anim.update(delta);
		if(val == true) {
			//animation is done
			this.anim = null;
			this.anim = new Animation();
			return true;
		}
		else if(val == false) return false;
		else console.log("Environment.update(): bad return value: "+val)
	}

	/**
	 * @brief returns parameters of this with some calculations for animations
	*/
	get getPos() {
		return g.Point2D(this.getX, this.getY);
	}
	get getX() {
		return this.pos.x + this.anim.pos.x - (this.size.x*(this.anim.sizeMulti.x-1)/2); // also compensate for multiplication offset
	}
	get getY() {
		return this.pos.y + this.anim.pos.y - (this.size.y*(this.anim.sizeMulti.y-1)/2);
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
		if(this.anim.length < 1 || this.anim.colorA == 1) return this.color;
		else return g.getRGBAColor(this.color, this.anim.colorA);
	}
}
