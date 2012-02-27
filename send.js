if ( process.argv[2] != null ) {
    var redis = require("redis"),
	client = redis.createClient();

    var id = process.argv[2];
    var lat = 42.3599120000 + (Math.random() / 100);
    var lng = -71.0875660000 + (Math.random() / 100);
    var data;

    console.log('Sending random data for id ' + id);

    setInterval( function() {
	    lat += (Math.random() / 1000);
	    lng += (Math.random() / 1000);

	    data = { latitude: lat, longitude: lng, altitude: 10 };
	    client.publish(id, JSON.stringify( data ) );
	    console.log( JSON.stringify( data ) );
	}, 1000);

}
else {
    console.log('usage: ' + process.argv[0] + ' ' + process.argv[1] + ' id');
    process.exit(1);

}
