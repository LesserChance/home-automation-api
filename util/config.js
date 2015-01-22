var config = {
    // Server Config
    ipaddress : "192.168.0.100",
    port      : 80,

    // Public Web Login
    username  : "user",
    password  : "password",

    // Hue API Login
    hue_username    : "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",

    // Twilio API Access
    twilio_username : "user",
    twilio_password : "password",

    // Twilio API Login
    twilio_sid      : 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    twilio_token    : "cccccccccccccccccccccccccccccccc",

    // IFTTT webhook Login
    ifttt_username  : "user",
    ifttt_password  : "password",

    // Device Ids
    device_ids: {
        living_room  : "xxxxxxxxxxxxxxxxxxx",  // Living Room Wemo
        hue_bridge   : "yyyyyyyyyyyyyyyy",     // Living Room Hue Bridge
        twilio_phone : "+11111111111"          // Twilio Phone Number
    }
};

var use_config = "dev";
if (process.argv.length > 2) {
    use_config = process.argv[process.argv.length - 1];
}

if (use_config == "dev") {
    config.docroot = "/dev/htdocs/";
} else {
    config.docroot = "/prod/htdocs/";
}

module.exports = config;
