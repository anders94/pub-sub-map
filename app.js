/**
 * settings
 */

var webPort = 8090;
var history = true;

/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes');
var io = require('socket.io');
var redis = require('redis');
var mongo = require('mongodb'),
    Db         = mongo.Db,
    Connection = mongo.Connection,
    Server     = mongo.Server;

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

// mongodb / socket.io
var db = new Db('points', new Server('127.0.0.1', 27017, {}), {});
db.open(function(err, db) {
	if (err) {
	    console.log('ERROR: ',err);
	}
	else {
	    db.collection('data', function(err, collection) {
		    if (err) {
			console.log('ERROR: ', err);
		    }
		    else {
			io.sockets.on('connection', function (socket) {
				console.log('Connection: ' + socket.id);

				var rc = redis.createClient();
				var keys = new Array();
				var limit = 10;

				socket.on('sub', function(key) {
					// enforce alphanumeric keys
					var rx = new RegExp(/\W/);
					var a = key.match(rx);
					if (a == null && key != '') {
					    if (keys.indexOf(key) < 0) {
						if (keys.push(key) > limit)
						    rc.unsubscribe('feed.'+keys.pop());
						if (history) {
						    var h = new Array();
						    collection.find({key:key}).sort({_id:-1}).limit(10, function(err, cursor){
							    cursor.each(function(err, data) {
								    if (err)
									console.log('error: ', err);
								    else if (data) {
									// top level of 'data' here is a {} not a []
									var a = new Array();
									a.push(data);
									h.push(a);
								    }
								    else {
									for (var x=0; x<h.length; x++){
									    var d = h.pop();
									    console.log(JSON.stringify(d));
									    socket.volatile.emit('data', d);
									}
								    }
								});
							});
						}
						rc.subscribe('feed.'+key);
					    }
					    console.log('sub: '+key+' ('+keys.length+' subscriptions: '+keys+')');
					}
					else {
					    console.log('ERROR: illegal subscription '+key);
					}

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
					socket.emit('info', keys);
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
		    }
		});
	}
    });
