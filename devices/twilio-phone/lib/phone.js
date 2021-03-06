// External Modules
var twilio       = require('twilio');
var util         = require('util');
var Q            = require('q');

// App Modules
var eventEmitter = require("../../../util/event_emitter");

// Local Modules
var TwilioEvents = require("./events");

var TwilioPhone = function (data) {
    this.id = data.id;
    this.api = require("./host").getApi();

};
util.inherits(TwilioPhone, eventEmitter);

/*****************************************
 * Public Methods                        *
 *****************************************/
TwilioPhone.prototype.sendSMS = function sendSMS(number, message) {
    var deferred = Q.defer();

    this.api.messages.create({
        body: message,
        to: number,
        from: this.id
    }, function(err, message) {
        this.emit(TwilioEvents.sms_sent.key, message);
        deferred.resolve();
    }.bind(this));

    return deferred.promise;
};


/*****************************************
 * Private Methods                       *
 *****************************************/
TwilioPhone.prototype.handleSmsRequest = function handleSmsRequest(req, res, next) {
    // Create a TwiML response
    var resp = new twilio.TwimlResponse();

    this.sendSMS(req.body.From, 'SMS Message Received')
        .then(function() {
            //Render the TwiML document using "toString"
            res.writeHead(200, {
                'Content-Type':'text/xml'
            });
            res.end(resp.toString());
        });
};

TwilioPhone.prototype.handleCallRequest = function handleCallRequest(req, res, next) {
    // Create a TwiML response
    var resp = new twilio.TwimlResponse();

    //auto reply
    resp.say({"voice":"woman"}, 'Stop Calling Me');

    //Render the TwiML document using "toString"
    res.writeHead(200, {
        'Content-Type':'text/xml'
    });
    res.end(resp.toString());
};

module.exports = TwilioPhone;