'use strict';

var domData = require('can-dom-data-state');
var canCid = require("can-cid");

var baseEventType = 'keyup';

function isEnterEvent (event) {
	var hasEnterKey = event.key === 'Enter';
	var hasEnterCode = event.keyCode === 13;
	return hasEnterKey || hasEnterCode;
}

function getHandlerKey (eventType, handler) {
	return eventType + ':' + canCid(handler);
}

function associateHandler (target, eventType, handler, otherHandler) {
	var key = getHandlerKey(eventType, handler);
	domData.set.call(target, key, otherHandler);
}

function disassociateHandler (target, eventType, handler) {
	var key = getHandlerKey(eventType, handler);
	var otherHandler = domData.get.call(target, key);
	if (otherHandler) {
		domData.clean.call(target, key);
	}
	return otherHandler;
}

/**
 * @module {events} can-event-dom-enter
 * @parent can-dom-utilities
 * @collection can-infrastructure
 * @package ./package.json
 *
 * Watch for when enter keys are pressed on a DomEventTarget.
 *
 * ```js
 * var domEvents = require('can-dom-events');
 * var enterEvent = require('can-event-dom-enter');
 *
 * domEvents.addEvent(enterEvent);
 *
 * var input = document.createElement('input');
 * function enterEventHandler() {
 * 	console.log('enter key pressed');
 * }
 *
 * domEvents.addEventHandler(input, 'enter', enterEventHandler);
 * domEvents.dispatch(input, {
 *   type: 'keyup',
 *   keyCode: keyCode
 * });
 * ```
 */
module.exports = {
	defaultEventType: 'enter',

	addEventListener: function (target, eventType, handler) {
		var keyHandler = function (event) {
			if (isEnterEvent(event)) {
				return handler.apply(this, arguments);
			}
		};

		associateHandler(target, eventType, handler, keyHandler);
		this.addEventListener(target, baseEventType, keyHandler);
	},

	removeEventListener: function (target, eventType, handler) {
		var keyHandler = disassociateHandler(target, eventType, handler);
		if (keyHandler) {
			this.removeEventListener(target,baseEventType, keyHandler);
		}
	}
};
