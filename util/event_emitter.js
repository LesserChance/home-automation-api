// External Modules
var eventEmitter = require('events').EventEmitter;
var util         = require('util');

/**
 * Interface
 */
function Emitter() {

}
util.inherits(Emitter, eventEmitter);

/**
 * Emit multiple events
 * @param events
 * @param args
 */
Emitter.prototype.emits = function emits(events, args) {
    for (var i = 0, iEnd = events.length; i < iEnd; i++) {
        this.emit(events[i], args);
    }
};

module.exports = Emitter;
