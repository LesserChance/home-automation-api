// External Modules
var auth         = require('http-auth');
var cookieParser = require('cookie-parser');

// App Modules
var user         = require("../../devices/user");
var config       = require("../../util/config.js");

module.exports = function (req, res, next) {
    // Special Auth
    if (req.path.indexOf("/mediapc") > -1) {
        // mediapc passthru (for now)
        next();
    } else if (req.path.indexOf("/tasker") > -1) {
        //match the key
        //todo: move key to the user db, check that this is in users
        if (req.get('user-agent') === config.ryan_tasker_key) {
            next();
        }
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
        // Static assets
        // Check for cookie existence
        var session_cookie = req.cookies[config.cookie_name];
        if (session_cookie === config.cookie_secret) {
            next();
            return;
        }

        // Use http auth
        auth.connect(
            auth.basic({
                    realm: "Bateman House"
                }, function (username, password, callback) {
                    // Store the login cookie
                    res.cookie(config.cookie_name, config.cookie_secret, {});

                    var static_user = (username === config.username && password === config.password);
                    callback(static_user);
                }
            ))(req, res, next);
    }
};