// App Modules
var wemo = require("../../../devices/wemo");

// Private vars
var api;

var sendDeviceResponse = function sendDeviceResponse(req, res) {
    if (req.timedout) return;

    api.success(res, {
        device: req.device.toJson()
    });
};

module.exports = {
    initialize: function initialize(server_api) {
        api = server_api;

        api.request_router.param(":device_name", function (req, res, next, name) {
            var device = wemo.host.getDevice(name);

            if (device) {
                req.device = device;
                next();
            } else {
                api.error(res, {}, 404, 'Device Not Found', 'EINVALIDDEVICE');
            }
        });

        // Get
        api.request_router
            .route('/wemo/:device_name')
            .get(sendDeviceResponse);

        // On
        api.request_router
            .route('/wemo/:device_name/on')
            .post(performPromise(wemo.device.prototype.setOn));

        // Off
        api.request_router
            .route('/wemo/:device_name/off')
            .post(performPromise(wemo.device.prototype.setOff));

        // Flip
        api.request_router
            .route('/wemo/:device_name/flip')
            .post(performPromise(wemo.device.prototype.flip));
    }
};

var performPromise = function performPromise(method) {
    return function(req, res, next) {
        method.apply(req.device)
            .then(function() {
                sendDeviceResponse(req, res, next);
            })
            .done();
    }
};