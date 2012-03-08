// couchdb initialization
//   manually create database:
//     curl -X PUT http://127.0.0.1:5984/points

var cradle = require('cradle');
var db = new(cradle.Connection)().database('points');

console.log('checking if db exists');
db.exists(function (err, exists) {
	if (err) {
	    console.log('error', err);
	}
	else {
	    if (!exists) {
		console.log('creating db');
		db.create();
	    }

            console.log('creating views');
            db.save('_design/sets', {
                    all: {
                        map: function (doc) {
                            if (doc.id) emit(doc.id, doc);
                        }
                    },
		    some: {
                        map: function(doc) {
                            if (doc.id && doc.id == 'abc'){
                                emit(null, doc);
                            }
                        }
                    }
                });
	    console.log('done');
	}
    });
