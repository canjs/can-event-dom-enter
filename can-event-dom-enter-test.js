'use strict';

var unit = require('steal-qunit');
var domEvents = require('can-dom-events');
var oldEvents = require('can-util/dom/events/events');
var definition = require('./can-event-dom-enter');
var compat = require('./compat');

function makeEnterEvent() {
	try {
		// IE doesn't support this syntax
		return new window.KeyboardEvent("keyup", {key: "Enter"});
	} catch (e) {
		var event = document.createEvent("KeyboardEvent");
		// See https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/initKeyboardEvent
		event.initKeyboardEvent("keyup", true, false, document.parentWindow, "Enter", 16, "", false, "en-US");
		return event;
	}
}

function pressKey (target, keyCode) {
	var keyupEvent = {
		type: 'keyup',
		keyCode: keyCode
	};
	domEvents.dispatch(target, keyupEvent);
}

function pressEnter(target) {
	pressKey(target, 13);
}

var supportsKeyboardEvents = (function () {
	if (typeof KeyboardEvent === 'undefined') {
		return false;
	}
	try {
		var eventType = 'keyup';
		var isSupported = false;
		var target = document.createElement('input');
		var handler = function (event) {
			if (event.key === 'Enter') {
				isSupported = true;
			}
		};
		target.addEventListener(eventType, handler);
		target.dispatch(makeEnterEvent());
		target.removeEventListener(eventType, handler);
		return isSupported;
	} catch (error) {
		return false;
	}
});

// Fix oldEvent calls to match new syntax
function newifyOldEvents (oldEvents) {
	return {
		addEventListener: function (target) {
			var args = Array.prototype.slice.call(arguments, 1);
			return oldEvents.addEventListener.apply(target, args);
		},
		removeEventListener: function (target) {
			var args = Array.prototype.slice.call(arguments, 1);
			return oldEvents.removeEventListener.apply(target, args);
		},
		dispatch: function (target) {
			var args = Array.prototype.slice.call(arguments, 1);
			return oldEvents.dispatch.apply(target, args);
		},
	};
}

var compatWithNew = {
	name: 'compat with can-dom-events',
	domEvents: domEvents,
	setup: function () {
		this.removeEvent = compat(domEvents);
	},
	teardown: function () {
		this.removeEvent();
	}
};

var compatWithOld = {
	name: 'compat with can-util/dom/events',
	domEvents: newifyOldEvents(oldEvents),
	setup: function () {
		this.removeEvent = compat(oldEvents);
	},
	teardown: function () {
		this.removeEvent();
	}
};

var rawNewDomEvents = {
	name: 'plain with can-dom-events',
	domEvents: domEvents,
	setup: function () {
		this.removeEvent = domEvents.addEvent(definition);
	},
	teardown: function () {
		this.removeEvent();
	}
};

var suites = [
	compatWithOld,
	compatWithNew,
	rawNewDomEvents
];

function runTests (mod) {
	unit.module(mod.name, {
		setup: mod.setup,
		teardown: mod.teardown
	});

	var domEvents = mod.domEvents;

	unit.test("calls enter event handler when enter key is pressed", function (assert) {
		assert.expect(1);
		var input = document.createElement("input");
		domEvents.addEventListener(input, "enter", function() {
			assert.ok(true, "enter key detected");
		});
		pressEnter(input);
	});

	if (supportsKeyboardEvents) {
		unit.test("works for KeyboardEvent's", function(assert) {
			assert.expect(1);
			var input = document.createElement("input");
			domEvents.addEventListener(input, "enter", function() {
				assert.ok(true, "enter key detected");
			});
			domEvents.dispatch(input, makeEnterEvent());
		});
	}

	unit.test("does not call enter event handler when a different key is pressed", function(assert) {
		assert.expect(1);
		var input = document.createElement("input");
		domEvents.addEventListener(input, "enter", function() {
			assert.ok(true, 'passed');
		});
		pressKey(input, 27); // not enter
		pressEnter(input);
	});

	unit.test("successfully removes enter event handler", function(assert) {
		assert.expect(1);
		var input = document.createElement("input");
		var enterEventHandler = function() {
			assert.ok(true);
		};
		domEvents.addEventListener(input, "enter", enterEventHandler);
		pressEnter(input);
		domEvents.removeEventListener(input, "enter", enterEventHandler);
		pressEnter(input);
	});

	unit.test("can have multiple enter event handlers and can remove them seperately", function(assert) {
		assert.expect(5);

		var input = document.createElement("input");
		var generateEvtHandler = function() {
			return function() {
				assert.ok(true);
			};
		};
		var firstEvtHandler = generateEvtHandler();
		var secondEvtHandler = generateEvtHandler();
		domEvents.addEventListener(input, "enter", firstEvtHandler);
		domEvents.addEventListener(input, "enter", secondEvtHandler);

		pressEnter(input); // +2
		pressEnter(input); // +2

		domEvents.removeEventListener(input, "enter", firstEvtHandler);
		pressEnter(input); // +1

		domEvents.removeEventListener(input, "enter", secondEvtHandler);
		pressEnter(input); // +0
	});

	unit.test("still handles other event types appropriately", function(assert) {
		assert.expect(1);
		var button = document.createElement("button");
		domEvents.addEventListener(button, "focus", function() {
			assert.ok(true, 'handles focus event still');
		});
		domEvents.dispatch(button, 'focus');
	});
}

suites.forEach(runTests);
