// External Modules
var eventEmitter = require('events').EventEmitter;
var util         = require('util');
var Q            = require('q');
var hue          = require('node-hue-api');

// App Modules
var DeviceList    = require("../../../util/device_list");

// Local Modules
var HueDevice    = require("./device");

var STATE_OFF  = 0;
var STATE_ON   = 1;
var STATE_DIFF = 2;

/**
 *
 */
function HueLightGroup(data) {
    this.api_path = "/groups/";
    this.action_url = "/action";

    this.id = data.id;
    this.name = data.name;
    this.lights = [];
    this.light_devices = new DeviceList();

    this.loaded = false;
    this.state = {"on":null};

    this.light_devices.onDeviceEvent("change", handleNewLightState.bind(this));

    // Retrieve the current light status
    init.call(this, data);
}

util.inherits(HueLightGroup, HueDevice);

HueLightGroup.prototype.constants = {
    STATE_OFF  : STATE_OFF,
    STATE_ON   : STATE_ON,
    STATE_DIFF : STATE_DIFF
};

/***************************************
 * STATE CHANGE CALLBACKS              *
 ***************************************/
/**
 * The group has finished setting a new state
 * @param event - the event that triggered on start
 * @param new_state
 */
HueLightGroup.prototype.handleStateEventEnd = function handleStateEventEnd(event, new_state) {
    //reset the state on each light
    updateLightState.call(this, new_state);
};

/***************************************
 * PRIVATE FUNCTIONS                   *
 ***************************************/
/**
 * The device has retrieved it's initial state
 */
var init = function init(data) {
    this.lights = data.lights;
    for (var key in this.lights) {
        var light = require("./host").getLight(this.lights[key]);
        this.light_devices.add(light.id, light);
    }
    this.state.on = getCurrentState.call(this);

    this.loaded = true;
    this.emit("load");
};

/**
 * Get each lights state and set the groups state accordingly
 * @returns {number}
 */
var getCurrentState = function getCurrentState() {
    var on_count = 0;
    var light_devices = this.light_devices.getAll();

    for (var key in light_devices) {
        if (light_devices[key].state.on) {
            on_count++;
        }
    }

    if (on_count === this.lights.length) {
        return STATE_ON;
    } else if (on_count > 0) {
        return STATE_DIFF;
    }
    return STATE_OFF;
};

/**
 * This entire group has been set to a new state, make sure each individual light reflects
 */
var updateLightState = function updateLightState(state_data) {
    var light_devices = this.light_devices.getAll();

    for (var key in light_devices) {
        if (light_devices[key].state.on) {
            for (var state_key in state_data) {
                //todo: make sure events are fired
                light_devices[key].state[state_key] = state_data[state_key];
            }
        }
    }
};

/**
 * Lights in this group have changed state, update this groups state as necessary
 */
var handleNewLightState = function handleNewLightState() {
    var new_state = getCurrentState.call(this);

    var state_changed = false;
    if (new_state != this.state.on) {
        var previous_state = this.state.on;
        this.state.on = new_state;
        if (new_state === STATE_ON) {
            this.emits(['on', 'change'], {"previous_state": previous_state});
        } else if (new_state === STATE_DIFF) {
            this.emits(['diff', 'change'], {"previous_state": previous_state});
        } else {
            this.emits(['off', 'change'], {"previous_state": previous_state});
        }
        state_changed = true;
    }

    return state_changed;
};

module.exports = HueLightGroup;
