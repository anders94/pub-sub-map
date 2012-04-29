if ( process.argv[2] != null ) {
    var redis = require("redis"),
        client = redis.createClient();

    var key = process.argv[2];
    var lat = 42.3599120000 + (Math.random() / 100);
    var lng = -71.0875660000 + (Math.random() / 100);
    var latO = (Math.random() - .5) / 1000;
    var lngO = (Math.random() -.5) / 1000;

    console.log('Sending random data for key ' + key);

    setInterval( function() {
            lat += (Math.random() / 1000) + latO;
            lng += (Math.random() / 1000) + lngO;
            var o = [{"key":key,"points":[[0,lat,lng,10]]}];
            console.log('feed.'+key+' '+JSON.stringify(o));
            client.publish('feed.'+key, JSON.stringify( o ) );
        }, 1000);
}
else {
    console.log('usage: ' + process.argv[0] + ' ' + process.argv[1] + ' id');
    process.exit(1);
}
