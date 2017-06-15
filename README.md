# can-event-dom-enter

[![Build Status](https://travis-ci.org/canjs/can-event-dom-enter.svg?branch=master)](https://travis-ci.org/canjs/can-event-dom-enter)

Watch for enter keys presses on a DomEventTarget.

```js
var domEvents = require('can-dom-events');
var enterEvent = require('can-event-dom-enter');

// add the enter event to the global event registry
domEvents.addEvent(enterEvent);

var input = document.createElement('input');
function enterEventHandler() {
	console.log('enter key pressed');
}

domEvents.addEventHandler(input, 'enter', enterEventHandler);
// User hits enter key in input
// => *enter key pressed*
```

## Usage

### ES6 use

With StealJS, you can import this module directly in an auto-rendered template:

```js
import enter from 'can-event-dom-enter';
import domEvents from 'can-dom-events';
domEvents.addEvent(enter);
```

### CommonJS use

Use `require` to load `can-event-dom-enter` and everything else
needed to create a template that uses `can-event-dom-enter`:

```js
var enter = require("can-event-dom-enter");
var domEvents = require('can-dom-events');
domEvents.addEvent(enter);
```

### Standalone use

Load the `global` version of the plugin:

```html
<script src='./node_modules/can-event-dom-enter/dist/global/can-event-dom-enter.js'></script>
```
