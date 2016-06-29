var mosaic = require('./public/js/mosaic.js');
var url = require('url');
var path = require('path');
var util = require('util');
var fs = require('fs-extra');
var express = require('express');
var app = express();
app.use(express.static('public'));
//var http = require('http');
var Canvas = require('canvas');
var multer   =  require( 'multer' );
var dir = path.dirname(fs.realpathSync(__filename));
var svgTemplate = [
		   '  <svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="%d" height="%d">',
		   '  <ellipse cx="50%" cy="50%" rx="50%" ry="50%" fill="#%s"></ellipse>',
		   '  </svg>'
		   ].join('');

var storage = multer.diskStorage({
	destination: function (request, file, callback) {
	    callback(null, './uploads/');
	},
	filename: function (request, file, callback) {
	    console.log(file);
	    callback(null, file.originalname);
	}
    });

var upload = multer({storage: storage}).single('file');
var server = app.listen(8765, function () {
        console.log('Listening on port ' + server.address().port);
    });

app.get('/', function(req, res) {
	var pathname = url.parse(req.url).pathname;
	res.writeHead(200, {'Content-Type': 'image' });
	fs.createReadStream(dir + '/mosaic.html').pipe(res);
    });

app.post('/upload', function(req, res) {
	upload(req, res, function(err) {
		if(err) {
		    console.log('Error Occured ' + err);
		    return;
		}
		return res.status( 200 ).send( req.file.path );
	    });
	    });

app.get('/uploads/*', function(req, res)  {
	var image = url.parse(req.url).pathname.split("/uploads")[1];
	console.log(image);
	if (image == '/') {
	    res.writeHead(404, {'Content-Type': 'text/html'});
	    fs.createReadStream(dir + '/public/404.html').pipe(res);
	    return;
	}
	else {
	    try {
		image = decodeURIComponent((url.parse(req.url).pathname).split("/uploads")[1]);
	    }
	    catch (err) {
		res.writeHead(404, {'Content-Type': 'text/html'});
		fs.createReadStream(dir + '/public/404.html').pipe(res);
		return;
	    }
	    fs.stat('uploads' + image, function(err, stat) {
		    if (err == null) {
			console.log(image + ' exists on server');
			var img = fs.readFileSync('uploads' + image);
			res.writeHead(200, {'Content-Type': 'image' });
			res.end(img, 'binary');
			return;
		    } else if (err.code == 'ENOENT') {
			console.log(image + ' does not exist on server');
			res.writeHead(404, {'Content-Type': 'text/html'});
			fs.createReadStream(dir + '/public/404.html').pipe(res);
			return;
		    } else {
			console.log('500 err: ' +  err.code);
			res.writeHead(500, {'Content-Type': 'text/html'});
			fs.createReadStream(dir + '/public/500.html').pipe(res);
			return;
		    }
		});
	}
	return;
    });

app.get('/index.html', function (req, res) {
	var image = decodeURIComponent(url.parse(req.url).query);
	console.log(image);
	if (!image) {
	    res.writeHead(404, {'Content-Type': 'text/html'});
            fs.createReadStream(dir + '/public/404.html').pipe(res);
            return;
	}
	else {
	    try {
		image = decodeURIComponent(url.parse(req.url).query);
		console.log(image);
	    }
	    catch (err) {
		res.writeHead(404, {'Content-Type': 'text/html'});
		fs.createReadStream(dir + '/public/404.html').pipe(res);
		return;
	    }
	    fs.stat('uploads/' + image, function(err, stat) {
		    if(err == null) {
			res.writeHead(200, {'Content-Type': 'text/html' });
			fs.createReadStream(dir + '/index.html').pipe(res);
			return;
		    } else if(err.code == 'ENOENT') {
						res.writeHead(404, {'Content-Type': 'text/html'});
			fs.createReadStream(dir + '/public/404.html').pipe(res);
			return;
		    } else {
			console.log('err');
			console.log('Some other error: ' + err.code);
			return;
		    }
		});  
	}
	return;
    });

