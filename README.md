lazy.generators.js
==================

Experimental work with ES6 generators: [Lazy.js](https://github.com/dtao/lazy.js) API using generators.

To test in the browser:
-----------------------

    npm install
    browserify test.js --noparse=FILE --dg false --debug -o bundle.js

To test with node (>= v0.11.x-pre):
-----------------------------------

    node --harmony test.js