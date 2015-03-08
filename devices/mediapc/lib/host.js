// External Modules
var util         = require('util');
var eventEmitter = require('events').EventEmitter;

// App Modules
var config       = require("../../../util/config.js");

// Private vars

var MediaPcHost = function () {

};
util.inherits(MediaPcHost, eventEmitter);

/*****************************************
 * Public Methods                        *
 *****************************************/
MediaPcHost.prototype.init = function init() {

};

/*****************************************
 * Private Methods                       *
 *****************************************/


module.exports = new MediaPcHost();