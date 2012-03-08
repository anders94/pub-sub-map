var cradle = require('cradle');
var db = new(cradle.Connection)().database('points');

db.exists(function (err, exists) {
	if (err) {
	    console.log('error', err);
	}
	else {
	    if (!exists) {
		db.create();
		console.log('created database');
	    }

	    var t = new Date().getTime();
	    var lat = 42.3599120000 + (Math.random() / 100);
	    var lng = -71.0875660000 + (Math.random() / 100);

	    db.merge('abc', {time:t,data:{latitude: lat, longitude: lng, altitude:10}}, function (err, res) {
	    	    if (err) {
	    		console.log('err:',err);
	    	    }
	    	    else {
	    		console.log('save res:',res);
	    		setInterval(function(){db.get('abc', function (err, doc) {
	    				console.log('doc',doc);
	    			    });
	    		    }, 1000);
	    	    }
	    	});
	}
    });