app.get('/svg', function(req, res){
	try {
	    var image = decodeURIComponent(url.parse(req.url).query);
	}
	catch (err) {
	    res.writeHead(404, {'Content-Type': 'text/html'});
	    fs.createReadStream(dir + '/public/404.html').pipe(res);
	    return;
	}
	console.log(image);
	fs.stat('uploads/' + image, function(err, stat) {
		if(err == null) {
		    
		} else if(err.code == 'ENOENT') {
		    res.writeHead(404, {'Content-Type': 'text/html'});
                    fs.createReadStream(dir + '/public/404.html').pipe(res);
		    return;
		} else {
                    console.log('Some other error: ' + err.code);
		    //return;
                }
            });
	console.log(image);
	var pathname = url.parse(req.url).pathname;
        console.log(pathname);
	var Image = Canvas.Image;
	var canvas = new Canvas(100, 100);
	var ctx = canvas.getContext('2d');
	var img = new Image();
	
	img.onerror = function (err) {
	    throw err;
	}
	
	img.onload = function () {
	    var rows = mosaic.TILE_HEIGHT;
	    var cols = mosaic.TILE_WIDTH;
	    
	    var pieceWidth = img.width / cols;
	    var pieceHeight = img.height / rows;
	    canvas.width = img.width;
	    canvas.height = img.height;
	    var hexcolors = [];
	    var i = 0;
	    var imgdata = [];
	    ctx.drawImage(img, 0, 0);
	    for (var y = 0; y < rows; y++) {
		for (var x = 0; x < cols; x++) {
		    imgdata.push(ctx.getImageData(x * pieceWidth, y * pieceHeight, pieceWidth, pieceHeight));
		    var pixelInterval = 5, // Rather than inspect every single pixel in the image inspect every 5th pixel
			count = 0,
			k = -4,
			data, datalength;

		    var rgbval = {r:0, g:0, b:0};
		    data = imgdata[i].data;
		    datalength = data.length;
		    
	    while ((k += pixelInterval * 4) < datalength) {
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
		    //hexcolors.push('\#'.concat(bin.toString(16).toUpperCase()));
		    hexcolors.push(bin.toString(16).toUpperCase());
		    i++;
		}
	    }
	    //console.log(hexcolors);
	    
	    res.writeHead(200, {'Content-Type': 'text/xml'});
	    var body = '';
	    body = body.concat('<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en">\n');
	    res.write(body);
	    body = '';
	    var j = 0;
	    for (i = 0; i < (mosaic.TILE_WIDTH * mosaic.TILE_HEIGHT); i++) {
		if (j ==  mosaic.TILE_WIDTH) {
		    body = body.concat('<br />\n');
		    res.write(body);
		    body = '';
		    body = body.concat(util.format(svgTemplate, mosaic.TILE_WIDTH, mosaic.TILE_HEIGHT, hexcolors[i]));
		    //body = body.concat(util.format(svgTemplate, 12, 12, hexcolors[i]));
		    body = body.concat('\n');
		    j = 1;
		}
		else {
		    body = body.concat(util.format(svgTemplate, mosaic.TILE_WIDTH, mosaic.TILE_HEIGHT, hexcolors[i]));
		    //body = body.concat(util.format(svgTemplate, 12, 12, hexcolors[i]));
		    body = body.concat('\n');
		    j++;
		}
	    }
	    body = body.concat(' <br />\n</html>');
	    res.write(body);
	    res.end();
	    return;
	};
	try { 
	    img.src = 'uploads/' + image;
	}
	catch (err) {
	    console.log('file error');
	    res.writeHead(500, {'Content-Type': 'text/html'});
	    fs.createReadStream(dir + '/public/500.html').pipe(res);
	    return;
	}
    });

app.get('*/', function(req, res){
	res.writeHead(404, {'Content-Type': 'text/html'});
	fs.createReadStream(dir + '/public/404.html').pipe(res);
	return;
    });