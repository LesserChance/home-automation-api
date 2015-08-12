// App Modules
var Event = require("../../../util/event");

module.exports = {
    "on" : new Event({
        "key": "on",
        "description": "When the device has been turned on"
    }),
    "off" : new Event({
        "key": "off",
        "description": "When the device has been turned off"
    }),
    "state_change" : new Event({
        "key": "state_change",
        "description": "When the device has changed its state between on and off"
    }),
    "load" : new Event({
        "key": "load",
        "description": "When the device is ready to handle events"
    }),
    "device_found" : new Event({
        "key": "device_found",
        "description": "A Wemo device has been found"
    }),
    "device_lost" : new Event({
        "key": "device_lost",
        "description": "A Wemo device has been lost"
    })
};
