// External Modules
var util         = require('util');

// App Modules
var config       = require("../../../util/config");
var eventEmitter = require("../../../util/event_emitter");

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