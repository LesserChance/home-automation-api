// External Modules
var eventEmitter = require('events').EventEmitter;
var util         = require('util');

// App Modules
var config       = require("./config.js");

var DeviceList = function DeviceList(data) {
    this.devices = {};
    this.device_events = {};
};

util.inherits(DeviceList, eventEmitter);

var bindDeviceEvent = function bindDeviceEvent(device_id, event) {
    var self = this;
    this.devices[device_id].on(event, function() {
        triggerDeviceEvent.call(self, event, this, arguments);
    });
};

var triggerDeviceEvent = function triggerDeviceEvent(event, device, arguments) {
    for (var i in this.device_events[event]) {
        var callback = this.device_events[event][i];
        callback(device, arguments);
    }
};

DeviceList.prototype = {
    add: function add(device_id, device) {
        this.devices[device_id] = device;

        for (var event in this.device_events) {
            bindDeviceEvent.call(this, device_id, event);
        }
    },

    remove: function remove(device_id) {
        delete this.devices[device_id];
    },

    get: function get(device_id) {
        return this.devices[device_id];
    },

    getAll: function getAll() {
        return this.devices;
    },

    getAllIds: function getAllIds() {
        return Object.keys(this.devices);
    },

    getNamedDevice: function getNamedDevice(name) {
        return this.devices[config.device_ids[name]];
    },

    onDeviceEvent: function onDeviceEvent(event, callback) {
        if (!this.device_events[event]) {
            this.device_events[event] = [];
        }

        this.device_events[event].push(callback);

        for (var device_id in this.devices) {
            bindDeviceEvent.call(this, device_id, event);
        }
    }
};

module.exports = DeviceList;
