// multiline text hack
CanvasRenderingContext2D.prototype.wrapText = function (text, x, y, maxWidth, lineHeight) {

    var lines = text.split("\n");

    for (var i = 0; i < lines.length; i++) {

        var words = lines[i].split(' ');
        var line = '';

        for (var n = 0; n < words.length; n++) {
            var testLine = line + words[n] + ' ';
            var metrics = this.measureText(testLine);
            var testWidth = metrics.width;
            if (testWidth > maxWidth && n > 0) {
                this.fillText(line, x, y);
                line = words[n] + ' ';
                y += lineHeight;
            }
            else {
                line = testLine;
            }
        }

        this.fillText(line, x, y);
        y += lineHeight;
    }
}

// Create the canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = 512;
canvas.height = 512;
var centerX = canvas.width/2;
var centerY = canvas.height/2;
var radius = 216;
document.body.appendChild(canvas);
var duckTheta = 0.1;
var duckRadius = 0;
var foxTheta = 0;
var duckTravelDirection = 0;

var newx = 0;
var newy = 0;

var caught = 0;
var escapes = 0;

// Background image
var bgReady = false;
var bgImage = new Image();
bgImage.onload = function () {
	bgReady = true;
};
bgImage.src = "images/background.png";

// duck image
var duckReady = false;
var duckImage = new Image();
duckImage.onload = function () {
	duckReady = true;
};
duckImage.src = "images/duck.png";

// fox image
var foxReady = false;
var foxImage = new Image();
foxImage.onload = function () {
	foxReady = true;
};
foxImage.src = "images/fox.png";

// Game objects
var duck = {
	speed: 256 // movement in pixels per second
};
var fox = {
	speed: 1024 // 4 * duck speed
};

// Handle keyboard controls
var keysDown = {};

addEventListener("keydown", function (e) {
	keysDown[e.keyCode] = true;
}, false);

addEventListener("keyup", function (e) {
	delete keysDown[e.keyCode];
}, false);

// Reset the game when the player catches a fox
var reset = function () {
	duck.x = canvas.width / 2 - 16;
	duck.y = canvas.height / 2 - 15;

	// Throw the fox somewhere on the screen randomly
	//fox.x = 32 + (Math.random() * (canvas.width - 64));
	//fox.y = 32 + (Math.random() * (canvas.height - 64));
	foxStartTheta = Math.random()*Math.PI*2;
	fox.x = centerX -16 + radius * Math.cos(foxStartTheta);
	fox.y = centerY -16 + radius * Math.sin(foxStartTheta);

};

// Update game objects
var update = function (modifier) {

	newx = duck.x;
	newy = duck.y;
	if (38 in keysDown||40 in keysDown||37 in keysDown||39 in keysDown){
		if (38 in keysDown) { // Player holding up
			newy -= duck.speed * modifier;
		}
		if (40 in keysDown) { // Player holding down
			newy += duck.speed * modifier;
		}
		if (37 in keysDown) { // Player holding left
			newx -= duck.speed * modifier;
		}
		if (39 in keysDown) { // Player holding right
			newx += duck.speed * modifier;
		}
		// direction the duck travels in
		duckTravelDirection = Math.atan2(duck.y - newy,duck.x - newx);

		duck.x -=duck.speed*modifier*Math.cos(duckTravelDirection);
		duck.y -=duck.speed*modifier*Math.sin(duckTravelDirection);
	}

	
	// fox angle from center of pond
	foxTheta = Math.atan2(fox.y-centerY+16,fox.x-centerX+16)
	
	// duck angle and distance from center of pond
	duckTheta = Math.atan2(duck.y-centerY+16,duck.x-centerX+16)
	duckRadius = Math.sqrt((duck.x-centerX+16)*(duck.x-centerX+16)+(duck.y-centerY+16)*(duck.y-centerY+16));
	
	if (foxTheta < 0){
		foxTheta+=(Math.PI*2);
	}

	if (duckTheta < 0){
		duckTheta+=(Math.PI*2);
	}

	// length traveled along the circle: L=theta*r which gives theta=L/r (the fox can travel at most [speed/radius])
	var foxAngularSpeed=fox.speed/radius*modifier; //(1024/200=5.12 radians per step)
	
	if (duckTheta > foxTheta){ 
		if (duckTheta-foxTheta > 3){
			foxTheta -= foxAngularSpeed;
		} else {
			foxTheta += foxAngularSpeed;
		}
	} else { 
		if (foxTheta-duckTheta > 3){
			foxTheta += foxAngularSpeed;
		} else {
			foxTheta -= foxAngularSpeed;
		}
	}
	
	fox.x = centerX -16 + radius * Math.cos(foxTheta);
	fox.y = centerY -16 + radius * Math.sin(foxTheta);

	// Are they touching?
	if (
		duck.x <= (fox.x + 20)
		&& fox.x <= (duck.x + 20)
		&& duck.y <= (fox.y + 20)
		&& fox.y <= (duck.y + 20)
	) {
		++caught;
		reset();
	}else if (duckRadius >=radius){
		++escapes;
		reset();
	}
};

// Draw everything
var render = function () {
	if (bgReady) {
		ctx.drawImage(bgImage, 0, 0);
	}


	// Score
	ctx.fillStyle = "rgb(250, 250, 250)";
	ctx.font = "24px Helvetica";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	//ctx.fillText("X: " + duck.x + "\\nY:" + duck.y +"\\nDuck theta: " + duckTheta, 32, 32);
	ctx.wrapText(//"X: " + duck.x + "\n"+
					//"Y:" + duck.y +"\n"+
					//"Duck theta: " + duckTheta+"\n"+
					//"Duck Radius: " + duckRadius +"\n"+
					//"Fox theta: " + foxTheta + "\n"+
					//"duckTravelDirection: "+duckTravelDirection+"\n"+
					"Caught: "+caught+"\n"+
					"Escapes: "+escapes, 32, 32,500,32);
	ctx.beginPath();
	

	/*// draw pond
    var radius = 200;

	var centerX = canvas.width / 2;
    var centerY = canvas.height / 2;
	
	ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
	ctx.fillStyle = 'blue';
	ctx.fill();
	ctx.lineWidth = 5;
	ctx.strokeStyle = '#003300';
	ctx.stroke();
	*/// end pond


	if (duckReady) {
		ctx.drawImage(duckImage, duck.x, duck.y);
	}

	if (foxReady) {
		ctx.drawImage(foxImage, fox.x, fox.y);
	}
};

// The main game loop
var main = function () {
	var now = Date.now();
	var delta = now - then;

	update(delta / 3000);
	render();

	then = now;
};

// Let's play this game!
reset();
var then = Date.now();
setInterval(main, 1); // Execute as fast as possible
