if ( process.argv[2] != null ) {
    var key = process.argv[2];
    var mongo = require('mongodb');
    var mongo = require('mongodb'),
        Db         = mongo.Db,
        Connection = mongo.Connection,
        Server     = mongo.Server;

    var db = new Db('points', new Server('127.0.0.1', 27017, {}), {});
    db.open(function(err, db) {
            db.collection('data', function(err, collection) {
		    collection.find({key:key}, {limit:10}).sort({_id:-1}, function(err, cursor){
			    cursor.each(function(err, data) {
                                    if (data==null) {
                                        db.close();
                                    }
                                    else {
					console.log(JSON.stringify(data));
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
