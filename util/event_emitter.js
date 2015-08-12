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
 * on
 * @param event
 * @param listener
 */
Emitter.prototype.on = function on(event, listener) {
    eventEmitter.prototype.on.call(this, event.key, listener);
};

/**
 * once
 * @param event
 * @param listener
 */
Emitter.prototype.once = function once(event, listener) {
    eventEmitter.prototype.once.call(this, event.key, listener);
};

/**
 * removeListener
 * @param event
 * @param listener
 */
Emitter.prototype.removeListener = function removeListener(event, listener) {
    eventEmitter.prototype.removeListener.call(this, event.key, listener);
};

/**
 * removeAllListeners
 * @param event
 */
Emitter.prototype.removeAllListeners = function removeAllListeners(event) {
    eventEmitter.prototype.removeAllListeners.call(this, event.key);
};

/**
 * Emit a single event
 * @param events
 * @param args
 */
Emitter.prototype.emit = function emit(event, args) {
    if (typeof args === "undefined") {
        args = {};
    }
    args.event = event;

    eventEmitter.prototype.emit.call(this, event.key, args);
};

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
