// App Modules
var Event = require("../../../util/event");

module.exports = {
    "friend_signed_on" : new Event({
        "key": "friend_signed_on",
        "description": "A friend signed on to Steam"
    }),
    "friend_signed_off" : new Event({
        "key": "friend_signed_off",
        "description": "A friend signed off of Steam"
    })
};
