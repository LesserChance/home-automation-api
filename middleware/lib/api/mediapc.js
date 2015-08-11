// App Modules
var hue          = require("../../../devices/hue");
var listener     = require("../../../util/listener");

// Private vars
var api;

module.exports = {
    initialize: function initialize(server_api) {
        api = server_api;

        api.request_router
            .route('/mediapc/cinemaexperience')
            .post(routeCinemaExperienceRequest.bind(this));
    }
};

var routeCinemaExperienceRequest = function routeCinemaExperienceRequest(req, res, next) {
    var living_room_lights = hue.host.getLightGroup(0),
        handled = false;

    //todo: the mediapc should be emitting these events and a listener should respond
    switch (req.body.action) {
        case "ha_script_start":
            // Script Start
            living_room_lights.setScene("hascriptstart");
            handled = true;
            break;
        case "ha_mte_intro":
            // Movie Theater Intro
            living_room_lights.setScene("hamteintro");
            handled = true;
            break;
        case "ha_trailer_start":
            // Movie Trailer
            living_room_lights.setScene("hatrailerstart");
            handled = true;
            break;
        case "ha_movie":
            // Movie
            living_room_lights.setScene("hamovie");
            handled = true;
            break;
    }

    listener.log(
        listener.success("Media Center triggered light change", {
            "action": req.body.action,
            "handled": handled
        })
    );

    api.success(res, {});
};