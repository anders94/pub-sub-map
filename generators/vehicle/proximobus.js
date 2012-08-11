http = require('http');

if ( process.argv[2] != null ) {
    var redis = require("redis"),
        client = redis.createClient();
    var agency = process.argv[2];
    console.log('Sending http://proximobus.appspot.com/ data for ' + agency);

    setInterval( function() {
	    var body = '';
	    http.get({host: 'proximobus.appspot.com', port: 80, path: '/agencies/'+agency+'/vehicles.json' }, function(res) {
		    res.on('data', function (chunk) {
			    body = body + chunk;
			});
		    res.on('end', function () {
			    var o = JSON.parse(body);
			    for (var x in o.items) {
				var vehicle = o.items[x];

				// { seconds_since_report: 21,
				//   run_id: '28_1_var2',
				//   longitude: -71.0902299,
				//   heading: 54,
				//   route_id: '28',
				//   predictable: true,
				//   latitude: 42.3339701,
				//   id: '1212' }

				var key = agency+vehicle.route_id;
				var oo = [{"key":key,"points":[[0,vehicle.latitude,vehicle.longitude,10]]}];
				console.log('feed.'+key+' '+JSON.stringify(oo));
				client.publish('feed.'+key, JSON.stringify( oo ) );
			    }
			});
		}).on('error', function(e) {
			console.log('Whoops - error: '+e.message);
		    });
        }, 30000);
}
else {
    console.log('usage: ' + process.argv[0] + ' ' + process.argv[1] + ' agency');
    console.log('       where "agency" is one of');

    var body = '';
    http.get({host: 'proximobus.appspot.com', port: 80, path: '/agencies.json' }, function(res) {
	    res.on('data', function (chunk) {
		    body = body + chunk;
		});
	    res.on('end', function () {
		    var o = JSON.parse(body);
		    for (var x in o.items)
			console.log(o.items[x].id + ' - ( ' + o.items[x].display_name + ' )');
		});
	}).on('error', function(e) {
		console.log('       the agencies supported by http://proximobus.appspot.com/');
	    });
}
