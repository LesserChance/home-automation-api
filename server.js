// map console.debug because I'm used to using that
console.debug = console.log;

// External Modules
var express    = require('express');
var app        = express();
var http       = require('http');

// App Modules
var config     = require("./util/config");

// Init Listeners
require('./listeners').initialize(app);

// Init Middleware (static and API)
require('./middleware').initialize(app);

// START THE SERVER
var httpServer = http.createServer(app);
httpServer.listen(config.port);

console.log('Server Initialized, port ' + config.port);