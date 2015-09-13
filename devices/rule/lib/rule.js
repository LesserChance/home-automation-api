// External Modules
var util         = require('util');
var Q            = require('q');

// App Modules
var eventEmitter = require("../../../util/event_emitter");
var DeviceMap    = require("../../../util/device_type_map");
var Listener     = require("../../../util/listener");

// Local Modules
var host         = require("./host");
var Model        = require('./model');

/**
 *
 */
var Rule = function(data) {
    this.id = data._id;
    this.enabled = data.enabled;
    this.name = data.name;
    this.description = data.description;
    this.predicate_device_type = data.predicate_device_type;
    this.predicate_device_id = data.predicate_device_id;
    this.predicate_device_event = data.predicate_device_event;
    this.callback = data.callback;
};

util.inherits(Rule, eventEmitter);

/**
 * Turn the device on
 */
Rule.prototype.start = function start() {
    if (!DeviceMap[this.predicate_device_type]) {
        throw "Unrecognized device type";
    }
    var device = DeviceMap[this.predicate_device_type](this.predicate_device_id);

    this.handler = new Listener.listener(
        device,
        this.predicate_device_event,
        function(data) {
            // clear the stack and call the callback
            if (this.enabled) {
                Listener.start();

                try {
                    this.callback(data);
                } catch (e) {
                    if (e && e.description) {
                        // this is a known error
                        return Listener.error(e.description, e.data, e.code);
                    }

                    return Listener.error(e, {}, "UNKKOWN");
                }

                return Listener.success(this.description);
            }

            return Listener.ignored();
        }.bind(this)
    );
};

Rule.prototype.getRequirePath = function getRequirePath(path) {
    return "../../../" + path;
};

Rule.prototype.disableFor = function disableFor(timeout) {
    this.handler.disable();
    setTimeout(this.handler.enable, timeout);
};

/*****************************************
 * Private Methods                       *
 *****************************************/


module.exports = exports = Rule;