// External Modules
var eventEmitter = require('events').EventEmitter;
var util         = require('util');

// App Modules
var config       = require("./config.js");

var Listener = function Listener(device, event, callback, description) {
    this.enabled = true;

    device.on(event, function() {
        if (this.enabled) {
        callback.apply(null, arguments);
            if (description) {
                logEvent(description);
            }
        }
    }.bind(this));
};

var logEvent = function logEvent(description) {
    console.log({
        "time": (new Date()).toString(),
        "type": "event",
        "data": "Event Occurred: " + description
    });
};

Listener.prototype = {
    disable: function disable() {
        console.debug("disable");
        this.enabled = false;
    },

    disableFor: function disableFor(timeout) {
        this.disable();
        setTimeout(this.enable, timeout);
    },

    enable: function enable() {
        console.debug("enable");
        this.enabled = false;
    }
};

module.exports = Listener;
