// External Modules
var util         = require('util');
var Q            = require('q');

// App Modules
var eventEmitter = require("../../../util/event_emitter");

// Local Modules
var Model        = require('./model');
var UserEvents   = require("./events");

// constants
var LOCATION     = require("../../../constants/location");

var User = function (data) {
    this.id = data.id;
    this.data = data;
};

util.inherits(User, eventEmitter);

/*****************************************
 * Public Methods                        *
 *****************************************/
User.prototype.setLocation = function setLocation(new_location) {
    if (this.data.location != new_location) {
        var previous_location = this.data.location;

        // Update the model
        this.data.location = new_location;
        this.data.save();

        // Trigger events
        if (new_location === LOCATION.TRANSIT) {
            this.emit(UserEvents.leaving, {
                "previous_location": previous_location
            });
        } else {
            this.emit(UserEvents.arrived, {
                "previous_location": previous_location
            });
        }
    }
};

User.prototype.emitPhoneEvent = function emitPhoneEvent(event, data) {
    this.emit(event, data);
};

User.prototype.get = function(key) {
    return this.data[key];
};

module.exports = User;