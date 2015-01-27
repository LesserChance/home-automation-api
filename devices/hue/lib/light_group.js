// External Modules
var eventEmitter = require('events').EventEmitter;
var util         = require('util');
var Q            = require('q');
var hue          = require('node-hue-api');

// App Modules
var DeviceList    = require("../../../util/device_list");
var MultiEmit     = require("../../../util/multi_emitter");

var STATE_OFF  = 0;
var STATE_ON   = 1;
var STATE_DIFF = 2;

/**
 * Public events are:
 * Public methods are: 
 */
function HueLightGroup(data) {
    this.id = data.id;
    this.name = data.name;
    this.lights = [];
    this.light_devices = new DeviceList();

    this.loaded = false;
    this.state = null;

    // when an event is triggered causing a light change, poll more frequently
    this.light_devices.onDeviceEvent("change", this.handleNewState.bind(this));

    // Retrieve the current light status
    init.call(this, data);
}

util.inherits(HueLightGroup, eventEmitter);

HueLightGroup.prototype.constants = {
    STATE_OFF  : STATE_OFF,
    STATE_ON   : STATE_ON,
    STATE_DIFF : STATE_DIFF
};

/**
* The device has retrieved it's initial state
*/
var init = function init(data) {
    this.lights = data.lights;
    for (var key in this.lights) {
        var light = require("./host").getLight(this.lights[key]);
        this.light_devices.add(light.id, light);
    }
    this.state = getCurrentState.call(this);

    this.loaded = true;
    this.emit("load");
};

/**
 * Turn the device on
 */
HueLightGroup.prototype.setOn = function setOn() {
    var deferred = Q.defer();

    if (this.state === STATE_ON) {
        deferred.resolve();
    } else {
        this.emit('turning_on');
        this.once("on", function() {
            deferred.resolve();
        });
        require("./host").performRequest(
            "/groups/" + this.id + "/action",
            "PUT",
            {"on": true}
        );
    }

    return deferred.promise;
};

/**
 * Turn the device off
 */
HueLightGroup.prototype.setOff = function setOff() {
    var deferred = Q.defer();

    if (!this.state === STATE_OFF) {
        deferred.resolve();
    } else {
        this.emit('turning_off');
        this.once("off", function() {
            deferred.resolve();
        });
        require("./host").performRequest(
            "/groups/" + this.id + "/action",
            "PUT",
            {"on": false}
        );
    }

    return deferred.promise;
};

/**
 * Flip the device - if not all are on, turn them all on
 *                   otherwise, turn them all off
 */
HueLightGroup.prototype.flip = function flip() {
    if (this.state !== STATE_ON) {
        return this.setOn();
    } else {
        return this.setOff();
    }
};

/**
 * Dim the device
 */
HueLightGroup.prototype.dim = function dim(brightness) {
    if (this.state === STATE_OFF) {
        this.emits(['turning_on','dimming']);

        var new_state = {
            "on": true,
            "bri": parseInt(brightness, 10)
        };

        return require("./host")
            .performRequest( "/groups/" + this.id + "/action", "PUT", new_state)
            .then(function() {
                this.state = STATE_ON;
                this.emits(['on','changed','dimmed']);
                updateLightState.call(this, new_state);
            }.bind(this));
    } else {
        this.emit('dimming');

        var new_state = {
            "bri": parseInt(brightness, 10)
        };

        return require("./host")
            .performRequest("/groups/" + this.id + "/action", "PUT", new_state)
            .then(function() {
                this.emit("dimmed");
                updateLightState.call(this, new_state);
            }.bind(this));
    }
};

/**
 * get a json representation of this light
 * @returns Object
 */
HueLightGroup.prototype.toJson = function toJson() {
    return {
        state: this.state
    };
};

/**
 *
 */
HueLightGroup.prototype.handleNewState = function handleNewState() {
    // Check on/off
    var new_state = getCurrentState.call(this);

    var state_changed = false;
    if (new_state != this.state) {
        var previous_state = this.state;
        this.state = new_state;
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

HueLightGroup.prototype.emits = function emits(events, args) {
    MultiEmit.call(this, events, args);
};

/**
 *
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
 *
 */
var updateLightState = function updateLightState(state_data) {
    var light_devices = this.light_devices.getAll();

    for (var key in light_devices) {
        if (light_devices[key].state.on) {
            for (var state_key in state_data) {
                light_devices[key].state[state_key] = state_data[state_key];
            }
        }
    }
};

module.exports = HueLightGroup;
