var PulseDetector = require('./PulseDetector');
var ButtonDetector = require('./ButtonDetector');
var _ = require('lodash');
var EventEmitter = require('events').EventEmitter;
var util = require('util');

function Dialer(pulsePin, hookPin, dialExcursionPin) {
    _.bindAll(this);
    EventEmitter.call(this);

    //this.waitForDialingDone = _.debounce(this.dialingDone, 5*1000);

    this.pulsePin = pulsePin;
    this.hookPin = hookPin;
    this.dialExcursionPin = dialExcursionPin;

    this.isOnHook = true;
    this.dialExcursion = false;
    this.digitsDialed = "";
    this.inCall = false;

    this.hookDetector = new ButtonDetector(hookPin);
    this.hookDetector.on("buttonState", this.onHookDetected);
    
    this.dialExcursionDetector = new ButtonDetector(dialExcursionPin);
    this.dialExcursionDetector.on("buttonState", this.onDialExcursionDetected);
    
    this.pulseDetector = new PulseDetector(pulsePin);
    this.pulseDetector.on("pulses", this.onPulsesDetected);

    this.dumpState();
}

util.inherits(Dialer, EventEmitter);
module.exports = Dialer;

Dialer.prototype.onHookDetected = function(buttonState) {
    var isOnHook = !buttonState;
    if (isOnHook !== this.isOnHook) {
	this.isOnHook = isOnHook;
	console.log(this.isOnHook ? "on hook" : "off hook");
	
	if (this.isOnHook){
	    if (this.digitsDialed.length) {
		this.digitsDialed = "";
	    } else {
		this.hangUp();
	    }
	}
    }
    this.dumpState();
};

Dialer.prototype.onDialExcursionDetected = function(buttonState) {
    if (buttonState !== this.dialExcursion) {
	this.dialExcursion = buttonState;
//	console.log(this.dialExcursion ? "dial excursion" : "dial at rest position");
//	if (this.dialExcursion) {
//	    this.waitForDialingDone.cancel();
//	}
    }
    this.dumpState();
};

Dialer.prototype.onPulsesDetected = function(pulses) {
    if (!this.isOnHook && !this.inCall) {
	if (pulses > 9) {
	    pulses = 0;
	}
	this.digitsDialed += pulses;
	console.log("digit "+pulses);
	this.waitForDialingDone();
    }
    this.dumpState();
};

Dialer.prototype.dialingDone = function() {
    if (!this.isOnHook && !this.inCall && !this.dialExcursion && this.digitsDialed.length >= 5) {
	this.call(this.digitsDialed);
	this.digitsDialed = "";
    }
    this.dumpState();
};

Dialer.prototype.waitForDialingDone = _.debounce(function() {
    this.dialingDone();
}, 5 * 1000);

Dialer.prototype.call = function(dialString) {
    console.log("Calling "+dialString);
    this.inCall = true;
};
	
Dialer.prototype.hangUp = function() {
    this.inCall = false;
    console.log("hanging up");
    this.dumpState();
};

Dialer.prototype.dumpState = function() {
    var stateMessage = [
	this.isOnHook ? "on hook" : "off hook",
	this.dialExcursion ? "dial excursion" : "dial in rest position",
	this.inCall ? "in call" : "not in call",
	"digits dialed: "+this.digitsDialed
    ].join(", ");
    console.log("Dialer state = "+stateMessage);
};

Dialer.prototype.close = function() {
    this.pulseDetector.close();
    this.hookDetector.close();
    this.dialExcursionDetector.close();
};
