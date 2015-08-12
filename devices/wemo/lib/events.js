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
    })
};
