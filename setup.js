// caution: this is very dangerous - does a dropDatabase()

var mongo = require('mongodb'),
    Db         = mongo.Db,
    Connection = mongo.Connection,
    Server     = mongo.Server;

var db = new Db('points', new Server('127.0.0.1', 27017, {}), {});
db.open(function(err, db) {
	db.dropDatabase(function(err, result) {
		console.log('adding info');
		db.collection('version', function(err, collection) {
			var info = {version:1};
			collection.insert(info);
			collection.find({}, {}, function(err, cursor) {
				cursor.each(function(err, data) {
					if (data==null) {
					    db.close();
					}
					else {
					    console.log('data: ', data);
					}
				    });
			    });
		    });
	    });
    });
