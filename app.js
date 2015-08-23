var express = require('express');
var app = express();
var compress = require('compress');

var mapnik = require('mapnik');
mapnik.register_datasources("./node_modules/mapnik/lib/binding/node-v11-linux-x64/mapnik/input");

var mercator = require('sphericalmercator');

var merc = new mercator({});

console.log(mercator);

var stylesheet = './data/Simple.xml';

app.get('/', function(req,res) {
    res.sendfile('./public/index.html');
});

app.get('/:z/:x/:y', function(req, res) {

    res.setHeader("Cache-Control", "max-age=31556926");

    var z = req.params.z,
        x = req.params.x,
        y = req.params.y;

    var map = new mapnik.Map(256, 256);

    map.load(stylesheet,
        function(err,map) {
            if (err) {
                res.end(err.message);
            }

            var bbox = merc.bbox(x, y, z, false, '900913');
            map.extent = bbox;

            var im = new mapnik.Image(256, 256);
            map.render(im, function(err,im) {
                if (err) {
                    res.end(err.message);
                } else {
                    im.encode('png', function(err,buffer) {
                        if (err) {
                            res.end(err.message);
                        } else {
                            res.writeHead(200, {'Content-Type': 'image/png'});
                            res.end(buffer);
                        }
                    });
                }
            });
        }
    );
    res.type("png");
});

app.listen(process.env.PORT || 8001);

console.log('server running');