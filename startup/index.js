// App Modules
var hue          = require("../devices/hue");
var wemo         = require("../devices/wemo");
var twilio       = require("../devices/twilio-phone");
var rule         = require("../devices/rule");
var config       = require("../util/config");

var startListeners = function startListeners() {
    // Assure all devices are loaded, then start the listeners
    var living_room_wemo = wemo.host.getDevice("living_room");
    var phone = twilio.host.getPhone(config.device_ids.twilio_phone);

    if (!living_room_wemo || !phone || !rule.host.isReady()) {
        setTimeout(startListeners, 2000);
        return;
    }

    rule.host.startListeners();

    console.debug("Listeners Ready");
    console.debug("---------------------------------------");
};

module.exports =  {
    initialize: function initialize(app) {
        hue.host.on(hue.events.load.key, function() {
            startListeners();
        });
    }
};