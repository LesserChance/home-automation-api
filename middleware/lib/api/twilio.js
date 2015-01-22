// External Modules
var twilio       = require('twilio');

// App Modules
var twilio_phone = require("../../../devices/twilio-phone");

// Private vars
var api;

module.exports = {
    initialize: function initialize(server_api) {
        api = server_api;

        api.request_router
            .route('/twilio/sms')
            .post(routeTwilioSmsRequest.bind(this));

        api.request_router
            .route('/twilio/call')
            .post(routeTwilioCallRequest.bind(this));

    }
};

var routeTwilioSmsRequest = function routeTwilioSmsRequest(req, res, next) {
    var phone = twilio_phone.host.getPhone(req.body.To);

    if (!phone) {
        // We dont know about this phone number
        var resp = new twilio.TwimlResponse();
        res.writeHead(404, {
            'Content-Type':'text/xml'
        });
        res.end(resp.toString());
        return;
    }

    phone.handleSmsRequest(req, res, next);
};

var routeTwilioCallRequest = function routeTwilioCallRequest(req, res, next) {
    var phone = twilio_phone.host.getPhone(req.body.To);

    if (!phone) {
        // We dont know about this phone number
        var resp = new twilio.TwimlResponse();
        res.writeHead(404, {
            'Content-Type':'text/xml'
        });
        res.end(resp.toString());
        return;
    }

    phone.handleCallRequest(req, res, next);
};