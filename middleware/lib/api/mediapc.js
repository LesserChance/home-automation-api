// App Modules
var hue          = require("../../../devices/hue");

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
    var living_room_lights = hue.host.getLightGroup(0);

    switch (req.body.action) {
        case "ha_script_start":
            // Script Start
            living_room_lights.setScene("hascriptstart");
            break;
        case "ha_mte_intro":
            // Movie Theater Intro
            living_room_lights.setScene("hamteintro");
            break;
        case "ha_trailer_start":
            // Movie Trailer
            living_room_lights.setScene("hatrailerstart");
            break;
        case "ha_movie":
            // Movie
            living_room_lights.setScene("hamovie");
            break;
    }

    api.success(res, {});
};