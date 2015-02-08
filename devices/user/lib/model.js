// External Modules
var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var PersonSchema   = new Schema({
    name: String,
    location: Number,
    phone_number: String,
    home_light_preference: String
});

module.exports = mongoose.model('Person', PersonSchema);