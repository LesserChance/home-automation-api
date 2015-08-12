// App Modules
var Event = require("../../../util/event");

module.exports = {
    "leaving" : new Event({
        "key": "leaving",
        "description": "The User is leaving home"
    }),
    "arrived" : new Event({
        "key": "arrived",
        "description": "The User has arrived home"
    }),
    "phone" : {
        "screen_off": new Event({
            "key": "phone_screen_off",
            "description": "The users phone screen has been turned off"
        }),
        "screen_on": new Event({
            "key": "phone_screen_on",
            "description": "The users phone screen has been turned on"
        })
    }
};
