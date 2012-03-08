// couchdb initialization: (should already be done by this app)
//   curl -X PUT http://127.0.0.1:5984/points

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

	    console.log('adding random points');
	    var tim = new Date().getTime();
	    var lat = 42.3599120000 + (Math.random() / 100);
	    var lng = -71.0875660000 + (Math.random() / 100);

	    db.save({id:'abc',time:tim,position:{latitude: lat, longitude: lng, altitude:10}}, function (err, res) {
	    	    if (err) {
	    		console.log('err:',err);
	    	    }
	    	    else {
	    		console.log('save res:',res);
			//db.all(function(err,res){
			db.view('sets/some', function (err, res) {
				console.log('res: ', res);
			    });
	    	    }
	    	});
	}
    });

var x=0;
setInterval(function(){
	x++;
	console.log('10 second heartbeat '+x);
    }, 10000);
