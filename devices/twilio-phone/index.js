// Local Modules
var host = require("./lib/host.js");
var phone = require("./lib/phone.js");

host.init();

module.exports = exports = {
    host: host,
    phone: phone
};
