// map console.debug because I'm used to using that
console.debug = console.log;

// External Modules
var express    = require('express');
var app        = express();
var http       = require('http');

// App Modules
var config     = require("./util/config");

// Init Middleware (static and API)
require('./middleware').initialize(app);

// Start the DB
var mongoose   = require('mongoose');
mongoose.connect('mongodb://localhost/lightserver');

// START THE SERVER
var httpServer = http.createServer(app);
httpServer.listen(config.port);

console.log("=======================================");
console.log((new Date()).toString());
console.log('Server Initialized, port ' + config.port);

// Init Listeners
require('./startup').initialize(app);
