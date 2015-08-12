// External Modules
var util         = require('util');
var Q            = require('q');
var rgb          = require('node-hue-api/hue-api/rgb');

// App Modules
var eventEmitter = require("../../../util/event_emitter");

// Local Modules
var HueEvents    = require("./events");

/**
 * Interface
 */
function HueDevice() {
    this.id = null;
    this.api_path = null;
    this.action_url = null;
    this.transition_time = null;
}

util.inherits(HueDevice, eventEmitter);

/**
 * return the url used to retrieve this devices state
 * @returns String
 */
HueDevice.prototype.getDeviceUrl = function getDeviceUrl() {
    return this.api_path + this.id ;
};

/**
 * return the url used to update this devices state
 * @returns String
 */
HueDevice.prototype.getActionUrl = function getActionUrl() {
    return this.api_path + this.id + this.action_url;
};

/**
 * Get a json representation of this light
 * @returns Object
 */
HueDevice.prototype.toJson = function toJson() {
    return {
        state: this.state
    };
};

/***************************************
 * BINARY STATE                        *
 ***************************************/
/**
 * Turn the device on
 */
HueDevice.prototype.setOn = function setOn() {
    var deferred = Q.defer();

    if (this.state.on) {
        deferred.resolve();
    } else {
        this.emit(HueEvents.turning_on);
        this.once(HueEvents.on, function() {
            deferred.resolve();
        });
        require("./host").performRequest(
            this.getActionUrl(),
            "PUT",
            {"on": true}
        );
    }

    return deferred.promise;
};

/**
 * Turn the device off
 */
HueDevice.prototype.setOff = function setOff() {
    var deferred = Q.defer();

    if (!this.state.on) {
        deferred.resolve();
    } else {
        this.emit(HueEvents.turning_off);
        this.once(HueEvents.off, function() {
            deferred.resolve();
        });
        require("./host").performRequest(
            this.getActionUrl(),
            "PUT",
            {"on": false}
        );
    }

    return deferred.promise;
};

/**
 * Flip the device
 */
HueDevice.prototype.flip = function flip() {
    if (this.state.on) {
        return this.setOff();
    } else {
        return this.setOn();
    }
};

/**
 * Callback after a new state occurs - used for implementation in child class
 * @param transition_time - time in ms
 */
HueDevice.prototype.setTransitionTime = function setTransitionTime(transition_time) {
    this.transition_time = Math.floor(transition_time / 100);
};

/***************************************
 * STATE CHANGES                       *
 ***************************************/
/**
 * Dim the device
 */
HueDevice.prototype.dim = function dim(brightness, duration) {
    return this.setPermanentOrTempState(
        {
            "bri": parseInt(brightness, 10)
        },
        HueEvents.dimming,
        duration
    );
};

/**
 * Run the color loop for a certain duration
 * @param length - duration of effect
 * @returns {Promise}
 */
HueDevice.prototype.colorLoop = function colorLoop(length) {
    setTimeout(function() {
        this.effect("none")
    }.bind(this), length);

    return this.effect("colorloop");
};

/**
 * Set the device color
 */
HueDevice.prototype.color = function color(hex, duration) {
    return this.setPermanentOrTempState(
        {
            "xy": rgb.convertRGBtoXY(hexToRgb(hex), {modelId: this.model_id})
        },
        HueEvents.setting_color,
        duration
    );
};

/**
 * Run an effect
 * @param {String} effect - the effect to run
 * @returns {Promise}
 */
HueDevice.prototype.effect = function effect(effect) {
    return this.setNewState(
        {"effect": effect},
        HueEvents.starting_effect
    );
};

/**
 * Run an alert (these are already temporary)
 * @returns {Promise}
 */
HueDevice.prototype.alert = function alert() {
    return this.setNewState(
        {"alert": "lselect"},
        HueEvents.alerting
    );
};

/**
 * Generic function for setting this device to a new state, handles turning it on if its not currently
 * @param {Object} new_state - object representing the new state
 * @param {String} emit_event - the events to emit before the new state occurs
 * @returns {Promise}
 */
HueDevice.prototype.setNewState = function setNewState(new_state, emit_event) {
    var emit_events = [emit_event],
        callback = handleFinishedState.bind(this);

    if (!this.state.on) {
        new_state.on = true;
        emit_events.push(HueEvents.turning_on);
        callback = handleFinishedStateFromOff.bind(this);
    }

    this.emits(emit_events, {state: new_state});

    new_state.transitiontime = this.transition_time;

    return this.setState(new_state)
        .then(function() {
            callback(emit_event, new_state)
        });
};

/**
 * Perform the hue api request to set a state
 * @param {Object} new_state - object representing the new state
 * @returns {Promise}
 */
HueDevice.prototype.setState = function setState(new_state) {
    return require("./host")
        .performRequest(this.getActionUrl(), "PUT", new_state)
};

/**
 * If duration is non-null only set the state temporarily
 * @param {Object} new_state - object representing the new state
 * @param {String} emit_event - the events to emit before the new state occurs
 * @param {Number} duration - the length of the new state
 * @returns {Promise}
 */
HueDevice.prototype.setPermanentOrTempState = function setPermanentOrTempState(new_state, emit_event, duration) {
    if (duration != null) {
        return this.setTemporaryState(new_state, duration)
    } else {
        return this.setNewState(new_state, emit_event);
    }
};

/***************************************
 * STATE CHANGE CALLBACKS              *
 ***************************************/
/**
 * Private
 * Callback after a new state occurs
 * @param event - the event that triggered on start
 * @param new_state
 */
var handleFinishedState = function handleFinishedState(event, new_state) {
    switch (event) {
        case HueEvents.dimming:
            this.emit(HueEvents.dimmed, {state: new_state});
            break;

        case HueEvents.setting_color:
            this.emit(HueEvents.set_color, {state: new_state});
            break;

        case HueEvents.starting_effect:
            this.emit(new_state.effect !== "none" ? HueEvents.effect_start : HueEvents.effect_end, {state: new_state});
            break;

        case HueEvents.loading_scene:
            this.emit(HueEvents.loaded_scene, {state: new_state});
            break;
    }

    this.handleStateEventEnd(event, new_state);
};

/**
 * Private
 * Callback after a new state occurs (if the device had to be turned on)
 * @param event - the event that triggered on start
 * @param new_state
 */
var handleFinishedStateFromOff = function handleFinishedStateFromOff(event, new_state) {
    var previous_state = this.state.on;
    this.state.on = this.constants.STATE_ON;
    this.emits([HueEvents.on, HueEvents.state_change], {"previous_state": previous_state});

    handleFinishedState.call(this, event, new_state);
};

/**
 * Protected
 * Callback after a new state occurs - used for implementation in child class
 * @param event - the event that triggered on start
 * @param new_state
 */
HueDevice.prototype.handleStateEventEnd = function handleStateEventEnd(event, new_state) {
    // implement in child class
};

/**
 * Protected
 * Set this device to a new state for a specific duration, then go back to what it was
 * @param {Object} new_state - object representing the new state
 * @param {Number} duration - the length of the new state
 * @returns {Promise}
 */
HueDevice.prototype.setTemporaryState = function setTemporaryState(new_state, duration) {
    // implement in child class
};

var hexToRgb = function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
    ] : null;
};

module.exports = HueDevice;
