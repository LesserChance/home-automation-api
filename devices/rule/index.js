// Local Modules
var host = require("./lib/host");
var rule = require("./lib/rule");
var events = require("./lib/events");

module.exports = exports = {
    host: host(),
    device: rule,
    events: events
};
