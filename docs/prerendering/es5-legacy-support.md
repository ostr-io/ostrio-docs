# Legacy (ES5) Support

Modern JavaScript — ES6/7 and beyond — is enabled **by default** on the pre-rendering engine, with full support for `const`/`let`, arrow functions, classes, `async/await`, destructuring, template literals, modules, `fetch`, and other current language features. Most sites need no action.

## When to disable modern JavaScript

Disable ES6/7 only for **legacy websites** that meet one of the following:

- Bundle was transpiled to ES5 and ships polyfills that conflict with a modern runtime.
- Uses globals or prototype patches that behave differently under a newer V8 (for example reliance on pre-ES6 `Array` / `String` semantics, or legacy `with`-statement usage).
- Has been in production since before ~2018 and has not been re-verified against current Chromium.

Modern sites — React, Vue, Svelte, Angular, Astro, Next.js, Nuxt, SvelteKit, Remix, and any Vite / Webpack / Rollup / esbuild / Turbopack output — should keep the default ES6/7 engine.

## How to disable

In the **Pre-rendering Panel**, uncheck the **`ES6/7 (Modern JavaScript)`** option in the pre-rendering panel of a host that needs it. The setting is per-host, so you can keep modern websites on the default engine while routing a single legacy site to the ES5 engine.

After toggling, purge the host's pre-rendering cache so existing rendered snapshots are regenerated against the selected engine — see [cache purging](cache-purge.md).

## What changes

- **Default (ES6/7 enabled):** newest stable V8 engine. Full support for current JavaScript features.
- **Legacy (ES6/7 disabled):** older, more conservative engine tuned for ES5-era sites. Better compatibility with transpiled bundles and legacy polyfills; may not execute modern syntax.

## Related

- [Strip JavaScript](strip-javascript.md)
- [Client optimization](optimization.md)
- [Cache purge](cache-purge.md)
