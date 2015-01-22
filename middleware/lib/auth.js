// External Modules
var express = require('express');
var auth    = require('http-auth');

// App Modules
var config  = require("../../util/config.js");

module.exports = function (req, res, next) {
    // Special Auth
    if (req.path.indexOf("/xmlrpc.php") > -1) {
        // IFTTT passthru
        next();
    } else if (req.path.indexOf("/twilio/") > -1) {
        // Twilio Endpoint
        auth.connect(
            auth.basic({
                    realm: "Bateman House"
                }, function (username, password, callback) {
                    var static_user = (username === config.username && password === config.password);
                    var twilio_user = (username === config.twilio_username && password === config.twilio_password);
                    callback(static_user || twilio_user);
                }
            ))(req, res, next);
    } else {
        // Normal Auth
        auth.connect(
            auth.basic({
                    realm: "Bateman House"
                }, function (username, password, callback) {
                    var static_user = (username === config.username && password === config.password);
                    callback(static_user);
                }
            ))(req, res, next);
    }
};