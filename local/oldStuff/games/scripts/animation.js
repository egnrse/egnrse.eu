/**
 * @file animation.js
 * @author Elia Nitsche
 * @date 01.03.2024
 * @brief animation object to store and manage animations
 */
import { g } from './gameLibrary.js';

export default class Animation {
	time = -1;		//time passed
	state = -1;		//state of animation, for multi step stuff
	started;
	
	anim;			//list of animation sub objects
	
	//animated params
	pos;
	sizeAdd;
	sizeMulti;
	color;

	/** whatAnimation, arguments for the Animation */
	constructor(what="", args="", args2="", args3="") {
		this.reset();

		this.anim = [];
		if(what != "") {
			this.addAnimation(what, args, args2, args3);
		}
	}

	/**
	 * @brief resets all animated values
	 */
	reset() {
		this.time = 0;
		this.state = -1;
		this.started = true;
		this.pos = g.Point2D();
		this.sizeAdd = g.Point2D();
		this.sizeMulti = g.Point2D(1,1);
		this.color = "#000000";
	}

	/**
	 * @brief adds an animation object to this
	 */
	addAnimation(what, args="", args2="", args3="") {
		//console.log("anim added: "+ what+", "+args+"; "+this.anim.length);
		//test what for illegal substrings before putting it in eval
		let whatRules = [" ",";","{","}","(",")"];

		for(let i=0;i<whatRules.length;i++) {
			if(what.includes(whatRules[i])) {
				console.error("Animation.addAnimation(): illegal substring in what: "+whatRules[i]);
				return;
			}
		}
		const animClass = eval(what);	//evaluates the string 'what' as a class
		this.anim.push(new animClass(args, args2, args3));
	}

	/**
	 * @brief updates all animations and sums all effects together
	 * @param delta the time that passed since the last call
	 * @return true if all animations are done
	 */
	update(delta) {
		//console.log("animate");
		//console.log("delta: " +delta);
		
		this.reset();

		let val;
		let finished = [];
		for(let i=0;i<this.anim.length;i++) {
			val = this.anim[i].update(delta);
			this.pos.x += this.anim[i].pos.x;
			this.pos.y += this.anim[i].pos.y;
			this.sizeAdd.x += this.anim[i].sizeAdd.x;
			this.sizeAdd.y += this.anim[i].sizeAdd.y;
			this.sizeMulti.x *= this.anim[i].sizeMulti.x;
			this.sizeMulti.y *= this.anim[i].sizeMulti.y;

			if(val == true) {			//animation done
				finished.push(i);
			}
		}
		for(let i=finished.length-1;i>=0;i--) {
			this.anim.splice(finished[i],1);
		}
		if(this.anim.length < 1) {		//all animations done
			return true;
		}
		return false;
	}
}

/**
 * @brief does nothing
 */
class Nothing extends Animation {
	args;args2;args3;
	constructor(args="", args2="", args3="") {super();this.args=args;this.args2=args2;}

	update(delta) {
		//console.log("\tNothing");
		this.time += delta;
		//do nothing
		return true;
	}
}
/**
 * @brief moves object into direction and back
 * @param direction
 * @param length how far (default=50)
 * @param speed how fast (default=0.1)
 */
class Move extends Animation {
	direction;
	length;
	speed;
	change;

	constructor(direction, length=50, speed=0.1) {
		super();
		this.direction = direction;
		if(length == "") length = 50;
		this.length = length;
		if(speed == "") speed = 0.1;
		this.speed = speed;
		this.change = 0;
	}

	update(delta) {
		//console.log("\tMove");
		//console.log("animDelta: "+delta);
		this.time += delta;
		
		//update all values of animation
		if(this.state == -1) this.state = 0;
		if(this.state == 0 && this.change > this.length) this.state = 1;

		if(this.state == 0) {
			this.change += delta*this.speed;
		}
		else if(this.state == 1){
			this.change += - delta*this.speed;
		}
		switch(this.direction) {
			case "r":
				this.pos.x = this.change;
				break;
			case "u":
				this.pos.y = -(this.change);
				break;
			case "l":
				this.pos.x = -(this.change);
				break;
			case "d":
				this.pos.y = this.change;
				break;
		}
		if(this.state == 1 && this.change <= 1) return true;
		return false;
	}
}
/**
 * @brief bounces objects into a direction
 * @param direction
 * @param length how far (default=50)
 * @param speed how fast (default=0.1)
 */
class BounceBack extends Animation {
	direction;
	length;
	speed;
	change;

	constructor(direction, length=50, speed=0.1) {
		super();
		this.direction = direction;
		if(length == "") length = 50;
		this.length = length;
		if(speed == "") speed = 0.25;
		this.speed = speed*100;
		this.change = - length/3;
	}

	update(delta) {
		//console.log("\tBounceBack");
		//console.log("Bounce; delta:"+delta+", time:"+this.time+", speed:"+this.speed+", calc:"+this.change);
		this.time += delta;

		if(this.started) {
			this.time = delta = 20;
			this.started = false;
		}

		let left = - this.length/4;
		let right = this.length/5;
		
		//update all values of animation
		if(this.state == -1) this.state = 1;
		else if(this.state == 1 && this.change >= right) this.state = 2;
		else if(this.state == 2 && this.change <= left/4) this.state = 3;

		let velo = delta*this.speed;
		if(this.state == 1){
			this.change += (velo)/(this.time*2) + velo/700;
			if(this.change > right) this.change = right;
		}
		else if(this.state == 2) {
			this.change += - (velo)/(this.time*2) - velo/700;
			if(this.change < left/4) this.change = left/4;
		}
		else if(this.state == 3) {
			this.change += (velo)/(this.time*2) + velo/700;
			if(this.change > right/8) this.change = right/8;
		}
		switch(this.direction) {
			case "r":
				this.pos.x = this.change;
				break;
			case "u":
				this.pos.y = -(this.change);
				break;
			case "l":
				this.pos.x = -(this.change);
				break;
			case "d":
				this.pos.y = this.change;
				break;
			default:
				console.log("Animation.BounceBack.update: bad direction");
		}
		if(this.state == 3 && this.change >= 0) return true;
		return false;
	}
}
/**
 * @brief bounces in size (animated object seems to be stable)
 * @param axis 	: the axis in witch to bounce
 * @param args2 : intensity,
 * @param speed : how fast to bounce
 */
