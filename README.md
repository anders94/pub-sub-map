pub-sub-map
===========

Publish and subscribe to markers on a Google Map with real-time updating. A large number of web viewers can watch the realtime locations of sets of markers.

This is the new engine behind http://eyezo.com/ currently in development.

Requires
----------------
* node
* redis

Video
---------------
I have an [demo of pub-sub-map](http://www.youtube.com/watch?v=Mn0wQZX0dt8) over on YouTube.

Setup
---------------
```sh
cd pub-sub-map/
npm install
```

Add your Google Maps API key on line 89 of views/layout.jade where it says "YOUR_API_KEY". [Generate your Google Maps Key]
(https://developers.google.com/maps/documentation/javascript/tutorial#api_key)

Quick Start
--------------------------------------------------------
Start the app:
```sh
node app
```

Navigate to:
```
http://localhost:8070/
```
(automatically subscribes to 'ISS', the International Space Station)

In another shell, start sending some points for the International Space Station: (requires java)
```sh
cd pub-sub-map/generators/iss/
java com/anders/ISSPosition
```

Click 'ISS' under 'Center On' in the web UI. You should see the approximate ground track of the ISS pushed to the browser in realtime.

Now, in another shell, start sending some random points for a new location. Let's call it 'joe':
```sh
cd pub-sub-map/generators/
node send joe
```

Subscribe to 'joe' in the web UI. You should see a marker drop in around some place in Cambridge, MA and randomly start moving in a northeast direction. Select 'joe' under 'Center On' if you don't see him. You might also want to zoom the map in a little bit because he doesn't move very quickly.

Notice how 'joe' leaves a different color trail than the ISS? Add a few more things to track and you should see other colors as well. (eventually they will recycle) Open up a few more web browsers and notice how many viewers can follow the same or different sets of tracks. Cool, eh?

The server keeps track of each browser's subscriptions and pushes the points to each browser. No polling here! Subscriptions are limited to 10, tunable within app.js. Currently pub-sub-map is tested and working on desktop, iOS and Android (WebKit) clients.

Future work involves making the payload more efficient (multiple subscriptions in one json package) and prepopulating the last 25 known good points on subscription initiation.

That's it for now, enjoy!

Follow me on Twitter: [@anders94](http://twitter.com/anders94)
