var self = module.exports = function(multiple_events, args) {
    for (var i = 0, iEnd = multiple_events.length; i < iEnd; i++) {
        this.emit(multiple_events[i], args);
    }
};