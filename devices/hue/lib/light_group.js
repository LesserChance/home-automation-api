// External Modules
var util         = require('util');
var Q            = require('q');
var hue          = require('node-hue-api');

// App Modules
var DeviceList   = require("../../../util/device_list");

// Local Modules
var HueDevice    = require("./device");
var HueEvents    = require("./events");

// constants
var LIGHT_STATE  = require("../../../constants/light_state");

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

    this.light_devices.onDeviceEvent(HueEvents.state_change.key, handleNewLightState.bind(this));

    // Retrieve the current light status
    init.call(this, data);
}

util.inherits(HueLightGroup, HueDevice);

HueLightGroup.prototype.constants = {
    STATE_ON : LIGHT_STATE.GROUP_ON
};

/***************************************
 * SCENE CHANGES                       *
 ***************************************/
/**
 * Set this device to a new state for a specific duration, then go back to what it was
 * @param {Object} new_state - object representing the new state
 * @param {Number} duration - the length of the new state
 * @returns {Promise}
 */
HueLightGroup.prototype.setTemporaryState = function setTemporaryState(new_state, duration) {
    return saveTemporaryScene.call(this)
        .then(function() {
            //set the new state
            new_state.transitiontime = this.transition_time;

            return this.setState(new_state)
                .then(function() {
                    setTimeout(function() {
                        this.setScene(LIGHT_STATE.TEMP_SCENE);
                    }.bind(this), duration);
                }.bind(this));
        }.bind(this));
};

/**
 *
 */
HueLightGroup.prototype.setScene = function setScene(scene_id, duration) {
    if (duration != null) {
        return this.setTemporaryScene(scene_id);
    } else {
        return this.setNewState(
            {scene: scene_id},
            HueEvents.loading_scene.key
        );
    }
};

/**
 *
 */
HueLightGroup.prototype.setTemporaryScene = function setTemporaryScene(scene_id, duration) {
    return saveTemporaryScene.call(this)
        .then(function() {
            return this.setScene(scene_id)
                .then(function() {
                    setTimeout(function() {
                        this.setScene(LIGHT_STATE.TEMP_SCENE);
                    }.bind(this), duration);
                }.bind(this));
        }.bind(this));
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

    // assume the lights are all the same model
    this.model_id = light.modelId;

    this.loaded = true;
    this.emit(HueEvents.load.key);
};

/**
 * Get the full state of this device
 * @returns {Promise}
 */
var saveTemporaryScene = function saveTemporaryScene() {
    return require("./host").saveScene(LIGHT_STATE.TEMP_SCENE);
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
        return LIGHT_STATE.GROUP_ON;
    } else if (on_count > 0) {
        return LIGHT_STATE.GROUP_DIFF;
    }
    return LIGHT_STATE.GROUP_OFF;
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
        if (new_state === LIGHT_STATE.GROUP_ON) {
            this.emits([HueEvents.on.key, HueEvents.state_change.key], {"previous_state": previous_state});
        } else if (new_state === LIGHT_STATE.GROUP_DIFF) {
            this.emits([HueEvents.diff.key, HueEvents.state_change.key], {"previous_state": previous_state});
        } else {
            this.emits([HueEvents.off.key, HueEvents.state_change.key], {"previous_state": previous_state});
        }
        state_changed = true;
    }

    return state_changed;
};

module.exports = HueLightGroup;
