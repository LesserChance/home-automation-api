// External Modules
var util          = require('util');
var WemoNode      = require('wemonode');

// App Modules
var DeviceList    = require("../../../util/device_list");
var config        = require("../../../util/config");
var eventEmitter  = require("../../../util/event_emitter");

// Local Modules
var WemoDevice    = require("./device");
var WemoEvents    = require("./events");

// Private vars
var wemoNode = WemoNode.WemoNode();

var WemoHost = function () {
    this.device_list = new DeviceList();
    this.device_data = {};

    wemoNode.setBindAddress(config.ipaddress);

    wemoNode.on("device_found", function (device) {
        this.device_list.add(device.id, new WemoDevice(device));
        this.device_data[device.id] = device;
        wemoNode._updateBinaryStates();
    }.bind(this));

    wemoNode.on("device_lost", function (device) {
        this.device_list.remove(device.id);
        delete this.device_data[device.id];

        // try to pick it back up
        wemoNode.startDiscovery();
    }.bind(this));

    wemoNode.startDiscovery();
};
util.inherits(WemoHost, eventEmitter);

WemoHost.prototype.getDevice = function(device_name) {
    return this.device_list.getNamedDevice(device_name);
};

module.exports = function () {
    return new WemoHost();
};