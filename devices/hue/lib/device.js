// External Modules
var eventEmitter = require('events').EventEmitter;
var util         = require('util');
var Q            = require('q');

// App Modules
var MultiEmit     = require("../../../util/multi_emitter");

/**
 * Interface
 */
function HueDevice() {
    this.id = null;
    this.api_path = null;
    this.action_url = null;
}

util.inherits(HueDevice, eventEmitter);

/**
 * Emit multiple events
 * @param events
 * @param args
 */
HueDevice.prototype.emits = function emits(events, args) {
    MultiEmit.call(this, events, args);
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
        this.emit('turning_on');
        this.once("on", function() {
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
        this.emit('turning_off');
        this.once("off", function() {
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
        case "dimming":
            this.emit("dimmed");
            break;

        case "starting_effect":
            this.emit(new_state.effect !== "none" ? 'effect_start' : 'effect_end');
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
    this.emits(['on','changed'], {"previous_state": previous_state});

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

/***************************************
 * STATE CHANGES                       *
 ***************************************/
/**
 * Dim the device
 */
HueDevice.prototype.dim = function dim(brightness) {
    return this.setNewState(
        {"bri": parseInt(brightness, 10)},
        'dimming'
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
 * Run an effect
 * @param {String} effect - the effect to run
 * @returns {Promise}
 */
HueDevice.prototype.effect = function effect(effect) {
    return this.setNewState(
        {"effect": effect},
        'starting_effect'
    );
};

/**
 * Run an alert (these are already temporary)
 * @returns {Promise}
 */
HueDevice.prototype.alert = function alert() {
    return this.setNewState(
        {"alert": "lselect"},
        'alerting'
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
        emit_events.push('turning_on');
        callback = handleFinishedStateFromOff.bind(this);
    }

    this.emits(emit_events);

    return require("./host")
        .performRequest(this.getActionUrl(), "PUT", new_state)
        .then(function() {
            callback(emit_event, new_state)
        });
};

module.exports = HueDevice;