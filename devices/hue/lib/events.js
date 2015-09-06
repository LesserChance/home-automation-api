// App Modules
var Event = require("../../../util/event");

module.exports = {
    "turning_on" : new Event({
        "key": "turning_on",
        "description": "When the device is about to turn on"
    }),
    "turning_off" : new Event({
        "key": "turning_off",
        "description": "When the device is about to turn off"
    }),
    "on" : new Event({
        "key": "turned_on",
        "description": "When the device has been turned on"
    }),
    "off" : new Event({
        "key": "turned_off",
        "description": "When the device has been turned off"
    }),
    "state_change" : new Event({
        "key": "state_change",
        "description": "When the device has changed its state between on, off, and diff"
    }),
    "dimming" : new Event({
        "key": "dimming",
        "description": "When the device is about to dim"
    }),
    "dimmed" : new Event({
        "key": "dimmed",
        "description": "When the device has finished dimming"
    }),
    "setting_color" : new Event({
        "key": "setting_color",
        "description": "When the device is about to change color"
    }),
    "set_color" : new Event({
        "key": "set_color",
        "description": "When the device's color has been set"
    }),
    "alerting" : new Event({
        "key": "alerting",
        "description": "When the device is alerting"
    }),
    "starting_effect" : new Event({
        "key": "effect_start",
        "description": "When the device is about to start or stop an effect"
    }),
    "effect_start" : new Event({
        "key": "effect_start",
        "description": "When the device is about to play an effect"
    }),
    "effect_end" : new Event({
        "key": "effect_end",
        "description": "When the device has finished playing an effect"
    }),
    "loading_scene" : new Event({
        "key": "loading_scene",
        "description": "When the device is about to load a scene"
    }),
    "loaded_scene" : new Event({
        "key": "loaded_scene",
        "description": "When the device has loaded a scene"
    }),
    "load" : new Event({
        "key": "load",
        "description": "When the device is ready to handle events"
    }),
    "diff" : new Event({
        "key": "diff",
        "description": "When the device has some on and some off"
    })
};
