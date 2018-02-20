var rpio = require("rpio");
var _ = require("lodash");
var RunDetector = require('./RunDetector.js');
var EventEmitter = require('events').EventEmitter;
var util = require('util');

var POLLS_PER_PULSE = 10;

function PulseDetector(pinId) {
    _.bindAll(this);
    EventEmitter.call(this);
    
    this.pinId = pinId;
    console.log("Connecting to pin " + pinId + "...");
    rpio.open(pinId, rpio.INPUT, rpio.PULL_DOWN);

    this.pulses = 0;
    this.runDetector = new RunDetector(3);
    this.startPolling();
}

util.inherits(PulseDetector, EventEmitter);
module.exports = PulseDetector;

PulseDetector.prototype.startPolling = function() {
    this.pollingLoop = setInterval(_.bind(function() {
	var newState = rpio.read(this.pinId);
//	process.stdout.write(newState ? "_" : "X");
	this.runDetector.onState(newState);
    }, this), 1000/10/POLLS_PER_PULSE);

    this.runDetector.on("runStart", _.bind(function(runState) {
	if (!runState) {
	    this.onPulse();
	}
    }, this));
};

PulseDetector.prototype.onPulse = function() {
    this.pulses++;
    this.onMaybeDonePulsing();
};

PulseDetector.prototype.onMaybeDonePulsing = _.debounce(function() {
    this.onDonePulsing();
}, 1000/10*4);

PulseDetector.prototype.onDonePulsing = function() {
    this.emit("pulses", this.pulses);
    this.pulses = 0;
};

PulseDetector.prototype.close = function() {
    clearInterval(this.pollingLoop);
    this.pollingLoop = null;
    rpio.close(this.pinId);
};
