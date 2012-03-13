var mongo = require('mongodb'),
    Db         = mongo.Db,
    Connection = mongo.Connection,
    Server     = mongo.Server;
var redis = require('redis');
var db = new Db('points', new Server('127.0.0.1', 27017, {}), {});

db.open(function(err, db) {
        var rc = redis.createClient();
        console.log('adding points as they come in');

        rc.on('pmessage', function(pattern, channel, message) {
                //console.log(channel + ': ', message);
                db.collection('data', function(err, collection) {
                        if (err) {
                            console.log('err: ', err);
                        }
                        else {
                            var o = JSON.parse(message);
                            console.log(pattern+' '+JSON.stringify(o));
                            collection.insert(o);
                        }
                    });
            });

        rc.psubscribe('feed.*');

    });
