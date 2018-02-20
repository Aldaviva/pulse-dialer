var rpio = require("rpio");
var _ = require("lodash");
var RunDetector = require('./RunDetector.js');
var EventEmitter = require('events').EventEmitter;
var util = require('util');

function ButtonDetector(pinId) {
    _.bindAll(this);
    EventEmitter.call(this);
    
    this.pinId = pinId;
    console.log("Connecting to pin " + pinId + "...");
    rpio.open(pinId, rpio.INPUT, rpio.PULL_DOWN);

    this.state = null;
    this.startPolling();
}
util.inherits(ButtonDetector, EventEmitter);
module.exports = ButtonDetector;

ButtonDetector.prototype.startPolling = function() {
    rpio.poll(this.pinId, /*_.debounce(*/this.onState/*, 1000/10, { leading: true, trailing: true })*/);
};

ButtonDetector.prototype.onState = function() {
    var state = rpio.read(this.pinId);
//    console.log("pin "+this.pinId+": "+state);
    if (state !== this.state) {
	this.state = state;
	this.emit("buttonState", !!state);
    }
};

ButtonDetector.prototype.close = function() {
    rpio.close(this.pinId);
};
