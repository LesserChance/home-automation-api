// App Modules
var user         = require("../../../devices/user");

// constants
var LOCATION     = require("../../../constants/location");
var IFTTT_EVENT  = require("../../../constants/ifttt_event");

module.exports = {
    initialize: function initialize(server_api) {
//        api = server_api;
//
//        api.request_router
//            .route('/ifttt/test')
//            .post(function(req, res, next) {
//                api.success(res, {
//                    "test": true
//                });
//            })
//            .get(function(req, res, next) {
//                api.success(res, {
//                    "test": true
//                });
//            });
    },

    handleUserLocationChange: function handleUserLocationChange(data) {
        var person = user.host.getUser(data.user);

        switch (data.action) {
            case IFTTT_EVENT.ENTERED:
                person.setLocation(data.location);
                break;
            case IFTTT_EVENT.EXITED:
                person.setLocation(LOCATION.TRANSIT);
                break;
        }
    },

    handleEvent: function handleEvent(data) {
        switch (data.event_type) {
            case IFTTT_EVENT.LOCATION:
                // A Users location has changed
                this.handleUserLocationChange(data);
                break;
        }
    }
};