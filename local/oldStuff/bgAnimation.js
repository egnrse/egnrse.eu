/**
 * @brief a background animation
 */

var particlesCount = 100; 	//amount of stuff
var speedMax = 0.05;
var sizeMax = 23;
var mode2Threshold = 130;

var objects = [];
var mouse = new point();	//mouse position
var pre = 0;
var speed = 1;
var mode = "0";		//0:bubble, 1: darkmode

//point (maxX, maxY)
function point(x=0,y=0) {
	this.x = Math.random() * x;
	this.y = Math.random() * y;
}

//creates a particle
function Particle() {
	this.pos = new point(canvas.width, canvas.height);
	this.vel = new point(speedMax,speedMax);
	if(this.vel.x == 0) this.vel.x = speedMax/4;
	if(this.vel.y == 0) this.vel.y = speedMax/4;
	if(objects.length%2 == 0) this.vel.x *= -1;
	if(objects.length%2 == 0) this.vel.y *= -1;
	this.size = Math.min(Math.random(),Math.random())*sizeMax;
	if(this.size == 0)this.size = sizeMax/4;
	let light = Math.min(Math.random()*255*this.vel.x*this.vel.y/speedMax**2, 255);
	this.color = "rgb("+light+","+(light+50)+","+230+")";
}

function mouseMove(e) {
	mouse.x = e.clientX;
	mouse.y = e.clientY;
}
function setCanvasSize() {
	canvas.height = window.innerHeight;
	canvas.width = window.innerWidth;
}

function switchMode() {
	mode++;
	if(mode > 1) mode = 0;

	if(mode == 1) {
		rangeSlider.removeAttribute("hidden");
		h1.style.color = "Grey";
	}
	if(mode == 0) {
		rangeSlider.setAttribute("hidden", "hidden");
		h1.style.color = "#C893DC";
		canvas.style.backgroundColor = "#330080";
	}

}

function getDistance(x1,y1,x2,y2) {
	let distance = Math.sqrt((x1 - x2)**2 + (y1 - y2)**2);
	return distance;
}


// inits everything
function init() {
	setCanvasSize();
	objects = [];
	for(let i=0;i<particlesCount;i++) {
		objects.push(new Particle());
	}
}

//draws a new frame
function draw() {
	if(mode == 0) {
		ctx.clearRect(0,0, canvas.width, canvas.height);
	}
	else if(mode == 1) {
		ctx.rect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = "rgba(0,0,0,0.006)";
		ctx.fill();
	}

	//console.log(objects);
	for(let i=0;i<objects.length;i++) {
		if(mode == 0) {
			ctx.beginPath();
			ctx.arc(objects[i].pos.x, objects[i].pos.y, objects[i].size, 0, 2 * Math.PI);
			ctx.fillStyle = objects[i].color;
			ctx.fill();
		}
		if(mode == 1) {
			for(let j=0;j<objects.length;j++) {
				if(i !== j) {
					let distance = getDistance(objects[i].pos.x, objects[i].pos.y, objects[j].pos.x, objects[j].pos.y);
					if(distance < mode2Threshold) {
						ctx.beginPath();
						ctx.moveTo(objects[i].pos.x, objects[i].pos.y);
						ctx.lineTo(objects[j].pos.x, objects[j].pos.y);
						ctx.lineWidth = (mode2Threshold - distance)/100;
						ctx.strokeStyle = "white";
						ctx.stroke();
					}
				}
				else {		//draw line to mouse
					let distance = getDistance(objects[i].pos.x, objects[i].pos.y, mouse.x, mouse.y);
					if(distance < mode2Threshold) {
						ctx.beginPath();
						ctx.moveTo(objects[i].pos.x, objects[i].pos.y);
						ctx.lineTo(mouse.x, mouse.y);
						ctx.lineWidth = (mode2Threshold - distance)/100;
						ctx.stroke();
					}
				}
			}
		}//if(mode == 1)
	}//for
}//draw()

//update locations
function update(time) {
	var delta = time - pre;
	
	for(let i=0;i<objects.length;i++){
		objects[i].pos.x += objects[i].vel.x * speed;
		objects[i].pos.y += objects[i].vel.y * speed;

		//collisions with walls
		if(objects[i].pos.x < 0+objects[i].size) {
			objects[i].pos.x = 0+objects[i].size;
			objects[i].vel.x = - objects[i].vel.x;
		}
		if(objects[i].pos.x > canvas.width-objects[i].size) {
			objects[i].pos.x = canvas.width-objects[i].size;
			objects[i].vel.x = - objects[i].vel.x;
		}
		if(objects[i].pos.y < 0+objects[i].size) {
			objects[i].pos.y = 0+objects[i].size;
			objects[i].vel.y= - objects[i].vel.y;
		}
		if(objects[i].pos.y > canvas.height-objects[i].size) {
			objects[i].pos.y = canvas.height-objects[i].size;
			objects[i].vel.y = - objects[i].vel.y;
		}

		//collision with the mouse
		let distance = Math.sqrt((objects[i].pos.x - mouse.x)**2 + (objects[i].pos.y - mouse.y)**2);
		if(distance < 5 && mode == 0) {
			objects[i].vel.x = - objects[i].vel.x;
			objects[i].vel.y= - objects[i].vel.y;
		}
	}
	pre = time;
	draw();
	requestAnimationFrame(update);
}

const canvas = document.getElementById("bgCanvas");
const ctx = canvas.getContext("2d");
const speedSlider = document.getElementById("speed");
const rangeSlider = document.getElementById("range");
const h1 = document.getElementById("h1");

document.addEventListener("mousemove", mouseMove);
document.addEventListener("input", () => {speed = speedSlider.value < 2 ? speedSlider.value : 2+(speedSlider.value-2)**3;})
document.addEventListener("input", () => {mode2Threshold = rangeSlider.value;})
document.addEventListener("keydown", () => {if(event.key === "ArrowUp") {objects.push(new Particle())}})
document.addEventListener("keydown", () => {if(event.key === "ArrowDown") {objects.pop()}})

window.addEventListener("resize", setCanvasSize);

init();
draw();

update();
