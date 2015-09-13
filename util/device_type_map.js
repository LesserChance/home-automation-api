// App Modules
var hue          = require("../devices/hue");
var wemo         = require("../devices/wemo");
var twilio       = require("../devices/twilio-phone");
var user         = require("../devices/user");
var steam        = require("../devices/steam");

module.exports = {
    "hue_light" : function(device_id) {
        return hue.host.getLight(device_id);
    },
    "hue_light_group" : function(device_id) {
        return hue.host.getLightGroup(device_id);
    },
    "wemo_switch" : function(device_id) {
        return wemo.host.getDevice(device_id);
    },
    "user" : function(user_name) {
        return user.host.getUser(user_name);
    },
    "phone" : function(device_id) {
        return twilio.host.getPhone(device_id);
    },
    "steam" : function(device_id) {
        return steam.host;
    }
};
