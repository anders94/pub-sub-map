//

if ( process.argv[2] != null ) {
    var mongo = require('mongodb'),
	Db         = mongo.Db,
	Connection = mongo.Connection,
	Server     = mongo.Server;

    var db = new Db('points', new Server('127.0.0.1', 27017, {}), {});
    db.open(function(err, db) {
	    db.collection('data', function(err, collection) {
		    collection.find({key: process.argv[2]}, {}, function(err, cursor) {
			    cursor.each(function(err, data) {
				    if (data==null) {
					db.close();
				    }
				    else {
					if (data.key && data.location){
					    console.log(data.key + ': ' + data.location.latitude + ' ' + data.location.longitude);
					}
				    }
				});
			});
		});
	});
}
else {
    console.log('usage: ' + process.argv[0] + ' ' + process.argv[1] + ' id');
    process.exit(1);

}
