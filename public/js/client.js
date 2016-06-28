var canvas = document.getElementById("canvas");
var ctx = canvas.getContext && canvas.getContext('2d');

var rows = 3;
var cols = 3;
var rgbvalue = [];

function drawimg() {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
}

function clearimg() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function updateslider() {
    dispDiv.innerHTML = "Number of tiles: " + slider.value + "x" + slider.value;
}

function process() {
    if (slider.value == 0) {
	clearimg();
	drawimg();
	updateslider();
    }
    else {
			    
    rows = slider.value;
    cols = slider.value;
    canvas.width = img.width;
    canvas.height = img.height;

    var pieces = [];
    var pieceWidth = img.width / cols;
    var pieceHeight = img.height / rows;
	
    drawimg();
    
    for (var row = 0; row < rows; row++) {
	for (var col = 0; col < cols; col++) {
	    pieces.push({
		    col: col,
			row: row
			});
	}
    }
    var tiles = rows * cols;
    var hexcolors = []; //new Array('tiles');
    hexcolors = getcolors(rows, cols, pieces, pieceWidth, pieceHeight);
    
    var radios = document.forms["shapes"].elements["shape"];
    if (radios[0].checked) {
	clearimg();
	drawMosaicRect(hexcolors, rows, cols, pieceWidth, pieceHeight);
	updateslider();
    }
    else if (radios[1].checked) {
	clearimg();
	drawMosaicCirc(hexcolors, rows, cols, pieceWidth, pieceHeight);
	updateslider();
    }
    else {
	clearimg();
	drawimg();
    }
    for(var i = 0, max = radios.length; i < max; i++) {
	radios[i].onclick = function() {
	    if (this.value == "square") {
		clearimg();
		drawMosaicRect(hexcolors, rows, cols, pieceWidth, pieceHeight);
		updateslider();
	    }
	    if (this.value == "circle") {
		clearimg();
		drawMosaicCirc(hexcolors, rows, cols, pieceWidth, pieceHeight);
		updateslider();
	    }
	}
    }
    }
}

function getcolors(rows, cols, pieces, pieceWidth, pieceHeight) {
    var imgdata = [];
    var hexcolors = [];
    var i = 0;
    for (var y = 0; y < rows; y++) {
	for (var x = 0; x < cols; x++) {
	    imgdata.push(ctx.getImageData(x * pieceWidth, y * pieceHeight, pieceWidth, pieceHeight)); 
	    
	    var pixelInterval = 5, // Rather than inspect every single pixel in the image inspect every 5th pixel
		count = 0,
		k = -4,
		data, datalength;
	    
	    var rgbval = {r:102,g:102,b:102};
	    data = imgdata[i].data;
	    datalength = data.length;
	    
	    while ((k += pixelInterval * 200) < datalength) {
		count++;
		rgbval.r += data[k];
		rgbval.g += data[k+1];
		rgbval.b += data[k+2];
	    }
	    
	    // floor the average values to give correct rgb values (ie: round number values)
	    rgbval.r = Math.floor(rgbval.r/count);
	    rgbval.g = Math.floor(rgbval.g/count);
	    rgbval.b = Math.floor(rgbval.b/count);
	    
	    // Bitwise operation for fast rgb to hex conversion
	    var bin = rgbval.r << 16 | rgbval.g << 8 | rgbval.b;
	    hexcolors.push('\#'.concat(bin.toString(16).toUpperCase()));
	    i++;
	}
    }
    return hexcolors;
}

function drawMosaicRect(hexcolors, rows, cols, pieceWidth, pieceHeight) {
    var i = 0;
    for (var y = 0; y < rows; y++) {
	for (var x = 0; x < cols; x++) {
	    ctx.fillStyle = hexcolors[i++];
	    ctx.fillRect( x * pieceWidth, y * pieceHeight, pieceWidth, pieceHeight);
	}
    }
}

function drawMosaicCirc(hexcolors, rows, cols, pieceWidth, pieceHeight) {
    var i = 0;
    for (var y = 0; y < rows; y++) {
        for (var x = 0; x < cols; x++) {
	    ctx.fillStyle = hexcolors[i];
	    ctx.beginPath();
	    //ctx.clearRect (0, 0, canvas.width, canvas.height);
	    //ctx.fill();
	    ctx.lineWidth = 0;
	    ctx.strokeStyle = hexcolors[i++];
	    ctx.stroke();
	    ctx.arc((x* pieceWidth)+pieceWidth/2, (y * pieceHeight)+pieceHeight/2, pieceWidth, 2*Math.PI, false);
	    ctx.fill();
	    
	}
    }
}


var slider = document.getElementById("slider");
var dispDiv = document.getElementById("dispDiv");
    
var img = new Image();
img.src = imgsrc;
console.log(img.src);
img.onload = process;
img.crossOrigin = "Anonymous";

slider.addEventListener("input", function start() {  process(); });


