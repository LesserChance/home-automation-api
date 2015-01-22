// External Modules
var webhook = require('express-ifttt-webhook');

// App Modules
var config  = require("../../util/config.js");

module.exports = {
    init: function(app) {
        app.use(webhook(
            function(username, password, done) {
                var ifttt_user = (username === config.ifttt_username && password === config.ifttt_password);

                return done(null, ifttt_user);
            },
            function(json, done) {
                console.debug("webhook");
                console.debug(json);

                //todo: route to the ifttt api
//            // transform data
//            var out = getOutputObjectFromInput(json);
//
//            // specify URL to forward your transformed data to
//            out.url = 'http://api.example.org';
//
//            done(null, out);



            done();
        }));
    }
};
