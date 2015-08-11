// App Modules
var hue          = require("../devices/hue");
var wemo         = require("../devices/wemo");
var twilio       = require("../devices/twilio-phone");
var user         = require("../devices/user");
var steam        = require("../devices/steam");
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
    var steam_listener = steam.host;

    if (!living_room_wemo || !phone) {
        setTimeout(startListeners, 2000);
        return;
    }

    var listeners = {
        "wemo": {},
        "living_room_lights": {},
        "users": {},
        "steam": {}
    };

    listeners.wemo.handle_on = new Listener.listener(
        living_room_wemo,
        "on",
        function() {
            // dont trigger the wemo response when we turn it on
            listeners.living_room_lights.handle_change.disableFor(5000);

            living_room_lights.setOn();
            return Listener.success("Living Room Wemo turned on all lights");
        }
    );

    listeners.wemo.handle_off = new Listener.listener(
        living_room_wemo,
        "off",
        function() {
            if (living_room_lights.state.on !== 0) {
                // dont trigger the wemo response when we turn it off
                listeners.living_room_lights.handle_change.disableFor(5000);

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

    listeners.steam.friend_signed_on = new Listener.listener(
        steam_listener,
        "friend_signed_on",
        function(data) {
            if (config.steam_users_to_notify.indexOf(data.friend.personaname) > -1) {
                if (ryan.get("location") === LOCATION.HOME && living_room_wemo.state.on) {
                    //flash the lights blue
                    living_room_lights.color("#0000FF", 5000);

                    //text ryan
                    phone.sendSMS(ryan.get("phone_number"), data.friend.personaname + " signed on");
                }

                return Listener.success("Friend signed onto steam, signaled lights and text", {"friend":data.friend.personaname});
            }
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