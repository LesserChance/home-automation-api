// External Modules
var util          = require('util');
var eventEmitter  = require('events').EventEmitter;
var hue           = require('node-hue-api');

// App Modules
var DeviceList    = require("../../../util/device_list");
var config        = require("../../../util/config.js");

// Local Modules
var HueLight      = require("./light.js");
var HueLightGroup = require("./light_group.js");

// Private vars
var api;

var fast_poll = 111;
var slow_poll = 5000;
var decrease_poll_time = 20000;

var HueHost = function () {
    this.poll_timeout = slow_poll;

    this.light_list = new DeviceList();
    this.light_group_list = new DeviceList();

    // when an method is triggered causing a light change, poll more frequently
    this.light_list.onDeviceEvent("turning_on", this.increasePollRate.bind(this));
    this.light_list.onDeviceEvent("turning_off", this.increasePollRate.bind(this));

    this.light_group_list.onDeviceEvent("turning_on", this.increasePollRate.bind(this));
    this.light_group_list.onDeviceEvent("turning_off", this.increasePollRate.bind(this));

    hue.nupnpSearch()
        .then(function(results) {
            var bridge = results[0];

            try {
                api = new hue.HueApi(bridge.ipaddress, config.hue_username);
                api.connect()
                    .then(getLights.bind(this))
                    .then(getLightGroups.bind(this))
                    .then(ready.bind(this))
                    .done();
            } catch (e) {
                console.debug(e);
            }
        }.bind(this))
        .done();
};
util.inherits(HueHost, eventEmitter);

HueHost.prototype.getLight = function getLight(device_id) {
    return this.light_list.get(device_id);
};

HueHost.prototype.getLightGroup = function getLightGroup(device_id) {
    return this.light_group_list.get(device_id);
};

HueHost.prototype.getApi = function getApi() {
    return api;
};

HueHost.prototype.increasePollRate = function increasePollRate() {
    if (this.poll_timeout != fast_poll) {
        this.poll_timeout = fast_poll;

        setTimeout(function() {
            this.poll_timeout = slow_poll;
        }.bind(this), decrease_poll_time);
    }
};

/*****************************************
 * Private Methods                       *
 *****************************************/
var getLights = function getLights() {
    // Get the lights
    return api.lights()
        .then(function(data) {
            for (var key in data.lights) {
                var light = data.lights[key];
                this.light_list.add(light.id, new HueLight(light));
            }
        }.bind(this));
};

var getLightGroups = function getLightGroups() {
    //Get the groups
    return api.groups()
        .then(function(groups) {
            for (var key in groups) {
                var light_group = groups[key];
                this.light_group_list.add(light_group.id, new HueLightGroup(light_group));
            }
        }.bind(this));
};

var ready = function ready() {
    poll.call(this);
    this.emit("ready");
};

var poll = function poll() {
    api.getFullState()
        .then(updateLightState.bind(this))
        .then(function() {
            setTimeout(poll.bind(this), this.poll_timeout);
        }.bind(this))
        .done();
};

var updateLightState = function updateLightState(data) {
    var state_changed = false;
    for (var key in data.lights) {
        var light = data.lights[key];

        state_changed = state_changed || this.light_list.get(key).handleNewState(light.state);
    }

    if (state_changed) {
        //state has changed, increase the poll rate automatically for a bit
        this.increasePollRate();
    }
};

module.exports = new HueHost();