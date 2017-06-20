// External Modules
var util          = require('util');

// App Modules
var DeviceList    = require("../../../util/device_list");
var config        = require("../../../util/config");
var eventEmitter  = require("../../../util/event_emitter");

// Local Modules
var Rule          = require("./rule");
var Model         = require('./model');

var RuleHost = function () {
    this.ready = false;
    this.device_list = new DeviceList();

    // create the listeners
    this.createRules();
//    this.storeListeners();
};
util.inherits(RuleHost, eventEmitter);

RuleHost.prototype.startListeners = function startListeners() {
    // start the listeners
    var rules = this.device_list.getAll();

    for (var key in rules) {
        rules[key].start();
    }
};

RuleHost.prototype.isReady = function isReady() {
    return this.ready;
};

RuleHost.prototype.storeListeners = function storeListeners() {
    Model.find(function(err, listeners) {
        if (!err) {
            for (var i = 0, iEnd = listeners.length; i < iEnd; i++) {
                this.device_list.add(listeners[i].name, new Rule(listeners[i]));
            }
        }
        this.ready = true;
    }.bind(this));
};

RuleHost.prototype.getRule = function getRule(rule_name) {
    return this.device_list.get(rule_name);
};

RuleHost.prototype.createRules = function createRules() {
    console.debug("Creating Rules...");
    Model.remove({}, function(){
        this.newModels()
    }.bind(this));
};


/**
 *
 */
RuleHost.prototype.newModels = function newModels() {
    var hue          = require("../../../devices/hue");
    var wemo         = require("../../../devices/wemo");
    var twilio       = require("../../../devices/twilio-phone");
    var user         = require("../../../devices/user");
    var steam        = require("../../../devices/steam");

    var models = [
        new Model({
            enabled: true,
            name: "wemo.handle_on",
            description: "Living Room Wemo turned on all lights",
            predicate_device_type: "wemo_switch",
            predicate_device_id: "living_room",
            predicate_device_event: wemo.events.on.key,
            callback: function(data) {
                var hue = require(this.getRequirePath("devices/hue"));
                var rule = require(this.getRequirePath("devices/rule"));
                var living_room_lights = hue.host.getLightGroup(0);

                // dont trigger the wemo response when we turn it on
                rule.host.getRule("living_room_lights.handle_change").disableFor(5000);
                living_room_lights.setOn();
            }
        }),

        new Model({
            enabled: true,
            name: "wemo.handle_off",
            description: "Living Room Wemo turned off all lights",
            predicate_device_type: "wemo_switch",
            predicate_device_id: "living_room",
            predicate_device_event: wemo.events.off.key,
            callback: function(data) {
                var hue = require(this.getRequirePath("devices/hue"));
                var rule = require(this.getRequirePath("devices/rule"));
                var living_room_lights = hue.host.getLightGroup(0);

                if (living_room_lights.state.on !== 0) {
                    // dont trigger the wemo response when we turn it off
                    rule.host.getRule("living_room_lights.handle_change").disableFor(5000);

                    living_room_lights.setOff();
                }
            }
        }),

        new Model({
            enabled: true,
            name: "living_room_lights.handle_change",
            description: "Living room lights have changes, update the wemo state",
            predicate_device_type: "hue_light_group",
            predicate_device_id: "0",
            predicate_device_event: hue.events.state_change.key,
            callback: function(data) {
                var LIGHT_STATE  = require(this.getRequirePath("constants/light_state"));
                var hue = require(this.getRequirePath("devices/hue"));
                var wemo = require(this.getRequirePath("devices/wemo"));
                var living_room_lights = hue.host.getLightGroup(0);
                var living_room_wemo = wemo.host.getDevice("living_room");

                if (!data) {
                    throw {
                        "description": "invalid data",
                        "data": data
                    };
                } else if (data.previous_state == LIGHT_STATE.GROUP_OFF) {
                    // Whenever the living room lights are changed from off, turn on the wemo
                    living_room_wemo.reflectState(true);
                } else if (living_room_lights.state.on == LIGHT_STATE.GROUP_OFF) {
                    // Whenever the living room lights are changed to off, turn off the wemo
                    living_room_wemo.reflectState(false);
                }
            }
        }),

        new Model({
            enabled: true,
            name: "users.ryan_arrived_home",
            description: "Ryan arrived home, set permanent scene",
            predicate_device_type: "user",
            predicate_device_id: "ryan",
            predicate_device_event: user.events.arrived.key,
            callback: function(data) {
                var user = require(this.getRequirePath("devices/user"));
                var hue = require(this.getRequirePath("devices/hue"));
                var ryan = user.host.getUser("ryan");
                var living_room_lights = hue.host.getLightGroup(0);
                var user_scene = ryan.get("home_light_preference");

                living_room_lights.setScene(user_scene);
            }
        }),

        new Model({
            enabled: true,
            name: "users.meredith_arrived_home",
            description: "Meredith arrived home, set permanent scene",
            predicate_device_type: "user",
            predicate_device_id: "meredith",
            predicate_device_event: user.events.arrived.key,
            callback: function(data) {
                var user = require(this.getRequirePath("devices/user"));
                var hue = require(this.getRequirePath("devices/hue"));
                var meredith = user.host.getUser("meredith");
                var living_room_lights = hue.host.getLightGroup(0);
                var user_scene = meredith.get("home_light_preference");

                living_room_lights.setScene(user_scene);
            }
        }),

        new Model({
            enabled: true,
            name: "steam.friend_signed_on",
            description: "Friend signed onto steam, signaled lights and text",
            predicate_device_type: "steam",
            predicate_device_id: "",
            predicate_device_event: steam.events.friend_signed_on.key,
            callback: function(data) {
                var LOCATION = require(this.getRequirePath("constants/location"));
                var LIGHT_STATE  = require(this.getRequirePath("constants/light_state"));
                var config = require(this.getRequirePath("util/config"));
                var user = require(this.getRequirePath("devices/user"));
                var hue = require(this.getRequirePath("devices/hue"));
                var twilio = require(this.getRequirePath("devices/twilio-phone"));

                var Listener = require(this.getRequirePath("util/listener"));
                var ryan = user.host.getUser("ryan");
                var living_room_lights = hue.host.getLightGroup(0);
                var phone = twilio.host.getPhone(config.device_ids.twilio_phone);

                if (config.steam_users_to_notify.indexOf(data.friend.personaname) === -1) {
                    return Listener.ignored();
                }

                if (ryan.get("location") === LOCATION.HOME && living_room_lights.state.on !== LIGHT_STATE.GROUP_OFF) {
                    //flash the lights blue
//                    living_room_lights.color("#0000FF", 5000);

                    //text ryan
//                    phone.sendSMS(ryan.get("phone_number"), data.friend.personaname + " signed on");
                }
            }
        })
    ];

    for (var i = 0, iEnd = models.length; i < iEnd; i++) {
        models[i].save(function (err) {
            if (err) return;
        });
    }

    setTimeout(this.storeListeners.bind(this), 2000);

};

module.exports = function () {
    return new RuleHost();
};