// App Modules
var hue          = require("../devices/hue");
var wemo         = require("../devices/wemo");
var twilio       = require("../devices/twilio-phone");
var user         = require("../devices/user");

// App Modules
var config       = require("../util/config.js");
var Listener     = require("../util/listener.js");

// constants
var LIGHT_STATE  = require("../constants/light_state");
var LOCATION     = require("../constants/location");

var startListeners = function startListeners() {
    var living_room_wemo = wemo.host.getDevice("living_room");
    var living_room_lights = hue.host.getLightGroup(0);
    var phone = twilio.host.getPhone(config.device_ids.twilio_phone);
    var ryan = user.host.getUser("ryan");
    var meredith = user.host.getUser("meredith");

    if (!living_room_wemo || !phone) {
        setTimeout(startListeners, 2000);
        return;
    }

    var listeners = {
        "wemo": {},
        "living_room_lights": {},
        "users": {}
    };

    listeners.wemo.handle_on = new Listener.listener(
        living_room_wemo,
        "on",
        function() {
            living_room_lights.setOn();
            return Listener.success("Living Room Wemo turned on all lights");
        }
    );

    listeners.wemo.handle_off = new Listener.listener(
        living_room_wemo,
        "off",
        function() {
            if (living_room_lights.state.on !== 0) {
                living_room_lights.setOff();
                return Listener.success("Living Room Wemo turned off all lights");
            }
        }
    );

    listeners.living_room_lights.handle_change = new Listener.listener(
        living_room_lights,
        "change",
        function(data) {
            if (!data) {
                return Listener.error("invalid data", data);
            } else if (data.previous_state == LIGHT_STATE.GROUP_OFF) {
                // Whenever the living room lights are changed from off, turn on the wemo
                living_room_wemo.reflectState(true);
                return Listener.success("Living Room Lights are now on, turn on wemo");
            } else if (living_room_lights.state.on == LIGHT_STATE.GROUP_OFF) {
                // Whenever the living room lights are changed to off, turn off the wemo
                living_room_wemo.reflectState(false);
                return Listener.success("Living Room Lights are now off, turn off wemo");
            }
        }
    );

    listeners.users.ryan_arrived_home = new Listener.listener(
        ryan,
        "arrived",
        function(data) {
            return user.host.handleLocationChange(ryan, data);
        }
    );

    listeners.users.ryan_left_home = new Listener.listener(
        ryan,
        "leaving",
        function(data) {
            return user.host.handleLocationChange(ryan, data);
        }
    );

    listeners.users.meredith_arrived_home = new Listener.listener(
        meredith,
        "arrived",
        function(data) {
            return user.host.handleLocationChange(meredith, data);
        }
    );

    listeners.users.meredith_left_home = new Listener.listener(
        meredith,
        "leaving",
        function(data) {
            return user.host.handleLocationChange(meredith, data);
        }
    );
};

module.exports =  {
    initialize: function initialize(app) {
        hue.host.on("ready", function() {
            startListeners();
            console.debug("Listeners Ready");
            console.log("---------------------------------------");
        });
    }
};