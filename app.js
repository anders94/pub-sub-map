/**
 * settings
 */

var webPort = 8070;

/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes');
var io = require('socket.io');
var redis = require('redis');

var app = module.exports = express.createServer(),
    io = io.listen(app);

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.get('/', function(req, res) {
	res.render('index');
    });
app.get(/^\/(\w{2,8})$/, function(req, res) { // match two to eight character URLs as group keys
	var key = req.params[0];
	res.render('group', {key: key});
    });
app.post('/points.json', routes.points);

app.listen(webPort);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

// socket.io
io.sockets.on('connection', function (socket) {
	console.log('Connection: ' + socket.id);

	var rc = redis.createClient();
	var keys = new Array();
	var limit = 10;

	socket.on('sub', function(key) {
		// enforce alphanumeric keys
		if (typeof key === 'string') {
		    var rx = new RegExp(/\W/);
		    var a = key.match(rx);
		    if (a == null && key != '') {
			if (keys.indexOf(key) < 0) {
			    if (keys.push(key) > limit)
				rc.unsubscribe('feed.'+keys.pop());
			    rc.subscribe('feed.'+key);
			}
			console.log('sub: '+key+' ('+keys.length+' subscriptions: '+keys+')');
		    }
		    else
			console.log('ERROR: illegal subscription '+key);
		}
		else
		    console.log('ERROR: illegal subscription '+key);

	    });

	socket.on('unsub', function(key) {
		var i = keys.indexOf(key);
		if (i > -1) {
		    var rest = keys.slice(i + 1 || keys.length);
		    keys.length = i < 0 ? keys.length + i : i;
		    keys.push.apply(keys, rest);
		    rc.unsubscribe('feed.'+key);

		}
		console.log('unsub: ' + key + ' (' + keys.length + ' subscriptions: ' + keys + ')');

	    });

	socket.on('subs', function(key) {
		socket.emit('subs', keys);
		console.log('subs: ' + keys +'');

	    });

	socket.on('disconnect', function () {
		console.log('disconnect');
		rc.end();

	    });

	rc.on('message', function(key, data) {
		var o = JSON.parse(data);
		console.log('rc.on(data): ' + JSON.stringify(o));
		socket.volatile.emit('data', o);
	    });

	rc.on( 'error', function(err) {
		console.log('Redis Error: ' + err );

	    });
    });
