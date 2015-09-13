// External Modules
var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

require('mongoose-function')(mongoose);

var RuleSchema   = new Schema({
    enabled: Boolean,
    name: String,
    description: String,
    predicate_device_type: String,
    predicate_device_id: String,
    predicate_device_event: String,
    callback: Function
});

module.exports = mongoose.model('Rule', RuleSchema);