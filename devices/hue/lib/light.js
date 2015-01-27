// External Modules
var eventEmitter = require('events').EventEmitter;
var util         = require('util');
var Q            = require('q');

/**
 * Public events are:
 * Public methods are: 
 */
function HueLight(data) {
    this.id = data.id;
    this.name = data.name;

    this.loaded = false;
    this.state = null;

    // Retrieve the current light status
    init.call(this, data);
}

util.inherits(HueLight, eventEmitter);

/**
* The device has retrieved it's initial state
*/
var init = function init(data) {
    this.state = data.state;
    this.loaded = true;
    this.emit("load");
};


/**
 * Turn the device on
 */
HueLight.prototype.setOn = function setOn() {
    var deferred = Q.defer();

    if (this.state.on) {
        deferred.resolve();
    } else {
        this.emit('turning_on');
        this.once("on", function() {
            deferred.resolve();
        });
        require("./host").performRequest(
            "/lights/" + this.id + "/state",
            "PUT",
            {"on": true}
        );
    }

    return deferred.promise;
};

/**
 * Turn the device off
 */
HueLight.prototype.setOff = function setOff() {
    var deferred = Q.defer();

    if (!this.state.on) {
        deferred.resolve();
    } else {
        this.emit('turning_off');
        this.once("off", function() {
            deferred.resolve();
        });
        require("./host").performRequest(
            "/lights/" + this.id + "/state",
            "PUT",
            {"on": false}
        );
    }

    return deferred.promise;
};

/**
 * Flip the device
 */
HueLight.prototype.flip = function flip() {
    if (this.state.on) {
        return this.setOff();
    } else {
        return this.setOn();
    }
};


/**
 * Dim the device
 */
HueLight.prototype.dim = function dim(brightness) {
    if (!this.state.on) {
        this.emit('turning_on');
        this.emit('dimming');

        return require("./host")
            .performRequest(
                "/lights/" + this.id + "/state",
                "PUT",
                {
                    "on": true,
                    "bri": parseInt(brightness, 10)
                }
            )
            .then(function() {
                this.state.on = true;
                this.emit('on');
                this.emit('change');
                this.emit("dimmed");
            }.bind(this));
    } else {
        this.emit('dimming');

        return require("./host")
            .performRequest(
                "/lights/" + this.id + "/state",
                "PUT",
                {
                    "bri": parseInt(brightness, 10)
                }
            )
            .then(function() {
                this.emit("dimmed");
            }.bind(this));
    }
};

/**
 * get a json representation of this light
 * @returns Object
 */
HueLight.prototype.toJson = function toJson() {
    return {
        state: this.state
    };
};

/**
 */
HueLight.prototype.handleNewState = function handleNewState(new_state) {
    // Check on/off
    var state_changed = false;
    if (new_state.on != this.state.on) {
        this.state.on = new_state.on;
        if (new_state.on) {
            this.emit('on');
        } else {
            this.emit('off');
        }
        this.emit('change');
        state_changed = true;
    }

    return state_changed;

};

module.exports = HueLight;