class BounceSize extends Animation {
	axis;
	intensity;
	speed;
	change;
	begin;		//saves time at a state switch

	constructor(axis, args2="1", speed=0.1) {
		super();
		this.axis = axis;
		if(args2 ==  "") args2 = "1";
		this.intensity = args2.split(',')[0];
		if(speed == "") speed = 0.1;
		this.speed = speed/9;
		this.change = 0.7;
		this.begin = 0;
	}

	update(delta) {
		//console.log("\tBounceSize");
		this.time += delta;
		//first delta might be way to big
		if(this.started) {
			this.time = delta = 20;
			this.started = false;
		}
		
		//manage states
		if(this.state == -1) this.state = 0;
		else if(this.state == 0 && this.time >= 1/this.speed) {
			this.state = 1;
			this.begin = this.time;
		}
		else if(this.state == 1 && this.time >= 1/this.speed *2) {
			this.state = 2;
			this.begin = this.time;
		}
		else if(this.state == 2 && this.time >= 1/this.speed *3) {
			this.state = 3;
			this.begin = this.time;
		}
		else if(this.state == 3 && this.time >= 1/this.speed *4) this.state = 4;
		
		//calculate curve
		if(this.state == 0) {
			this.change = g.CosineInterpolate(0, -5, this.time*this.speed);
		}
		else if(this.state == 1) {
			let mu = (this.time-this.begin)*(this.speed*2 -1/this.begin);
			this.change = g.CosineInterpolate(-5, 3, mu);
		}
		else if(this.state == 2) {
			let mu = (this.time-this.begin)/(1/this.speed*3 - this.begin);
			this.change = g.CosineInterpolate(3, 1, mu);
		}
		else if(this.state == 3) {
			let mu = (this.time-this.begin)/(1/this.speed*4 - this.begin);
			this.change = g.CosineInterpolate(1, 0, mu);
		}
		else if(this.state == 4) this.change = 0;

		//write back
		if(this.axis == "x") {
			//this.sizeMulti.x = this.change;
			this.sizeAdd.x = this.change*this.intensity;
			this.pos.x = - this.change*this.intensity/2;
		}
		else if(this.axis == "y") {
			//this.sizeMulti.y = this.change;
			this.sizeAdd.y = this.change*this.intensity;
			this.pos.y = - this.change*this.intensity/2;
		}
		else if(this.axis == "xy" || this.axis == "yx") {
			//this.sizeMulti.x = this.change;
			//this.sizeMulti.y = this.change;
			this.sizeAdd.x = this.change*this.intensity;
			this.sizeAdd.y = this.change*this.intensity;
			this.pos.x = - this.change*this.intensity/2;
			this.pos.y = - this.change*this.intensity/2;
		}
		else console.log("Animation.BounceSize.update: bad direction");

		//console.log(this.state);
		//console.log(this.time + ": "+ this.change);
		if(this.state == 4) return true;
		else return false;
	}
}
/**
 * @brief waits for args (default 50)
 */
class Wait extends Animation {
	args;args2;args3;
	constructor(args=50, args2="", args3="") {super();this.args=args;this.args2=args2;}

	update(delta) {
		//console.log("\tWait");
		this.time += delta;
		if(this.time >= this.args) return true;
		else return false;
	}
}
/**
 * @brief appear animation (negative intensity reverses the direction)
 * @param axis  : the axis in which to bounce
 * @param args2 : intensity
 * @param speed : how fast to bounce
 */
class AppearSize extends Animation {
	axis;
	intensity;
	speed;
	change;
	preChange;
	begin;		//saves time at a state switch

	constructor(axis, args2="1", speed=1) {
		super();
		this.axis = axis;
		if(args2 ==  "") args2 = "1";
		this.intensity = args2;
		if(speed == "") speed = 0.1;
		this.speed = speed/1200;
		this.change = -0.2;
		this.preChange = this.change;
		this.begin = 0;
	}

	update(delta) {
		//console.log("\t AppearSize");
		this.time += delta;
		//first delta might be way to big
		if(this.started) {
			this.time = delta = 20;
			this.started = false;
		}
		
		//calculate curve
		this.change = g.LinearInterpolate(this.preChange, 1.6, this.time*this.speed);//g.CosineInterpolate(0, 5, this.time*this.speed);

		this.preChange = this.change;
		

		//write back
		if(this.axis == "x") {
			this.sizeMulti.x = 1 + this.change*this.intensity;
		}
		else if(this.axis == "y") {
			this.sizeMulti.y = 1 + this.change*this.intensity;

		}
		else if(this.axis == "xy" || this.axis == "yx") {
			this.sizeMulti.x = 1 + this.change*this.intensity;
			this.sizeMulti.y = 1 + this.change*this.intensity;
		}
		else console.log("Animation.AppearSize.update: bad direction");

		//console.log(this.time + ": "+ this.change);
		if(this.change > 1.5) return true;
		else return false;
	}
}
