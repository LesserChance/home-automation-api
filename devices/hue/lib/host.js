// External Modules
var util          = require('util');
var eventEmitter  = require('events').EventEmitter;
var hue           = require('node-hue-api');

// App Modules
var DeviceList    = require("../../../util/device_list");
var config        = require("../../../util/config.js");
var request       = require('../../../util/request');

// Local Modules
var HueLight      = require("./light.js");
var HueLightGroup = require("./light_group.js");

// Private vars
var api;
var bridge;
var base_url = "/api/" + config.hue_username;

var fast_poll = 500;
var slow_poll = 10000;
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
            if (!results.length) {
                console.debug("Couldn't find bridge, using default");
                bridge = {
                    ipaddress: "192.168.1.68"
                }
            } else {
                bridge = results[0];
            }

            //test the connection
            this.performRequest("/lights")
                .then(function(data) {
                    if (data && data.length && data[0].error && data[0].error.type == 1) {
                        //need to create a user
                        this.createUser();
                    } else {
                        this.start();
                    }
                }.bind(this));
        }.bind(this))
        .done();
};
util.inherits(HueHost, eventEmitter);

HueHost.prototype.start = function start() {
    getLights.call(this)
        .then(getLightGroups.bind(this))
        .then(ready.bind(this))
};

HueHost.prototype.performRequest = function performRequest(path, method, data) {
    return request.perform(bridge.ipaddress, base_url + path, method, data, null, false);
};

HueHost.prototype.getLight = function getLight(device_id) {
    return this.light_list.get(device_id);
};

HueHost.prototype.getLightGroup = function getLightGroup(device_id) {
    return this.light_group_list.get(device_id);
};

HueHost.prototype.increasePollRate = function increasePollRate() {
    if (this.poll_timeout != fast_poll) {
        this.poll_timeout = fast_poll;

        setTimeout(function() {
            this.poll_timeout = slow_poll;
        }.bind(this), decrease_poll_time);
    }
};

HueHost.prototype.createUser = function createUser() {
    console.debug("Click the fucking button");

    return request
        .perform(bridge.ipaddress, "/api", "POST", {
            "devicetype": "bateman#lightserver",
            "username": config.hue_username
        }, null, false)
        .then(function(data) {
            if (!data[0].success) {
                setTimeout(this.createUser.bind(this), 2000);
            } else {
                this.start();
            }
        }.bind(this));
};

/*****************************************
 * Private Methods                       *
 *****************************************/

var getLights = function getLights() {
    // Get the lights
    return this.performRequest("/lights")
        .then(function(data) {
            for (var key in data) {
                var light = data[key];
                light.id = parseInt(key, 10);

                this.light_list.add(light.id, new HueLight(light));
            }
        }.bind(this));
};

var getLightGroups = function getLightGroups() {
    //Get the groups
    return this.performRequest("/groups")
        .then(function(groups) {
            // add the "all lights" group
            this.light_group_list.add(0, new HueLightGroup({
                    id: 0,
                    lights: Object.keys(this.light_list.getAll()),
                    name: 'All Lights',
                    loaded: true,
                    state:
                    {
                        on: false
                    }
            }));

            for (var key in groups) {
                var light_group = groups[key];
                light_group.id = parseInt(key, 10);

                this.light_group_list.add(light_group.id, new HueLightGroup(light_group));
            }
        }.bind(this));
};

var ready = function ready() {
    poll.call(this);
    this.emit("ready");
};

var poll = function poll() {
    return this.performRequest("")
        .then(updateLightState.bind(this))
        .then(function() {
            setTimeout(poll.bind(this), this.poll_timeout);
        }.bind(this))
        .done();
};

var updateLightState = function updateLightState(data) {
    var state_changed = false;
    for (var key in data.lights) {
        var light = data.lights[key],
            light_changed = this.light_list.get(key).handleNewState(light.state);

        state_changed = state_changed || light_changed;
    }

    if (state_changed) {
        // state has changed, increase the poll rate automatically for a bit
        // because its likely to change again
        this.increasePollRate();
    }
};

module.exports = new HueHost();