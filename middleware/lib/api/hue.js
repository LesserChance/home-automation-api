// App Modules
var hue = require("../../../devices/hue");

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

        api.request_router.param(":light_id", function (req, res, next, id) {
            var light = hue.host.getLight(id);

            if (light) {
                req.device = light;
                next();
            } else {
                api.error(res, {}, 404, 'Device Not Found', 'EINVALIDDEVICE');
            }
        });

        api.request_router.param(":light_group_id", function (req, res, next, id) {
            var light_group = hue.host.getLightGroup(id);

            if (light_group) {
                req.device = light_group;
                next();
            } else {
                api.error(res, {}, 404, 'Device Not Found', 'EINVALIDDEVICE');
            }
        });

        /*************************************
         * LIGHTS                            *
         *************************************/
        // Get
        api.request_router
            .route('/hue/lights/:light_id')
            .get(sendDeviceResponse);

        // On
        api.request_router
            .route('/hue/lights/:light_id/on')
            .post(performPromise(hue.light.prototype.setOn));

        // Off
        api.request_router
            .route('/hue/lights/:light_id/off')
            .post(performPromise(hue.light.prototype.setOff));

        // Flip
        api.request_router
            .route('/hue/lights/:light_id/flip')
            .post(performPromise(hue.light.prototype.flip));

        // Dim
        api.request_router
            .route('/hue/lights/:light_id/dim')
            .post(performPromise(hue.light.prototype.dim, "brightness"));

        /*************************************
         * LIGHT GROUPS                      *
         *************************************/
        // Get
        api.request_router
            .route('/hue/groups/:light_group_id')
            .get(sendDeviceResponse);

        // On
        api.request_router
            .route('/hue/groups/:light_group_id/on')
            .post(performPromise(hue.light_group.prototype.setOn));

        // Off
        api.request_router
            .route('/hue/groups/:light_group_id/off')
            .post(performPromise(hue.light_group.prototype.setOff));

        // Flip
        api.request_router
            .route('/hue/groups/:light_group_id/flip')
            .post(performPromise(hue.light_group.prototype.flip));

        // Dim
        api.request_router
            .route('/hue/groups/:light_group_id/dim')
            .post(performPromise(hue.light_group.prototype.dim, "brightness"));

//        /*************************************
//         * LIGHT SCENES                      *
//         *************************************/
//        // Get
//        api.request_router
//            .route('/hue/scenes/:light_scene_id')
//            .get(sendDeviceResponse);
//
//        // Create
//        api.request_router
//            .route('/hue/scenes')
//            .post(performPromise(hue.light_scene.prototype.create));
//
//        // Update
//        api.request_router
//            .route('/hue/scenes/:light_scene_id')
//            .put(performPromise(hue.light_scene.prototype.update));
//
//        // On
//        api.request_router
//            .route('/hue/scenes/:light_scene_id/on')
//            .post(performPromise(hue.light_scene.prototype.setOn));
   }
};

var performPromise = function performPromise(method) {
    var call_args = Array.prototype.slice.call(arguments, 1);
    return function(req, res, next) {
        var send_args = [];
        for (var i = 0, iEnd = call_args.length; i < iEnd; i++) {
            send_args.push(req.body[call_args[i]]);
        }

        method.apply(req.device, send_args)
            .then(function() {
                sendDeviceResponse(req, res, next);
            })
            .done();
    }
};
