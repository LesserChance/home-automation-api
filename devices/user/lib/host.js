// External Modules
var util         = require('util');

// App Modules
var hue          = require("../../../devices/hue");
var DeviceList   = require("../../../util/device_list");
var config       = require("../../../util/config");
var eventEmitter = require("../../../util/event_emitter");

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

module.exports = new UserHost();