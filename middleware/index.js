// External Modules
var express      = require('express');
var auth         = require('http-auth');
var cookieParser = require('cookie-parser');

// App Modules
var config  = require("../util/config");

module.exports = {
    initialize: function initialize(app) {
        // Allow cookie read/writes
        app.use(cookieParser());

        // Authenticate all requests
        app.use("/", require("./lib/auth"));

        // Serve Static Assets
        require("./lib/static").init(app);

        // Serve API
        require("./lib/api").init(app);
    }
};
