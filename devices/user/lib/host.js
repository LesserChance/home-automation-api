// External Modules
var util         = require('util');
var eventEmitter = require('events').EventEmitter;

// App Modules
var hue          = require("../../../devices/hue");
var DeviceList   = require("../../../util/device_list");
var config       = require("../../../util/config.js");

// Local Modules
var User         = require('./user');
var Model        = require('./model');

// constants
var LOCATION     = require("../../../constants/location");

var UserHost = function () {

};
util.inherits(UserHost, eventEmitter);

/*****************************************
 * Public Methods                        *
 *****************************************/
UserHost.prototype.init = function init() {
    this.user_list = new DeviceList();

    //create the users
    Model.find(function(err, people) {
        if (!err) {
            for (var i = 0, iEnd = people.length; i < iEnd; i++) {
                this.user_list.add(people[i]._id, new User(people[i]));
            }
        }
    }.bind(this));
};

UserHost.prototype.getUser = function getUser(user_name) {
    return this.user_list.getNamedDevice(user_name);
};

UserHost.prototype.handleLocationChange = function handleLocationChange(user, event, data) {
    var other_user = this.getUser("ryan");

    if (user == other_user) {
        other_user = this.getUser("meredith");
    }

    if (user.get("location") == LOCATION.HOME) {
        if (other_user.get("location") != LOCATION.HOME) {
            // The other user is not home, set the lights up
            var living_room_lights = hue.host.getLightGroup(0);
            living_room_lights.setScene(user.get("home_light_preference"));
        } else {
            // The other user is home, blink the lights to notify that user is close

        }
    }
};

module.exports = new UserHost();