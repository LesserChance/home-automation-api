// External Modules
var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var PersonSchema   = new Schema({
    name: String,
    location: Number
});

module.exports = mongoose.model('Person', PersonSchema);