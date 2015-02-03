// External Modules
var eventEmitter = require('events').EventEmitter;
var util         = require('util');
var Q            = require('q');

// Local Modules
var HueDevice    = require("./device");

// constants
var LIGHT_STATE  = require("../../../constants/light_state");

/**
 * Public events are:
 * Public methods are: 
 */
function HueLight(data) {
    this.api_path = "/lights/";
    this.action_url = "/state";

    this.id = data.id;
    this.name = data.name;
    this.model_id = data.modelId;

    this.loaded = false;
    this.state = null;

    // Retrieve the current light status
    init.call(this, data);
}

util.inherits(HueLight, HueDevice);

HueLight.prototype.constants = {
    STATE_ON : LIGHT_STATE.LIGHT_ON
};

/**
 * Check to see if this new state (pulled from the bridge) is different then the current
 * @return boolean - true if the state has changed
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

/***************************************
 * PRIVATE FUNCTIONS                   *
 ***************************************/
/**
 * The device has retrieved it's initial state
 */
var init = function init(data) {
//    console.debug(data);
//    console.debug("------------");

    this.state = data.state;
    this.model_id = data.modelId;
    this.loaded = true;
    this.emit("load");
};

module.exports = HueLight;
