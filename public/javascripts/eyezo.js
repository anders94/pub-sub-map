var header_height = 70;
var footer_height = 58;
var map_height_min = 350;

var map;
var markers = new Array();
var colors = [ '#CD0000', '#0000CD', '#32CD32', '#FF6103', '#FFA500', '#79CDCD', '#4F94CD', '#EE1289', '#B0171F', '#1E1E1E' ];
var bubble = null;
var bubbleLoc = null;
var centerOn = -1;

function resize() {
  var non_map_content_height = header_height + footer_height;
  var map_height = map_height_min;
  var difference = $(window).height( ) - non_map_content_height;
  if ( difference > map_height )
    map_height = difference;

  $("#map").css( 'height', map_height );
}

var socket = io.connect();
socket.on('info', function (data) {
  alert(data);
});

socket.on('subs', function (data) {
  $('#centerList li').remove();
  $('#centerList').append( $('<li>').append( $('<input>').attr('type','radio').attr('name','centerOn').attr('value','none').attr('checked',true)).append(' None'));
  $('input:radio[name=centerOn]').last().change(function(){
          centerOn = -1;
      });
  for (var x in data) {
    $('#centerList').append( $('<li>').append( $('<input>').attr('type','radio').attr('name','centerOn').attr('value',data[x]) ).append(' '+data[x]));
    $('input:radio[name=centerOn]').last().change(function(){
            centerOn = $('input:radio[name=centerOn]:checked').val();
        });
    if (centerOn == data[x])
      $('input:radio[name=centerOn]').last().attr('checked',true);
  }
});

socket.on('data', function (data) {
  for (var x in data) {
    var d = data[x];
    if (d.key && d.points) {
      var key = d.key;
      for (var y in d.points) {
        var p = d.points[y];
        var timeAgo = p[0];
        var lat = p[1];
        var lng = p[2];
        if (rational(lat) && rational(lng)) {
          var marker = null;
          var polyline = null;
          var info = null;
          var pos = new google.maps.LatLng(lat, lng);

          for (i=0; i<markers.length && marker == null; i++)
            if (markers[i].key == key) {
              marker = markers[i].marker;
              polyline = markers[i].polyline;
              info = markers[i].info;
            }

          if ( marker == null ) {
            marker = new google.maps.Marker({
              map: map,
              position: pos,
              clickable: true,
              animation: google.maps.Animation.DROP
            });

            var polyOpts = {strokeColor:colors[markers.length % colors.length], strokeOpacity:1.0, strokeWeight:2, map:map};
            polyline = new google.maps.Polyline(polyOpts);
            info = new google.maps.InfoWindow();

            var m = new Object( );
            m.key = key;
            m.marker = marker;
            m.polyline = polyline;
            m.info = info;
            markers.push(m);
            //map.panTo(pos);

          }

          google.maps.event.addListener(marker, 'click', function() {
              info.open(map, marker);
            });

          marker.setPosition(pos);
          polyline.getPath().push(pos);
          info.setContent('<h1>'+key+'</h1>'+lat+', '+lng);
          info.setPosition(pos);

          for (i=0; i<markers.length; i++)
            if (markers[i].key == centerOn)
              map.panTo(markers[i].marker.getPosition());
        } // if (rational(lat) && rational(lng))
      } // for (var y in d.points)
    } // if (d.key && d.points)
  } // for (var x in data)
}); // socket.on

function positionUpdate(l){
  bubbleLoc = new google.maps.LatLng(l.coords.latitude, l.coords.longitude);
  if (bubble == null) {
    bubble = new google.maps.Marker({
      map: map,
      position: bubbleLoc,
      icon:new google.maps.MarkerImage('/images/bubble.png', null, null, 
                                       new google.maps.Point(9,9), 
                                       new google.maps.Size(18,18)),
      clickable: false
    });
  }
  else {
    bubble.setPosition(bubbleLoc);
  }
}

function positionUpdateFail(e){
  console.log(e.message);
}

function rational(d){
  if(d!=null && d>-180 && d<180)
    return true;
  else
    return false;
}
