// Local Modules
var host = require("./lib/host");
var events = require("./lib/events");

host.init();

module.exports = exports = {
    host: host,
    events: events
};
