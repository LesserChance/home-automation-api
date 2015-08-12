// External Modules
var util         = require('util');
var twilio       = require('twilio');
var http         = require('http');

// App Modules
var DeviceList   = require("../../../util/device_list");
var config       = require("../../../util/config");
var eventEmitter = require("../../../util/event_emitter");

// Local Modules
var TwilioPhone  = require('./phone');
var TwilioEvents = require("./events");

// Private vars
var api;

var TwilioHost = function () {
    api = twilio(
        config.twilio_sid,
        config.twilio_token
    );
};
util.inherits(TwilioHost, eventEmitter);

/*****************************************
 * Public Methods                        *
 *****************************************/
TwilioHost.prototype.init = function init() {
    //create a phone
    this.phone_list = new DeviceList();
    this.phone_list.add(config.device_ids.twilio_phone, new TwilioPhone({
        id: config.device_ids.twilio_phone
    }));
};

TwilioHost.prototype.getPhone = function getPhone(device_id) {
    //only one phone number for now
    return this.phone_list.get(device_id);
};

TwilioHost.prototype.getApi = function getApi() {
    return api;
};


/*****************************************
 * Private Methods                       *
 *****************************************/


module.exports = new TwilioHost();