// App Modules
var hue = require("../devices/hue");
var wemo = require("../devices/wemo");
var twilio = require("../devices/twilio-phone");

// App Modules
var config = require("../util/config.js");

var logEvent = function logEvent(description) {
    console.log("Event Occurred: " + description);
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
            if (living_room_lights.state !== 0) {
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
            if (data[0].previous_state == living_room_lights.constants.STATE_OFF) {
                // Whenever the living room lights are changed from off, turn on the wemo
                living_room_wemo.reflectState(true);
                logEvent("Living Room Lights are now on, turn on wemo");
            } else if (living_room_lights.state == living_room_lights.constants.STATE_OFF) {
                // Whenever the living room lights are changed to off, turn off the wemo
                living_room_wemo.reflectState(false);
                logEvent("Living Room Lights are now off, turn off wemo");
            }
        }
    );
};

module.exports =  {
    initialize: function initialize(app) {
        hue.host.on("ready", function() {
            startListeners();
            console.debug("Listeners Ready");
        });
    }
};