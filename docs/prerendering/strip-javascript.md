# Pre-rendering: Strip JavaScript

By default, after a page is rendered all JavaScript blocks and file references are removed from the final result. This avoids unpredictable behavior on the web-crawler end — we have seen cases where content was rendered multiple times. It is recommended to keep this option **on**, but you are free to turn it off.

![Enable / disable JS stripping screenshot](./prerendering-stripjs.png)

## Related

- [Detect pre-rendering engine requests at runtime](detect-prerendering.md) — needed when JS stripping is off and your app should behave differently under the pre-renderer
