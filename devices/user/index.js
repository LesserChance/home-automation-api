// Local Modules
var host = require("./lib/host.js");
var user = require("./lib/user.js");

host.init();

module.exports = exports = {
    host: host,
    user: user
};