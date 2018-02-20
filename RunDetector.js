var EventEmitter = require('events').EventEmitter;
var util = require('util');
var _ = require('lodash');

function RunDetector(minRunLength) {
    _.bindAll(this);
    EventEmitter.call(this);

    this.minRunLength = minRunLength;
    this.runCounter = 0;
    this.runState = null;
}

util.inherits(RunDetector, EventEmitter);
module.exports = RunDetector;

RunDetector.prototype.onState = function(state) {
    if (state !== this.runState) {
	if (this.runCounter >= 3) {
	    this.emit("runEnd", this.runState);
	}
	
	this.runCounter = 0;
	this.runState = state;
    }

    if (++this.runCounter === this.minRunLength) {
	this.emit("runStart", state);
    }
}
