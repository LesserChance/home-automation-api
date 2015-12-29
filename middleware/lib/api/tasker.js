// App Modules
var user         = require("../../../devices/user");
var config       = require("../../../util/config");

// constants
var LOCATION     = require("../../../constants/location");

// Private vars
var api;

module.exports = {
    initialize: function initialize(server_api) {
        api = server_api;

        api.request_router.use('/tasker', function(req, res, next) {
            // Assert a user
            if (req.get('user-agent') === config.ryan_tasker_key) {
                req.user = user.host.getUser("ryan");
            } else if (req.get('user-agent') === config.meredith_tasker_key) {
                req.user = user.host.getUser("meredith");
            } else {
                return api.error(res, {}, 404, 'Invalid User Key', 'INVALIDUSERKEY');
            }

            // Assert valid body json
            try {
                req.data = JSON.parse(req.body.data);
            } catch (e) {
                return api.error(res, {}, 404, 'Invalid Json', 'JSONPARSEERROR');
            }

            next();
        });

        api.request_router
            .route('/tasker/event')
            .post(emitUserEvent.bind(this));

        api.request_router
            .route('/tasker/location')
            .post(handleUserLocation.bind(this));

        api.request_router
            .route('/tasker/gesture')
            .post(handleUserGesture.bind(this));

        api.request_router
            .route('/tasker/battery')
            .post(handleUserBattery.bind(this));

    }
};

var emitUserEvent = function emitUserEvent(req, res, next) {
    switch (req.data.event) {
        case "screen":
            switch (req.data.state) {
                case "off":
                    req.user.emitPhoneEvent(user.events.phone.screen_off.key, req.data);
                    break;
                case "on":
                    req.user.emitPhoneEvent(user.events.phone.screen_on.key, req.data);
                    break;
            }
            break;
    }

    api.success(res, {});
};

var handleUserLocation = function handleUserLocation(req, res, next) {
    switch (req.data.action) {
        case LOCATION.EVENT.ENTERED:
            req.user.setLocation(req.data.location);
            break;
        case LOCATION.EVENT.EXITED:
            req.user.setLocation(LOCATION.TRANSIT);
            break;
    }

    api.success(res, {});
};

var handleUserGesture = function handleUserGesture(req, res, next) {
    api.success(res, {});
};

var handleUserBattery = function handleUserBattery(req, res, next) {
    api.success(res, {});
};
