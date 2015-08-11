// External Modules
var eventEmitter = require('events').EventEmitter;
var util         = require('util');

// App Modules
var config       = require("./config.js");

var Listener = function Listener(device, event, callback) {
    this.enabled = true;

    device.on(event, function() {
        if (this.enabled) {
            var response = callback.apply(null, arguments);
            if (response) {
                logEvent(response);
            }
        }
    }.bind(this));
};

var logEvent = function logEvent(response) {
    var log = {
        "time": (new Date()).toString(),
        "type": "event",
        "status": response.status
    };

    switch (response.status) {
        case "ERROR":
            log.error_code = response.code;
            log.details = "Event Failed: " + response.description;
            break;

        case "SUCCESS":
            log.details = "Event Occurred: " + response.description;
            break;
    }

    if (response.data) {
        log.data = response.data;
    }

    console.log(log);
};

Listener.prototype = {
    disable: function disable() {
        this.enabled = false;
    },

    disableFor: function disableFor(timeout) {
        this.disable();
        setTimeout(this.enable, timeout);
    },

    enable: function enable() {
        this.enabled = true;
    }
};

module.exports = {
    "listener": Listener,
    "log": logEvent,
    "success": function (description, data) {
        return {
            "status": "SUCCESS",
            "description": description,
            "data": data
        }
    },
    "error": function (description, data, code) {
        return {
            "status": "ERROR",
            "code": code,
            "description": description,
            "data": data
        }
    }
};
