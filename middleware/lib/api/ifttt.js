// Private vars
var api;

module.exports = {
    initialize: function initialize(server_api) {
        api = server_api;

        api.request_router
            .route('/ifttt/test')
            .post(function(req, res, next) {
                api.success(res, {
                    "test": true
                });
            })
            .get(function(req, res, next) {
                api.success(res, {
                    "test": true
                });
            });

    }
};