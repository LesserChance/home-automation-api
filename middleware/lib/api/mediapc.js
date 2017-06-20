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
        case "ha_paused":
            // Paused
            living_room_lights.setScene("hapaused");
            handled = true;
            break;
        case "ha_trivia_intro":
            handled = true;
            break;
        case "ha_trivia_start":
            handled = true;
            break;
        case "ha_trivia_outro":
            handled = true;
            break;
        case "ha_cav_intro":
            handled = true;
            break;
        case "ha_cav_outro":
            handled = true;
            break;
        case "ha_fpv_intro":
            handled = true;
            break;
        case "ha_3d_intro":
            handled = true;
            break;
        case "ha_3d_trailer":
            handled = true;
            break;
        case "ha_3d_outro":
            handled = true;
            break;
        case "ha_mpaa_rating":
            handled = true;
            break;
        case "ha_countdown_video":
            handled = true;
            break;
        case "ha_audio_format":
            handled = true;
            break;
        case "ha_fpv_outro":
            handled = true;
            break;
        case "ha_mte_outro":
            handled = true;
            break;
        case "ha_intermission":
            handled = true;
            break;
        case "ha_script_end":
            living_room_lights.setScene("ha_script_end");
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