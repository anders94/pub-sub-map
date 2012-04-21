var redis = require('redis'),
    rc = redis.createClient();

/*
 * GET home page.
 */

exports.index = function(req, res){
    res.render('index')
};

exports.group = function(req, res){
    res.render('group');
};

/*
 * POST points.json
 */


exports.points = function(req, res){
    var json = req.body;
    if(json.key != null && json.key != ''){
	var key = json.key;
	if(json.points != null && json.points != ''){
	    var points = json.points;
	    for(var x=0; x<points.length; x++){
		var point = points[x];
		if(rational(point.latitude) && rational(point.longitude)){
		    rc.publish('feed.'+key, '[{"key":"'+key+'","points":['+JSON.stringify( point )+']}]' );
		}
	    }
	}
    }
	    
    res.send('{"success":true}');
}

function rational(x){
    if(x != null && x != '' && x > -180 && x < 180)
	return true
    else
        return false
}
