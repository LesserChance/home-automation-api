// App Modules
var config       = require("./config");

var Listener = function Listener(device, event, callback) {
    this.enabled = true;

    try {
        device.on(event, function() {
            if (this.enabled) {
                var response = callback.apply(null, arguments);
                if (response) {
                    logEvent(response);
                }
            }
        }.bind(this));
    } catch (e) {
        console.debug("Error on event binding");
        console.debug("event:" + event);
        console.debug(e);
        console.trace();
    }
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

        case "IGNORED":
            return;
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
    },
    "ignored": function () {
        return {
            "status": "IGNORED"
        }
    }
};
