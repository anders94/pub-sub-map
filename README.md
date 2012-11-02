pub-sub-map
===========

Publish and subscribe to markers on a Google Map with real-time updating.

Requires
--------
* node
* redis

Setup
-------
cd pub-sub-map/
npm install

Quick Start
--------------------------------------------------------

Start the app:
```sh
node app.js
```

Navigate to:
```
  http://localhost:8090/
  (automatically subscribes to 'abc' and 'xyz')
```

start sending some fake points for 'abc' and 'xyz':
```
  node send.js abc
  node send.js xyz
```
