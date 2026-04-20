# Detect Pre-rendering Engine Requests at Runtime

When requests come from the pre-rendering engine they can be detected at JS runtime (e.g. front-end code).

For a Meteor-specific reactive version, see [Detect pre-rendering in Meteor.js](detect-prerendering-meteor.md).

## Detect that request is coming from pre-rendering engine

Prerendering engine will set `window.IS_PRERENDERING` global variable to `true`. Detecting request from prerendering engine might be as easy as:

```js
if (window.IS_PRERENDERING) {
  // This request is coming from Prerendering engine
}
```

__Note__: `window.IS_PRERENDERING` might be `undefined` on initial page load, and may change during runtime. That's why we recommend to pre-define a setter for `IS_PRERENDERING`:

```js
let _is_prerendering = window.IS_PRERENDERING || false;
Object.defineProperty(window, 'IS_PRERENDERING', {
  set(val) {
    _is_prerendering = val;
    if (_is_prerendering === true) {
      // This request is coming from Prerendering engine
    }
  },
  get() {
    return _is_prerendering;
  }
});
```

## Detect type of the pre-rendering engine

Like browsers, crawler, and bots come as "mobile" (small screen touch-devices) or as "desktop" (large screens without touch-events) the pre-rendering engine has the same two types. For cases when content needs to get optimized for different screens pre-rendering engine will set `window.IS_PRERENDERING_TYPE` global variable to `desktop` or `mobile`

```js
if (window.IS_PRERENDERING_TYPE === 'mobile') {
  // This request is coming from "mobile" web crawler and "mobile" pre-rendering engine
} else if (window.IS_PRERENDERING_TYPE === 'desktop') {
  // This request is coming from "desktop" web crawler and "desktop" pre-rendering engine
} else {
  // This request is coming from user
}
```
