'use strict';

var domData = require('can-dom-data-state');
var singleReference = require('can-util/js/single-reference/single-reference')

var baseEventType = 'keyup';

function isEnterEvent (event) {
	var hasEnterKey = event.key === 'Enter';
	var hasEnterCode = event.keyCode === 13;
	return hasEnterKey || hasEnterCode;
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

		singleReference.set(target, eventType, handler, keyHandler);
		this.addEventListener(target, baseEventType, keyHandler);
	},

	removeEventListener: function (target, eventType, handler) {
		var keyHandler = singleReference.getAndDelete(target, eventType, handler);
		if (keyHandler) {
			this.removeEventListener(target,baseEventType, keyHandler);
		}
	}
};
