// Local Modules
var host = require("./lib/host");
var phone = require("./lib/phone");
var events = require("./lib/events");

host.init();

module.exports = exports = {
    host: host,
    phone: phone,
    events: events
};
