// App Modules
var hue = require("../devices/hue");
var wemo = require("../devices/wemo");
var twilio = require("../devices/twilio-phone");
var user = require("../devices/user");

// App Modules
var config = require("../util/config.js");

// constants
var LIGHT_STATE  = require("../constants/light_state");
var LOCATION     = require("../constants/location");

var logEvent = function logEvent(description) {
    console.log({
        "time": (new Date()).toString(),
        "type": "event",
        "data": "Event Occurred: " + description
    });
};

var addListener = function addListener(device, event, callback, description) {
    device.on(event, function() {
        callback(this, arguments);
        if (description) {
            logEvent(description);
        }
    }.bind(this));
};

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

    // Whenever the living room wemo is turned on, turn on all lights
    addListener(
        living_room_wemo,
        "on",
        function() {
            living_room_lights.setOn();
        },
        "Living Room Wemo turned on all lights"
    );

    // Whenever the living room wemo is turned off, turn off all lights
    addListener(
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
    addListener(
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

    //people test
//    console.debug("ryan");
//    console.debug(ryan);
//
//    console.debug("meredith");
//    console.debug(meredith);
//
//    ryan.on("arrived", function(data) {
//        console.debug("RYAN ARRIVED");
//        console.debug(data.previous_location);
//        console.debug(ryan.get("location"));
//    });
//
//    ryan.setLocation(LOCATION.HOME);
//    setTimeout(function() {
//        ryan.setLocation(LOCATION.WORK);
//    }, 5000);

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
        });
    }
};