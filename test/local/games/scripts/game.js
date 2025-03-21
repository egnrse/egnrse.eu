/** 
 * @file game.js
 * @author Elia Nitsche
 * @date 29.02.2024
 * @brief main game class
 */
import Player from './player.js';
import Environment from './environment.js';
import Animation from './animation.js';
import { g } from './gameLibrary.js';

export default class Game {
	canvas;
	ctx;

	gameState;			// -1: init, 0: new Game
	player;
	environment;		//a list of objects
	
	blockSize = 40;		//size of a block in the game
	animation;			//list of all object names running an animation
	preTime;			//time of previous this.update() call
	
	constructor() {
		//console.log("new Game");
		// get the canvas element
		this.canvas = document.getElementById("htmlCanvas");
		this.ctx = this.canvas.getContext("2d");

		// setup event handlers
		window.addEventListener("resize", this.setCanvasSize.bind(this));
		window.addEventListener("keydown", this.keyDownEvent.bind(this));

		this.init();
	}

	/**
	 * @brief resets and inits the game
	 */
	init() {
		//console.log("init");
		this.gameState = -1;
		this.setCanvasSize();

		//position, size, velocity, color
		this.player = new Player(g.Point2D(2*this.blockSize,2*this.blockSize), g.Point2D(this.blockSize, this.blockSize));
		this.environment = [];
		this.environment.push(new Environment(g.Point2D(this.blockSize,this.blockSize), g.Point2D(this.blockSize,this.blockSize)));
		this.animation = [];
		this.preTime = 0;
	}

	/**
	 * @brief starts the game
	 */
	run() {
		this.gameState = 0;
		this.draw();
		
		//this.addAnimation("player", "Move", "u", 50);
		//this.addAnimation(1, "Nothing");
	}

	
	/**
	 * @brief add a new animation object
	 * @param who to animate, assumes environment[who] if who is a number
	 * @param what animation
	 * @param args,args2,args3 parameters for the animation
	 * 	args (direction,axis), args2 (string, distance), args3 (speed)
	 */
	addAnimation(who, what, args="", args2="", args3="") {
		let running = true;		//if there is a running animation
		if(this.animation.length < 1) {
			running = false;
		}

		//catch/throw 'who' not found errors
		try {
			//sort between player and environment
			if(typeof who === 'number') {	//environment animations
				this.environment[who].anim.addAnimation(what, args, args2, args3);
			}
			else {	//player animation
				this[who].anim.addAnimation(what, args, args2, args3);
			}
		}
		catch(err) {
			console.error(err);
			throw new Error("Game.addAnimation: requested 'who' not found/does not exist (who:'"+who+"')");
		}

		//test if 'who' is already in this.animation (only add it, if its not)
		let newObject = true;
		for(let i=0; i<this.animation.length;i++) {
			if(this.animation[i] == who) {
				newObject = false;
			}
		}
		if(newObject) {	this.animation.push(who); }

		//if no animation is already running
		if(!running) {
			requestAnimationFrame(this.update.bind(this));
		}
	}
	
	/**
	 * @brief draw a new frame to ctx
	 */
	draw(ctx=this.ctx) {
		this.ctx.clearRect(0,0, this.canvas.width, this.canvas.height)
		
		//this.player.draw(ctx);
		for(let i=0; i<this.environment.length;i++) {
			this.environment[i].draw(ctx);
		}

		this.player.draw(ctx);		//draw player last to be in top
	}

	/**
	 * @brief while animations are active update them
	 * @details uses a list of names(eg player)/numbers(environment) to store all running animations
	 * @idea use a animation object to save and manage animations, give the excecution to the object, save animation state in the object.
	 * currentTime */
	update(currentTime) {
		//time delta
		let delta = -1;
		if(typeof this.preTime === 'undefined') {
			delta = 0;
		}
		else {
			delta = currentTime - this.preTime;
		}
		//console.log("delta game: "+delta);
		
		this.collisions();

		let finished = [];		//list of finished animations
		for(let i=0;i<this.animation.length;i++) {
			if(typeof this.animation[i] === 'number') {	//environment animations
				//update the animation and tests if its done
				if(this.environment[this.animation[i]].update(delta) == false) {
					//console.log("not done");
				}
				else {
					//done
					finished.push(i);
				}

			}
			else {		//player animations
				//update the animation and tests if its done
				if(this[this.animation[i]].update(delta) == false) {
					//console.log("not done");
				}
				else {
					//done
					finished.push(i);
				}
			}
		}
		
		//delete all finished animations
		for(let i=finished.length-1;i>=0;i--) {
			this.animation.splice(finished[i],1);
			console.log("animation '"+ finished[i] +"' done");
		}
		//draw everything
		this.draw();

		//if animations are not done yet, get another frame
		if(this.animation.length > 0) {
			requestAnimationFrame(this.update.bind(this));
		}

		this.preTime = currentTime;
	}

	/**
	 * @brief test for collision between all objects (with solid=true)
	 */
	collisions() {
		let direction = -1;		//direction of bounce back animation
		let axis = -1;			//axis of bounce animation
		if(this.player.pos.x < 0) {
			this.player.pos.x = 0;
			direction = "r";
			axis = "x";
		}
		if(this.player.pos.y < 0) {
			this.player.pos.y = 0;
			direction = "d";
			axis = "y";
		}
		if(this.player.pos.x > this.canvas.width-this.player.size.x) {
			this.player.pos.x = this.canvas.width-this.player.size.x;
			direction = "l";
			axis = "x";
		}
		if(this.player.pos.y > this.canvas.height-this.player.size.y) {
			this.player.pos.y = this.canvas.height-this.player.size.y;
			direction = "u";
			axis = "y";
		}
		if(direction != -1) {
			this.addAnimation("player", "BounceBack", direction, this.blockSize);
			this.addAnimation("player", "BounceSize", axis, "2", 0.1);

		}
	}

	/// HANDLERS ///////
	
	/**
	 * @brief sets the canvas size to winSize percent of the inner window (updates on resize)
	 */
	setCanvasSize() {
		let winSize = 0.9;
		let height = window.innerHeight * winSize;
		let width = window.innerWidth * winSize;
		
		this.blockSize = Math.round(height/20);			//update blocksize
		let times = 0;
		for(let i=0;i < width/this.blockSize;i++) times++;
		this.canvas.width = times * this.blockSize;
		times = 0;
		for(let i=0;i < height/this.blockSize;i++) times++;
		this.canvas.height = times * this.blockSize;

		if(typeof this.player !== "undefined") this.draw(this.ctx);
	}

	/**
	 * @handles key down events
	 */
	keyDownEvent(event) {
		let key = event.keyCode;

		switch(this.gameState) {
			case 0:
				// arrow keys / wasd : player move
				if(key >= 37 && key <= 40 || key == 65 || key == 68 || key == 83 || key == 87) {
					this.player.step(key);
					this.addAnimation("player", "BounceSize", "xy", "0.3", 0.2);
				}
				if(key == 32) {		//space : draw/delete
					let empty = true;
					for(let i=0;i<this.environment.length;i++) {
						if(g.equals(this.environment[i].pos, this.player.pos) == true) {
							//console.log("found");
							this.environment.splice(i,1);
							empty = false;
							break;
						}
					}
					if(empty) {
						this.environment.push(new Environment({...this.player.pos}, {...this.player.size}));
					}
					this.addAnimation("player", "BounceSize", "xy", "1.8", 0.1);
				}
				if(this.animation.length < 1) {
					requestAnimationFrame(this.update.bind(this));
				}
				break;
		}
		//console.log(key);
	}
}
