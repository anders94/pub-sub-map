var cradle = require('cradle');
var db = new(cradle.Connection)().database('points');

var tim = new Date().getTime();
var lat = 42.3599120000 + (Math.random() / 100);
var lng = -71.0875660000 + (Math.random() / 100);

console.log('adding random points');
db.save({key:'abc',time:tim,position:{latitude: lat, longitude: lng, altitude:10}}, function (err, res) {
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
