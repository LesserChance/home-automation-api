// External Modules
var express = require('express');

// App Modules
var config  = require("../../util/config");

module.exports = {
    init: function(app) {
        app.use("/", express.static(config.docroot));
    }
};
