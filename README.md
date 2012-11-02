pub-sub-map
===========

Publish and subscribe to markers on a Google Map with real-time updating. This is the new engine behind http://eyezo.com/ currently in development.

Requires
----------------
* node
* redis

Setup
---------------
```sh
cd pub-sub-map/
npm install
```

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
(automatically subscribes to 'ISS' - International Space Station)

In another shell, start sending some points for the International Space Station: (requires java)
```sh
cd pub-sub-map/generators/iss/
java com/anders/ISSPosition
```

Click 'ISS' under 'Center On' in the web UI. You should see the approximate ground track of the ISS pushed to the browser in realtime.

Now, in another shell, start sending some random points for a new location. Let's call it 'joe':
```sh
cd pub-sub-map/generators/
node send.js joe
```

Subscribe to 'joe' in the web UI. You should see a marker drop in around some place in Cambridge, MA and randomly start moving in a northeast directiion. Select 'joe' under 'Center On' if you don't see him. You might also want to zoom the map in a little bit because he moves quite a bit more slowly.

Notice how 'joe' leaves a different color trail than 'ISS'. Add a few more and you should see other colors as well. Eventually they will recycle.

That's it for now - enjoy!
