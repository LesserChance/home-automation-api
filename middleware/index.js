// External Modules
var express = require('express');
var auth    = require('http-auth');

// App Modules
var config  = require("../util/config.js");

module.exports = {
    initialize: function initialize(app) {
        // Authenticate all requests
        app.use("/", require("./lib/auth.js"));

        // Serve Static Assets
        require("./lib/static").init(app);

        // Serve API
        require("./lib/api").init(app);

        // Handle IFTTT calls
        require("./lib/ifttt-webhook").init(app);
    }
};
