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
	animDrawList;		//a list of animation objects that need rendering (disappear after being finished)
	
	blockSize = 40;		//size of a block in the game
	animation;			//list of all object names running an animation
	preTime;			//time of previous this.update() call
	
	// helper vars for space+movement interactions
	spaceJustDown = false;	// if space just got pressed (resets on 'space' keyUp event)
	prevSpaceEvent;			// the previous event that pressing space triggered (either 'draw' or 'delete')
	moveDraw = false;		// if we are in a moving draw (space down while moving)
	colors = ["red","orange","yellow","teal","pink","purple","crimson","green","white","black","blue"];	//0-9 : drawing colors, 10 : player color
	drawingColor = this.colors[0];	// the color new env objects appear in

	constructor() {
		//console.log("new Game");
		// get the canvas element
		this.canvas = document.getElementById("htmlCanvas");
		this.ctx = this.canvas.getContext("2d");

		// setup event handlers
		window.addEventListener("resize", this.setCanvasSize.bind(this));
		window.addEventListener("keydown", this.keyDownEvent.bind(this));
		window.addEventListener("keyup", this.keyUpEvent.bind(this));
		// button events
		document.getElementById("clearButton").addEventListener("mouseup", this.clearScreenButton.bind(this));
		document.getElementById("saveButton").addEventListener("mouseup", this.saveButton.bind(this));
		document.getElementById("loadButton").addEventListener("mouseup", this.loadButton.bind(this));
		document.getElementById("loadFileInput").addEventListener("change", this.inputFileChanged.bind(this));

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
		this.player = new Player(g.Point2D(2*this.blockSize,2*this.blockSize), g.Point2D(this.blockSize, this.blockSize), g.Point2D(), this.colors[10]);
		this.animDrawList = [];
		this.animation = [];
		this.preTime = 0;

		this.spaceJustDown = false
		this.moveDraw = false
		this.drawingColor = this.colors[0];

		this.environment = [];
		this.environment.push(new Environment(g.Point2D(this.blockSize,this.blockSize), g.Point2D(this.blockSize,this.blockSize), undefined, this.drawingColor));
	}

	/**
	 * @brief starts the game (and draws the first frame)
	 */
	run() {
		this.gameState = 0;

		
		//this.addAnimation("player", "Move", "u", 50);
		//this.addAnimation(1, "Nothing");

		this.draw();
	}

	
	/**
	 * @brief add a new animation object
	 * @param who to animate, assumes environment[who] if who is a number (number, obj, or "player")
	 * @param what animation (name of the animation class)
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
			//sort between environment, playerand other
			if(typeof who === 'number') {	//environment animations
				this.environment[who].anim.addAnimation(what, args, args2, args3);
			}
			else if(who == "player"){	//player animation
				this[who].anim.addAnimation(what, args, args2, args3);
			}
			else {	///other animation
				who.anim.addAnimation(what, args, args2, args3);
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
		
		for(let i=0; i<this.environment.length;i++) {
			this.environment[i].draw(ctx);
		}
		for(let i=0; i<this.animDrawList.length;i++) {
			this.animDrawList[i].draw(ctx);
		}

		this.player.draw(ctx);		//draw player last to be in top
	}

	/**
	 * @brief while animations are active update them
	 * @details uses a list of names(eg player)/numbers(environment) to store all running animations
	 * @idea use a animation object to save and manage animations, give the excecution to the object, save animation state in the object.
	 * currentTime */
	update(currentTime) {
		//console.log(this.environment);

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
				else { finished.push(i); }

			}
			else if(this.animation[i] == "player"){		//player animations
				//update the animation and tests if its done
				if(this[this.animation[i]].update(delta) == false) {
					//console.log("not done");
				}
				else { finished.push(i); }
			}
			else {		//other animations
				//update the animation and tests if its done
				if(this.animation[i].update(delta) == false) {
					//console.log("not done");
				}
				else { finished.push(i); }
			}

		}
		
		//delete all finished animations
		for(let i=finished.length-1;i>=0;i--) {
			//console.log("animation '"+ i +"' done");
			// remove from animDrawList (if exists)
			for(let j=0;j<this.animDrawList.length;j++) {
				if(this.animation[i] == this.animDrawList[j]) {
					this.animDrawList[j] = null;
					this.animDrawList.splice(j,1);
				}
			}
			this.animation[i] = null;
			this.animation.splice(i,1);
		}

		//draw everything
		this.draw();

		//if animations are not done yet, get another frame
		if(this.animation.length > 0) {
			requestAnimationFrame(this.update.bind(this));
		}

		this.preTime = currentTime;
	}


	/// HELPER FUNCTIONS ////////////////////
	
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

	/**
	 * @brief test if an object in environment is on position given by point 
	 * @param g.Point2D point: the point to search at
	 * @returns the index in environment if found, else -1
	 */
	envExist(point) {
		for(let i=0;i<this.environment.length;i++) {
			if(g.equals(this.environment[i].pos, point) == true) {
				//console.log("found")
				return i;
			}
		}
		return -1;
	}

	/**
	 * @brief draw or delete a square at point with size
	 * 		depending different factors (eg. environment, prevSpaceEvent, moveDraw, drawingColor)
	 * 		(also animates the player)
	 * @param g.Point2D point: where to draw/delete
	 * @param g.Point2D size: how big to draw/delete
	 */
	interactEnv(point=this.player.pos, size=this.player.size) {
		//console.log(this.moveDraw+", "+this.prevSpaceEvent);
		let empty = true;	// if the current position is empty (and should be drawn on)
		let indexFound = this.envExist(point)
		if(indexFound >= 0) {
			empty = false;
			// overwrite differently colored patches (if not in a movedraw)
			if((!this.moveDraw || this.prevSpaceEvent == "draw") && this.environment[indexFound].color != this.drawingColor) {
				this.prevSpaceEvent = "draw";
				this.environment[indexFound].color = this.drawingColor;
			}
			// handle deletion
			else if(!this.moveDraw || this.prevSpaceEvent == "delete") {
				// animation
				let animTry = new Environment(g.Point2D(), g.Point2D(1,1), undefined, "blue", "strokeRect");
				animTry.lineWidth = 2;
				animTry.color = this.environment[indexFound].getColor;
				animTry.pos = this.environment[indexFound].getPos;
				animTry.size = this.environment[indexFound].getSize;
				animTry.solid = false;
				this.animDrawList.push(animTry);
				this.addAnimation(animTry, "AppearSize", "xy");
				this.addAnimation(animTry, "FadeOut");
				
				//console.log("deleting")
				this.prevSpaceEvent = "delete";
				this.environment[indexFound] = null;
				this.environment.splice(indexFound,1);
			}
		}//if(indexFound >= 0)
		if(empty) {
			if(!this.moveDraw || this.prevSpaceEvent == "draw") {
				//console.log("drawing")
				this.prevSpaceEvent = "draw";
				this.environment.push(new Environment({...point}, {...size}, undefined, this.drawingColor));
			}
		}
		if(!this.moveDraw) {
			this.addAnimation("player", "BounceSize", "xy", "1.8", 0.1);
		}
	}

	/**
	 * @brief clear the screen (delete, all objects in environment)
	 */
	clearScreen() {
		//console.log("clear screen");
		for(let i=this.environment.length-1; i>=0; i--) {
			// animation
			let animTry = new Environment(g.Point2D(), g.Point2D(1,1), undefined, "blue", "strokeRect");
			animTry.lineWidth = 2;
			animTry.color = this.environment[i].getColor;
			animTry.pos = this.environment[i].getPos;
			animTry.size = this.environment[i].getSize;
			animTry.solid = false;
			this.animDrawList.push(animTry);
			this.addAnimation(animTry, "AppearSize", "xy");
			this.addAnimation(animTry, "FadeOut");
			
			// delete
			this.environment[i] = null;
		}
		
		// reset environment
		this.environment = null;
		this.environment = [];

		//updated the screen
		requestAnimationFrame(this.update.bind(this));
	}

	/**
	 * @brief save an env array data (as a json) to a file
	 * @param data: the data to save
	 * @param name: the name of the saved file
	 */
	saveEnvToUserDisk(data, name="canvasSave.json") {
		const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		
		// create a download link
		const a = document.createElement("a");
		a.href = url;
		a.download = name;
		document.body.appendChild(a);
		a.click();

		// cleanup
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}
	/**
	 * @brief load a file and save to this.environment (overwrites this.environment)
	 * @details expects the file to be an array of Environment objects as json
	 * @param the file to load
	 */
	loadEnvFromUserDisk(file) {
		if(!file) {
			console.warn("Game.loadEnvFromUserDisk: no file selected");
			return;
		}
		let fr = new FileReader();
		fr.onload = (e) => {
			let x = fr.result;
			let preEnv = JSON.parse(x);
			//console.log(preEnv);
			let postEnv = [];
			//convert each object in preEnv to the class Environment
			for(let i=0; i<preEnv.length;i++) {
				let obj = new Environment();
				Object.assign(obj, preEnv[i]);
				postEnv.push(obj);
			}
			//returns the result
			this.environment = postEnv;
			//console.log(this.environment);
			
			//updated the screen
			requestAnimationFrame(this.update.bind(this));
		}
		fr.readAsText(file);
	}
	


	/// HANDLERS ////////////////////
	
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
	 * @brief handles key up events
	 */
	keyUpEvent(event) {
		let key = event.keyCode;
		//console.log(key+" up")

		switch(this.gameState) {
			case 0:
				if(key == 32) {		//space 
					this.spaceJustDown = false;
					this.moveDraw = false;
				}
		}

	}

	/**
	 * @brief handles key down events
	 */
	keyDownEvent(event) {
		let key = event.keyCode;
		//console.log(key+" down");

		switch(this.gameState) {
			case 0:
				// arrow keys / wasd : player move
				if(key >= 37 && key <= 40 || key == 65 || key == 68 || key == 83 || key == 87) {
					this.player.step(key);
					this.addAnimation("player", "BounceSize", "xy", "0.3", 0.2);
					if(this.spaceJustDown) {
						this.moveDraw = true;
						this.interactEnv(this.player.pos, this.player.size);
					}
					else {
						this.moveDraw = false;
					}
				}
				if(key == 32) {		//space : draw/delete
					//console.log("SPACE")
					if(!this.spaceJustDown) {	// dont react if space just got pressed
						this.spaceJustDown = true;

						//draw or delete
						this.interactEnv(this.player.pos, this.player.size);
					}
					else {	// if space is already longer down
						//console.log("already down")
					}
				}
				if(key >= 48 && key <= 57) {	//0-9 : change the color to draw with
					let num = key - 48;
					//console.log("color change to "+num);
					this.drawingColor = this.colors[num];
				}
				if(this.animation.length < 1) {
					requestAnimationFrame(this.update.bind(this));
				}
				break;
		} // switch
	} // keyDownEvent

	/** @brief react to the CLEAR button (clear the screen) */
	clearScreenButton() {
		//console.log("CLEAR button");
		this.clearScreen()
	}
	/** @brief react to the SAVE button (save the canvas) */
	saveButton() {
		//console.log("SAVE button");
		this.saveEnvToUserDisk(this.environment);
	}
	/** @brief react to the LOAD button (load a *.json file with a hidden input box) */
	loadButton() {
		//console.log("LOAD button");
		document.getElementById("loadFileInput").click();
	}
	/**
	 * @brief react to file change events (loads a *.json file and replaces this.environment)
	 */
	inputFileChanged(event) {
		let file = event.target.files[0];
		this.loadEnvFromUserDisk(file, this.environment);
	}
}

	

/* 
 * Just some maybe useful stuff for later
 * throw new Warning("Game.keyDownEvent: invalid 'this.prevSpaceEvent' (prevSpaceEvent:'"+this.prevSpaceEvent+"')");
 *
 *
 * buffer.byteLength
 *
 * reader.readAsArrayBuffer(file); (for eg audio)
 *
 * this.testSound = new Audio("./assets/test.wav");
 * this.testSound.play();
 *
 */
