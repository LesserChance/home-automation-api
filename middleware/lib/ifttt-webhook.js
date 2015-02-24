// External Modules
var webhook = require('express-ifttt-webhook');

// App Modules
var config  = require("../../util/config.js");

// Local Modules
var ifttt   = require("./api/ifttt.js");

module.exports = {
    init: function(app) {
        app.use(webhook(
            function(username, password, done) {
                var ifttt_user = (username === config.ifttt_username && password === config.ifttt_password);

                return done(null, ifttt_user);
            },
            function(body, done) {
                ifttt.handleEvent(body.description.data);
                done();
            })
        );
    }
};
