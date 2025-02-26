/**
 * @brief the main game functions
 */

//console.log("test");

// Get the canvas element
var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

// constants
let sizeConst = 500;
const canvasStats = {width: canvas.width/sizeConst, height: canvas.height/sizeConst,
	size: sizeConst};

// variables
let running = false;	// if the game is running
let score = -1;
let restart = false;		// when the game is over
let rect = {	//player
		px: 0.4, py: 0.7,	//position xy
		vx: 0, vy: -(0.03),	//speed xy
		sx: 0.10, sy:0.10,	//scale xy
		color: "blue"
		};
let obstacles;
let obstCount;
let obstSpeed = 0.03;

let DIFFICULTIES = [0.5,0.4,0.35,0.3,0.26];
let dif = 2;	//0-4



// @brief initializes everything
function init() {
	running = false;
	score = 0;
	restart = false;

	//player
	rect = {
		px: 0.4, py: 0.7,	//position xy
		vx: 0, vy: -(0.03),		//speed xy
		sx: 0.10, sy:0.10,	//scale xy
		color: "blue"
		};
	rect.py = canvasStats.height - rect.sy*3;

	obstacles = [];
	obstCount = 0;
	obstacles.push(createObst(0.75));
	for(let i=0; i<5; i++){
		obstacles.push(createObst());
	}
	//console.log(canvasStats.height);
}

// @brief create an obstacle
function createObst(hForce=-1) {
	let obstInitDist = 0.7*canvasStats.width;
	let obstDistance = 1;	//distance between obstacles
	let w = DIFFICULTIES[dif];	//0.35
	let h = 1.5;
	if (canvasStats.height > 1.8) height=1.8;
	else height=canvasStats.height;
	if(hForce > 0) h = height*hForce;
	else h = Math.random()*(height-w);
	let x = obstInitDist + obstDistance*obstCount;

	obst = {
		px: x, py: h,	//position xy
		sx: 0.10, sy:w,	//scale xy
		counted: false,			//for the score
		color: "red"
	};
	obstCount++;
	return obst;
}

// @brief sets the canvas to a % of the window
function setCanvasSize() {
	let winSize = 0.9; 
	canvas.width = window.innerWidth * winSize;
	canvas.height = window.innerHeight * winSize;
	canvasStats.width = canvas.width/canvasStats.size;
	canvasStats.height = canvas.height/canvasStats.size;
}

// @brief translate game coordinates to screen cooridantes
// @param value value to translate
// @return the translated value 
function translateToScreen(value) {
	return value*canvasStats.size;
}

// @brief translate size from game size to screen size
// @param value value to translate
// @return the translated value 
function translateSize(value) {
	return value*canvasStats.size;
}

// @brief click event
function eventClick() {
	if(restart) {
		init()
		running = true;
	}
	rect.vy = -(0.05);
}


// @brief draw all stuff
function draw() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	//player
	//console.log(rect);
	if(rect.color != "none") {
		ctx.fillStyle = rect.color;
		ctx.fillRect(translateToScreen(rect.px), translateToScreen(rect.py), translateSize(rect.sx), translateSize(rect.sy));
	}
	//obstacles
	for(let i=0; i<obstacles.length; i++) {
		obst = obstacles[i];
		if(obst.color != "none") {
			ctx.fillStyle = obst.color;
			//color bellow and above (obst obj)
			ctx.fillRect(translateToScreen(obst.px), 0, translateSize(obst.sx), translateSize(obst.py));
			ctx.fillRect(translateToScreen(obst.px), translateToScreen(obst.py+obst.sy), translateSize(obst.sx), canvas.height);
		}
	}
}

// @brief gets called regulary, process every change over time
function tick() {
	delta = 1;	// update time in ms/100
	//gravity
	if(rect.py < canvasStats.height) rect.vy += 0.005*delta;
	
	//velocity
	rect.px += rect.vx*delta;
	rect.py += rect.vy*delta;

	//game borders
	if(rect.px > canvasStats.width) rect.px = 0;
	if(rect.px < 0) rect.px = canvasStats.width;
	if(rect.py > canvasStats.height - rect.sy) {rect.py = canvasStats.height - rect.sy;}
	if(rect.py < 0) rect.py = canvasStats.height;

	//obstacles
	len = obstacles.length;
	for(let i=0; i<len; i++) {
		let obst = obstacles[i];

		if(running){
			//obstacles collisions / scoring
			if(rect.px+rect.sx > obst.px && rect.px < obst.px + obst.sx) {
				if(running && !obst.counted) {
					//score
					obst.counted = true;
					obst.color = "green";
					score += 1;

					// create new element / clean up old ones
					obstacles.push(createObst());
					if(score > 2) {
						obstacles.shift();	//remove first element
					}
				}
				if(rect.py < obst.py || (rect.py+rect.sy) > obst.py+obst.sy) {
					//collide
					console.log(obst);
					running = false;
					restart = true;
				}
			}		
		
			//move obstacles
			obst.px += -obstSpeed*delta;
		}
	}
	//console.log(obstacles);	
	
	draw();
}


// @brief gets called on load
function onLoad() {
	// Call setCanvasSize initially and when window is resized
	setCanvasSize();
	window.addEventListener("resize", setCanvasSize);
	
	init();

	canvas.addEventListener('click', eventClick);
	restart = true;
	
	setInterval(tick, 100);
}

window.onload = onLoad();
