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
let diffBox = document.getElementById("difficultySelect");
let scoreLabel = document.getElementById("scoreLabel");
let maxScoreLabel = document.getElementById("maxScoreLabel");
let fpsBox = document.getElementById("fpsBox");
let maxFPS;		// 5-inf

//dev
let notGOD = true;

// variables
let running = false;	// if the game is running
let start = false;		// for the start animation
let score = -1;			// count of achieved obstacles
let maxScore = -1;		// maximal writeScore(score) value
let restart = false;	// when the game is over
let preTime;

let rect = {	//player
		px: 0.4, py: 0.7,	//position xy
		vx: 0, vy: -(0.03),	//speed xy
		sx: 0.10, sy:0.10,	//scale xy
		color: "blue"
		};
let obstacles;
let obstSpeed = 0.03;

//difficulty
let DIFFICULTIES = [0.5,0.4,0.35,0.3,0.24];	//gap
let distDIFF = [1,0.9,0.8,0.8,0.8];			//obstacle distance
let speedDIFF = [0.85,0.95,1,1.1,1.3];		//speed multiplier
let dif = 2;	//0-4


// @brief initializes everything
function init() {
	running = false;
	score = 0;
	restart = false;
	preTime = undefined;

	dif = diffBox.value;
	maxFPS = fpsBox.value.replace(/[^0-9]/g, '');
	if(maxFPS < 5) maxFPS = 5;
	scoreLabel.textContent = writeScore(score);

	//player
	rect = {
		px: 0.4, py: 0.7,	//position xy
		vx: 0, vy: -(0.03),		//speed xy
		sx: 0.10, sy:0.10,	//scale xy
		color: "blue"
		};
	rect.py = canvasStats.height - rect.sy*3;

	obstacles = [];
	obstacles.push(createObst(0.75));
	for(let i=0; i<5; i++){
		obstacles.push(createObst());
	}
	//console.log(canvasStats.height);
	
}

// @brief create an obstacle
function createObst(hForce=-1) {
	let obstInitDist = 0.7*canvasStats.width;
	let obstDistance = distDIFF[dif];	//distance between obstacles
	let w = DIFFICULTIES[dif];	//0.35
	
	let h = 1.5;
	if (canvasStats.height > 1.8) height=1.8;
	else height=canvasStats.height;
	if(hForce > 0) h = height*hForce;
	else h = Math.random()*(height-w);
	
	let x = obstInitDist;
	if(obstacles.length > 0) x = obstacles.at(-1).px+obstDistance;
	let wrapThresh = 0.86;
	if(obstacles.length > 0 && obstacles.at(-1).py > (height-w)*wrapThresh && h > (height-w)*wrapThresh && w < 0.32) x+=obstDistance/2;

	obst = {
		px: x, py: h,	//position xy
		sx: 0.10, sy:w,	//scale xy
		counted: false,			//for the score
		color: "red"
	};
	return obst;
}

// @brief sets the canvas to a % of the window
function setCanvasSize() {
	let winSize = 0.9; 
	canvas.width = window.innerWidth * winSize;
	height = window.innerHeight * winSize;
	//console.log(height);
	let maxHeight = 600;
	if(height > maxHeight) height=maxHeight;
	canvas.height = height;
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
	start = false;
	if(restart) {
		init()
		running = true;
		requestAnimationFrame(tick);
	}
	rect.vy = -(0.05);
}

// @brief return the score in a coded way (including difficulty, rounded)
// @param score
// @return string with a coded score
function writeScore(score) {
	return (score*1.5**(dif-2)).toFixed(2);
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
function tick(time) {
	// skip rendering if tick was called too soon (limited by maxFPS)
	let t = (1000/maxFPS)-(time-preTime)-1;
	if(t > 0) {
		setTimeout(function () {
			if(running||start) requestAnimationFrame(tick);
		}, t);
		return;
	}

	let delta = 1;	// update time in ms/100 (kinda?)
	if(preTime) {
		delta = (time - preTime)/50;
		//console.log("FPS: "+(1000/(50*delta)));
	}
	// speed depends on difficulty and score
	let speedMulti = speedDIFF[dif]*(1+(score*0.004));
	delta = delta*speedMulti;

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
	del = false;
	len = obstacles.length;
	for(let i=0; i<len; i++) {
		let obst = obstacles[i];

		if(running){
			//move obstacles
			obst.px += -obstSpeed*delta;
			//obstacles collisions / scoring
			if(rect.px+rect.sx > obst.px && rect.px < obst.px + obst.sx) {
				if(running && !obst.counted) {
					//score
					obst.counted = true;
					obst.color = "green";
					score += 1;
					scoreLabel.textContent = writeScore(score);

					// create new element / clean up old ones
					obstacles.push(createObst());
					if(score > 2) {
						del = true;
					}
				}
				if(rect.py < obst.py || (rect.py+rect.sy) > obst.py+obst.sy) {
					//collide
					if(notGOD) running = false;
					
					//score:
					if(obst.counted) score--;
					scoreLabel.textContent = writeScore(score);
					//update maxScore	
					if(writeScore(score) > maxScore) {
						maxScore = writeScore(score);
						//console.log("maxScore:"+maxScore+",  score:"+score);
						// save to maxScore to localStorage
						if(localStorage) localStorage.maxScore = maxScore;
						maxScoreLabel.textContent = maxScore;
					}
					if(!notGOD) score = -1;
					
					if(notGOD) restart = true;
					//console.log(obst);
				}
		
			}//within x bounds
		}//if(running)
	}
	// cleanup
	if(del) {
		obstacles[0] = null;
		obstacles.shift();	//remove first element
		del = false;
	}
	else if(del > 0) console.warn("in tick(): del is "+del+" this should not happen.");
	//console.log(obstacles);	
	
	draw();

	preTime = time;
	if(running||start) requestAnimationFrame(tick);
}


// @brief gets called on load
function onLoad() {
	start = true;
	// Call setCanvasSize initially and when window is resized
	setCanvasSize();
	window.addEventListener("resize", setCanvasSize);
	
	init();

	//fetch maxScore from localStorage (local browser storage), if it exists
	if(localStorage && 'maxScore' in localStorage) {
		console.log("Importing localStorage.maxScore:"+localStorage.maxScore);
		maxScore = localStorage.maxScore;
		//localStorage.maxScore = 0;		//dev
		maxScoreLabel.textContent = maxScore;
	}

	canvas.addEventListener('click', eventClick);
	window.addEventListener('keydown', function(event) {if(event.key === " ") eventClick();});
	canvas.addEventListener("touchstart", function(event) { event.preventDefault(); eventClick(); });
	restart = true;
	
	requestAnimationFrame(tick);
	//setInterval(tick, 100);
}

window.onload = onLoad();
