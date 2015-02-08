define(['jquery'], function($) {
    var init = function init() {
        $("#api_1").on("click", on);
        $("#api_2").on("click", off);
        $("#api_3").on("click", flip);
        $("#api_4").on("click", get);

        $(".api_light_flip").on("click", lightflip);
        $(".api_light_dim").on("change", lightdim);
        $(".api_light_color").on("input", lightcolor);

        $(".api_light_group_flip").on("click", lightgroupflip);
        $(".api_light_group_dim").on("change", lightgroupdim);
        $(".api_light_group_color").on("input", lightgroupcolor);

        $(".api_get_scenes").on("click", getscenes);
        $(".api_save_scene").on("click", savescene);
        $(".api_set_scene").on("click", setscene);
    };

    var get = function on() {
        $.ajax({
                "url": "/api/wemos/living_room",
                "type": "GET",
            })
            .done(function(data) {
                console.log(data);
            })
            .fail(function(jqXHR, status, err) {
                console.log(err);
            });
    }

    var on = function on() {
        $.ajax({
                "url": "/api/wemos/living_room/on",
                "type": "POST",
            })
            .done(function(data) {
                console.log(data);
            })
            .fail(function(jqXHR, status, err) {
                console.log(err);
            });
    }

    var off = function off() {
        $.ajax({
                "url": "/api/wemos/living_room/off",
                "type": "POST",
            })
            .done(function(data) {
                console.log(data);
            })
            .fail(function(jqXHR, status, err) {
                console.log(err);
            });
    }

    var flip = function flip() {
        $.ajax({
                "url": "/api/wemos/living_room/flip",
                "type": "POST",
            })
            .done(function(data) {
                console.log(data);
            })
            .fail(function(jqXHR, status, err) {
                console.log(err);
            });
    }

    var lightflip = function lightflip(e) {
        var light_id = $(e.target).data("light-id");
        $.ajax({
            "url": "/api/hue/lights/" + light_id + "/flip",
            "type": "POST"
        })
            .done(function(results) {
                console.log(results);
                $(".light_" + light_id).find(".api_light_flip").html(results.data.device.state.on ? "O" : "X");
            })
            .fail(function(jqXHR, status, err) {
                console.log(err);
            });
    }

    var lightdim = function lightdim(e) {
        var light_id = $(e.target).data("light-id");
        var val = $(e.target).val();

        $.ajax({
            "url": "/api/hue/lights/" + light_id + "/dim",
            "type": "POST",
            "data": {
                "brightness": parseInt(val, 10)
            }
        })
            .done(function(results) {
                console.log(results);
            })
            .fail(function(jqXHR, status, err) {
                console.log(err);
            });
    }

    var lightcolor = function lightcolor(e) {
        var light_id = $(e.target).data("light-id");
        var val = $(e.target).val();

        $.ajax({
            "url": "/api/hue/lights/" + light_id + "/color",
            "type": "POST",
            "data": {
                "color": val
            }
        })
            .done(function(results) {
                console.log(results);
            })
            .fail(function(jqXHR, status, err) {
                console.log(err);
            });
    }

    var lightgroupflip = function lightgroupflip(e) {
        var light_group_id = $(e.target).data("light-group-id");
        $.ajax({
            "url": "/api/hue/groups/" + light_group_id + "/flip",
            "type": "POST"
        })
            .done(function(results) {
                console.log(results);
                $(".light_group_" + light_group_id).find(".api_light_group_flip").html(results.data.device.state === 1 ? "O" : "X");
            })
            .fail(function(jqXHR, status, err) {
                console.log(err);
            });
    }

    var lightgroupdim = function lightgroupdim(e) {
        var light_group_id = $(e.target).data("light-group-id");
        var val = $(e.target).val();

        $.ajax({
            "url": "/api/hue/groups/" + light_group_id + "/dim",
            "type": "POST",
            "data": {
                "brightness": parseInt(val, 10)
            }
        })
            .done(function(results) {
                console.log(results);
            })
            .fail(function(jqXHR, status, err) {
                console.log(err);
            });
    }

    var lightgroupcolor = function lightgroupcolor(e) {
        var light_group_id = $(e.target).data("light-group-id");
        var val = $(e.target).val();

        $.ajax({
            "url": "/api/hue/groups/" + light_group_id + "/color",
            "type": "POST",
            "data": {
                "color": val
            }
        })
            .done(function(results) {
                console.log(results);
            })
            .fail(function(jqXHR, status, err) {
                console.log(err);
            });
    }

    var getscenes = function getscenes() {
        $.ajax({
            "url": "/api/hue/scenes",
            "type": "GET"
        })
            .done(function(data) {
                console.log(data);
            })
            .fail(function(jqXHR, status, err) {
                console.log(err);
            });
    }

    var savescene = function savescene() {
        $.ajax({
            "url": "/api/hue/scenes",
            "type": "POST",
            "data": {
                "name": $(".api_scene_name").val()
            }
        })
            .done(function(data) {
                console.log(data);
            })
            .fail(function(jqXHR, status, err) {
                console.log(err);
            });
    }

    var setscene = function setscene() {
        $.ajax({
            "url": "/api/hue/scenes/" + $(".api_scene_name").val() + "/on",
            "type": "POST"
        })
            .done(function(data) {
                console.log(data);
            })
            .fail(function(jqXHR, status, err) {
                console.log(err);
            });
    }

    return {
        init: init
    };

});
