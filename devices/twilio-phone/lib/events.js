// App Modules
var Event = require("../../../util/event");

module.exports = {
    "sms_sent" : new Event({
        "key": "sms_sent",
        "description": "An SMS message has been sent"
    })
};
