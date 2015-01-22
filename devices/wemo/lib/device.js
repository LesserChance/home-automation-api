// External Modules
var eventEmitter = require('events').EventEmitter;
var wemoNode     = require('wemonode').WemoNode();
var util         = require('util');
var Q            = require('q');

/**
 * Public events are: load, change, on, off
 * Public methods are: setOn, setOff, flip
 */
var WemoDevice = function(data) {
    this.data = data;

    this.id = data.id;
    this.loaded = false;
    this.state = null;
    this.state_deferred = null;

    wemoNode.once("state_changed", init.bind(this));
};

util.inherits(WemoDevice, eventEmitter);

/**
 * The device's state has changed
 */
WemoDevice.prototype.handleStateChange = function handleStateChange(data) {
    if (this.state != data.binarystate) {
        this.state = data.binarystate;

        // Emit a change event
        this.emit('change', {
            "state" : this.state
        });

        if (data.binarystate) {
            this.emit('on');
        } else {
            this.emit('off');
        }
    }

    if (this.state_deferred) {
        this.state_deferred.resolve();
        this.state_deferred = null;
    }
};

/**
 * Turn the device on
 */
WemoDevice.prototype.setOn = function setOn() {
    var deferred = Q.defer();

    if (this.state) {
        deferred.resolve();
    } else {
        setBinaryState.call(this, 1, deferred);
    }

    return deferred.promise;
};

/**
 * Turn the device off
 */
WemoDevice.prototype.setOff = function setOn() {
    var deferred = Q.defer();

    if (!this.state) {
        deferred.resolve();
    } else {
        setBinaryState.call(this, 0, deferred);
    }

    return deferred.promise;
};

/**
 * Flip the device
 */
WemoDevice.prototype.flip = function flip() {
    var deferred = Q.defer();
    setBinaryState.call(this, this.state ? 0 : 1, deferred);
    return deferred.promise;
};

/**
 * Set the device state without triggering any change events on callback
 * @param new_state - boolean
 */
WemoDevice.prototype.reflectState = function reflectState(new_state) {
    this.state = (new_state ? 1 : 0);
    setBinaryState.call(this, new_state ? 1 : 0, null);
};

/**
 * Describe the device
 */
WemoDevice.prototype.toJson = function toJson() {
    return {
        state: this.state
    };
};

/*****************************************
 * Private Methods                       *
 *****************************************/
/**
 * The device has retrieved it's initial state
 */
var init = function init(data) {
    this.state = data.binarystate;
    this.loaded = true;

    this.emit("load");

    wemoNode.on("state_changed", function (data) {
        this.handleStateChange(data);
    }.bind(this));
};

/**
 * Update the device state
 * @param state
 * @param deferred
 */
var setBinaryState = function setBinaryState(state, deferred) {
    //resolve deferred when the callback occurs
    this.state_deferred = deferred;

    wemoNode.sendCommand("both_setbinarystate",
        this.data,
        {"binarystate": state}
    );
};

module.exports = exports = WemoDevice;