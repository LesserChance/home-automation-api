// Local Modules
var host = require("./lib/host");
var user = require("./lib/user");
var events = require("./lib/events");

host.init();

module.exports = exports = {
    host: host,
    user: user,
    events: events
};