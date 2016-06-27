// Simulates a mosaic server.
//
// /             serves mosaic.html
// /js/*         servers static files
// /color/<hex>  generates a tile for the color <hex>
//
var mosaic = require('./public/js/mosaic.js');
//var fs = require('fs');
//var http = require('http');
var url = require('url');
var path = require('path');
var util = require('util');
var fs = require('fs-extra');
var express = require('express');
var app = express();
app.use(express.static('public'));
var http = require('http');

var Canvas = require('canvas');
var multer   =  require( 'multer' );
var upload   =  multer( { dest: 'uploads/' } );

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
	    callback(null, file.originalname)
	}
    });

var upload = multer({storage: storage}).single('file');

app.get('/', function(req, res) {
	var pathname = url.parse(req.url).pathname;
	res.sendFile(__dirname + '/mosaic.html');
    });

var server = app.listen(8765, function () {
	console.log('Listening on port ' + server.address().port)
    });

app.post('/upload', function(req, res) {
	upload(req, res, function(err) {
		if(err) {
		    console.log('Error Occured' + err);
		    return;
		}
		console.log(req.file.path);
		//res.end('Your Files Uploaded');
		//console.log('Photo Uploaded');
		console.log(req.method);
		//console.log(req.body);
		return res.status( 200 ).send( req.file.path );
	    })
	    });

app.get('/uploads/*', function(req, res)  {
	image = decodeURIComponent((url.parse(req.url).pathname).split("/uploads")[1]);
	//image.split("/uploads")[1];
	fs.stat('uploads' + image, function(err, stat) {
		if(err == null) {
		    console.log('File exists');
		    var img = fs.readFileSync('uploads' + image);
		    res.writeHead(200, {'Content-Type': 'image' });
		    res.end(img, 'binary');
		} else if(err.code == 'ENOENT') {
		    console.log('file does not exist');
		    //		    res.status(404).send('404');
		    res.writeHead(404, {'Content-Type': 'text/html'});
		    fs.createReadStream(dir + '/public/404.html').pipe(res);
		    return;
		    // file does not exist
		    //fs.writeFile('log.txt', 'Some log\n');
		} else {
		    console.log('Some other error: ', err.code);
		}
	    });
	return;
	});

app.get('/index.html', function (req, res) {
	image = decodeURIComponent(url.parse(req.url).query);
        //image.split("/uploads")[1];
        //var query = url.parse(req.url,true).query;
	//console.log(url.parse(req.url).query);
	//console.log(decodeURIComponent(url.parse(req.url).query));
	
        fs.stat('uploads/' + image, function(err, stat) {
                if(err == null) {
                    console.log('File exists');
		    //     var img = fs.readFileSync('uploads' + image);
                    //res.writeHead(200, {'Content-Type': 'image' });
                    //res.end(img, 'binary');
                } else if(err.code == 'ENOENT') {
		    console.log('file does not exist');
		    res.writeHead(404, {'Content-Type': 'text/html'});
                    fs.createReadStream(dir + '/public/404.html').pipe(res);
		    return;
		    //fs.createReadStream(dir + '/404.html').pipe(res);
                    //fs.writeFile('log.txt', 'Some log\n');
                } else {
                    console.log('Some other error: ', err.code);
                }
            });
	res.sendFile(__dirname + '/index.html');
    });

app.get('/svg*', function(req, res){
	image = decodeURIComponent(url.parse(req.url).query);
	fs.stat('uploads/' + image, function(err, stat) {
                if(err == null) {
                    console.log('File exists');
		    var img = fs.readFileSync('uploads' + image);
                    res.writeHead(200, {'Content-Type': 'image' });
		    res.end(img, 'binary');
                } else if(err.code == 'ENOENT') {
                    console.log('file does not exist');
		    res.writeHead(404, {'Content-Type': 'text/html'});
                    fs.createReadStream(dir + '/public/404.html').pipe(res);
		    return;
                    //fs.writeFile('log.txt', 'Some log\n');
                } else {
                    console.log('Some other error: ', err.code);
                }
            });
	console.log(image);
	var pathname = url.parse(req.url).pathname;
        console.log(pathname);
        var m;
	var Image = Canvas.Image;
	var canvas = new Canvas(100, 100);
	var ctx = canvas.getContext('2d');
	var img = new Image();
	
	//img.onerror = function (err) {
	//throw err
	//}
	
	img.onload = function () {
	    // Math.abs(32-(mosaic.TILE_HEIGHT));
	    
	    //var rows = Math.floor(window.innerWidth);
	    //var cols = Math.floor(window.innerHeight);
	    
	    var rows = mosaic.TILE_HEIGHT;
	    var cols = mosaic.TILE_WIDTH;
	    
	    var pieces = [];
	    var pieceWidth = img.width / cols;
	    var pieceHeight = img.height / rows;
	    canvas.width = img.width;
	    canvas.height = img.height;;
	    var tiles = rows * cols;
	    var hexcolors = [];//new Array(tiles);
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
	    for (var i = 0; i < (mosaic.TILE_WIDTH * mosaic.TILE_HEIGHT); i++) {
		if (j ==  mosaic.TILE_WIDTH) {
		    body = body.concat('\n <br />\n');
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
	img.src = 'uploads/' + image;
    });

//res.status(404).write(dir + '/404.html').pipe(res);


app.get('*/', function(req, res){
	res.writeHead(404, {'Content-Type': 'text/html'});
	fs.createReadStream(dir + '/public/404.html').pipe(res);
	return;
	//res.status(404).send('404');
    });
