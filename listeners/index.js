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






var rgb          = require('node-hue-api/hue-api/rgb');

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

    // Whenever the living room wemo is turned on, turn on all lights
    listeners.wemo.handle_on = new Listener(
        living_room_wemo,
        "on",
        function() {
            living_room_lights.setOn();
        },
        "Living Room Wemo turned on all lights"
    );

    // Whenever the living room wemo is turned off, turn off all lights
    listeners.wemo.handle_off = new Listener(
        living_room_wemo,
        "off",
        function() {
            if (living_room_lights.state.on !== 0) {
                living_room_lights.setOff();
            }
        },
        "Living Room Wemo turned off all lights"
    );

    // Whenever the living room lights goes to off or on, the wemo should be set to the proper state
    listeners.living_room_lights.handle_change = new Listener(
        living_room_lights,
        "change",
        function(event, data) {
            // not sure why the arguments are the way they are...
            if (data[0].previous_state == LIGHT_STATE.GROUP_OFF) {
                // Whenever the living room lights are changed from off, turn on the wemo
                living_room_wemo.reflectState(true);
                logEvent("Living Room Lights are now on, turn on wemo");
            } else if (living_room_lights.state.on == LIGHT_STATE.GROUP_OFF) {
                // Whenever the living room lights are changed to off, turn off the wemo
                living_room_wemo.reflectState(false);
                logEvent("Living Room Lights are now off, turn off wemo");
            }
        }
    );

    listeners.users.ryan_arrived_home = new Listener(
        ryan,
        "arrived",
        function(event, data) {
            living_room_lights.colorLoop(10000);
            user.host.handleLocationChange(ryan, event, data);
        }
    );

    listeners.users.ryan_left_home = new Listener(
        ryan,
        "leaving",
        function(event, data) {
            user.host.handleLocationChange(ryan, event, data);
        }
    );

    listeners.users.meredith_arrived_home = new Listener(
        meredith,
        "arrived",
        function(event, data) {
            user.host.handleLocationChange(meredith, event, data);
        }
    );

    listeners.users.meredith_left_home = new Listener(
        meredith,
        "leaving",
        function(event, data) {
            user.host.handleLocationChange(meredith, event, data);
        }
    );

    //state test
//    living_room_lights.light_devices.get("1").color("#FF0000", 5000);
//    living_room_lights.light_devices.get("2").color("#FF0000", 5500);
//    living_room_lights.light_devices.get("3").color("#FF0000", 6000);
//    living_room_lights.light_devices.get("4").color("#FF0000", 6500);
//    living_room_lights.light_devices.get("5").color("#FF0000", 7000);
//    living_room_lights.light_devices.get("6").color("#FF0000", 7500);

//    living_room_lights.light_devices.get("1").setTemporaryState(
//        {
//            "xy": rgb.convertRGBtoXY([255,0,0], {modelId: this.model_id})
//        },
//        10000
//    );

//    living_room_lights.setTemporaryState(
//        {
//            "xy": rgb.convertRGBtoXY([255,0,0], {modelId: this.model_id})
//        },
//        10000
//    );

    //color test
//    living_room_lights.setTransitionTime(100);
//    var colorCycle = function() {
//        living_room_lights.color("#FF0000");
//        setTimeout(function() {
//            living_room_lights.color("#00FF00");
//            setTimeout(function() {
//                living_room_lights.color("#0000FF");
//            }, 5000);
//        }, 5000);
//    };
//
//    colorCycle();
//    setInterval(colorCycle, 15000);
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