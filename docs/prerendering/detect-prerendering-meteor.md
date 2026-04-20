# Detect Pre-rendering Engine Requests in Meteor.js

When requests come from the pre-rendering engine they can be detected at JS runtime (e.g. front-end code).

See the non-Meteor version: [Detect pre-rendering engine requests](detect-prerendering.md).

## Detect that a request is coming from the pre-rendering engine

The pre-rendering engine sets `window.IS_PRERENDERING` to `true`. Because Meteor favors reactive state, bind it to a `ReactiveVar`:

```js
import { ReactiveVar } from 'meteor/reactive-var';
import { Template } from 'meteor/templating';

const IS_PRERENDERING = new ReactiveVar(window.IS_PRERENDERING || false);
Object.defineProperty(window, 'IS_PRERENDERING', {
  set(val) {
    IS_PRERENDERING.set(val);
  },
  get() {
    return IS_PRERENDERING.get();
  }
});

// Expose a global Blaze helper.
// Omit this line if you are not using Blaze or if you prefer to handle
// the logic in plain JavaScript.
Template.registerHelper('IS_PRERENDERING', () => IS_PRERENDERING.get());
```

> [!NOTE]
> `window.IS_PRERENDERING` may be `undefined` on initial page load and can change during runtime.

## Detect the type of pre-rendering engine

Like browsers, crawlers and bots come as "mobile" (small-screen touch devices) or "desktop" (large screens without touch events). The pre-rendering engine exposes the same two types via `window.IS_PRERENDERING_TYPE`, set to either `desktop` or `mobile`:

```js
import { ReactiveVar } from 'meteor/reactive-var';
import { Template } from 'meteor/templating';

const IS_PRERENDERING_TYPE = new ReactiveVar(window.IS_PRERENDERING_TYPE || '');
Object.defineProperty(window, 'IS_PRERENDERING_TYPE', {
  set(val) {
    IS_PRERENDERING_TYPE.set(val);
  },
  get() {
    return IS_PRERENDERING_TYPE.get();
  }
});

Template.registerHelper('IS_PRERENDERING_TYPE', () => IS_PRERENDERING_TYPE.get());
```

Use it in application code:

```js
if (window.IS_PRERENDERING_TYPE === 'mobile') {
  // Request is coming from a mobile crawler and mobile pre-rendering engine
} else if (window.IS_PRERENDERING_TYPE === 'desktop') {
  // Request is coming from a desktop crawler and desktop pre-rendering engine
} else {
  // Request is from a regular user
}
```
