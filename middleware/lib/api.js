// External Modules
var express    = require('express');
var timeout    = require('connect-timeout');
var bodyParser = require('body-parser');

var envelope = function envelope(res, status_code, data, message, type) {
    var result = {
        meta: {
            code: status_code
        },
        data: data
    };

    if (message) {
        result.meta.message = message;
    }
    if (type) {
        result.meta.type = type;
    }

    res.status(status_code).json(result);
};


var self = module.exports = {
    request_router: express.Router(),

    init: function init(app) {
        // Properly handle any timeouts
        self.request_router.use(timeout('5s', function(req, res, next) {
            envelope(res, 503, {"timeout": "5000"}, 'Response timeout', 'ETIMEDOUT');
        }));

        // test route to make sure everything is working (accessed at GET http://localhost:8080/api)
        self.request_router.get('/', function(req, res) {
            self.success(res, {});
        });

        self.request_router.use(bodyParser.json());
        self.request_router.use(bodyParser.urlencoded({extended: true}));

        // Initialize routes
        require('./api/wemo').initialize(self);
        require('./api/hue').initialize(self);
        require('./api/twilio').initialize(self);
        require('./api/mediapc').initialize(self);
        require('./api/tasker').initialize(self);

        // Register routes
        app.use('/api', self.request_router);
    },

    success: function success(res, data) {
        envelope(res, 200, data);
    },

    error: function error(res, data, status_code, message, type) {
        if (typeof status_code === 'undefined') {
            status_code = 404;
        }
        envelope(res, status_code, data, message, type);
    }

}
