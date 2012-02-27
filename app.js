/**
 * settings
 */

var webPort = 8090;

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

app.get('/', routes.index);

app.listen(webPort);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

// socket.io
io.sockets.on('connection', function (socket) {
	console.log('Connection: ' + socket.id);

	var rc = redis.createClient();
	var ids = new Array();
	var limit = 3;

        socket.on('sub', function(id) {
		// TODO: allow multiple subscriptions when id=[123,456]
		if (ids.indexOf(id) < 0) {
		    if (ids.push(id) > limit)
			rc.unsubscribe(ids.pop());
		    rc.subscribe(id);

		}
		console.log('sub: ' + id + ' (' + ids.length + ' subscriptions: ' + ids +')');

	    });

	socket.on('unsub', function(id) {
		var i = ids.indexOf(id);
		if (i > -1) {
		    var rest = ids.slice(i + 1 || ids.length);
		    ids.length = i < 0 ? ids.length + i : i;
		    ids.push.apply(ids, rest);
		    rc.unsubscribe(id);

		}
		console.log('unsub: ' + id + ' (' + ids.length + ' subscriptions: ' + ids + ')');

	    });

        socket.on('subs', function(id) {
		socket.emit('info', ids);
		console.log('subs: ' + ids +'');

	    });

	socket.on('disconnect', function () {
		console.log('disconnect');
		rc.end();

	    });

	rc.on('message', function(id, data) {
		var o = new Object();
		o[id] = JSON.parse(data);
		console.log('rc.on(data): ' + JSON.stringify(o));
		socket.volatile.emit('data', o);
	    });

	rc.on( 'error', function(err) {
		console.log('Redis Error: ' + err );

	    });

    });
