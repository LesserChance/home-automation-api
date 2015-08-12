// Local Modules
var host = require("./lib/host");
var device = require("./lib/device");
var events = require("./lib/events");

module.exports = exports = {
    host: host(),
    device: device,
    events: events
};
