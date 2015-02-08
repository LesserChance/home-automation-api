// External Modules
var util         = require('util');
var eventEmitter = require('events').EventEmitter;
var Q            = require('q');

// Local Modules
var Model        = require('./model');

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
    console.debug("setLocation");
    if (this.data.location != new_location) {
        console.debug("switch");
        var previous_location = this.data.location;

        // Update the model
        this.data.location = new_location;
        this.data.save();

        // Trigger events
        if (new_location === LOCATION.TRANSIT) {
            this.emit("leaving", {
                "previous_location": previous_location
            });
        } else {
            this.emit("arrived", {
                "previous_location": previous_location
            });
        }
    }
};

User.prototype.get = function(key) {
    return this.data[key];
};

module.exports = User;