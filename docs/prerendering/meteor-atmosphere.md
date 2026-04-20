# Meteor.js Integration via Atmosphere

[`ostrio:spiderable-middleware`](https://atmospherejs.com/ostrio/spiderable-middleware) is the Atmosphere package that routes bot traffic from Meteor's `WebApp` layer to the ostr.io pre-rendering engine.

- [Pre-rendering overview](README.md)
- [Rendering endpoints](rendering-endpoints.md)
- 🌠 [`ostrio:spiderable-middleware` on Atmosphere](https://atmospherejs.com/ostrio/spiderable-middleware) — installation, API, options
- 📚 [Framework-specific examples](https://github.com/veliovgroup/spiderable-middleware/tree/master/examples) — shared with the Node.js package
- ℹ️ [What is pre-rendering and why you need it](https://ostr.io/info/prerendering)

## What it does

The package plugs into `WebApp.connectHandlers` and inspects every incoming request. When the User-Agent matches a known crawler, social previewer, or AI fetcher, the request is transparently proxied to the ostr.io [rendering endpoint](rendering-endpoints.md) with your `Basic` auth credentials. Regular browser traffic is passed through to Meteor, untouched.

## When to use

- You run a Meteor.js app and want pre-rendering wired up through the Meteor build system.
- You want reactive server-side detection paired with client-side [`detect-prerendering-meteor`](detect-prerendering-meteor.md) `ReactiveVar` integration.
- Deploying behind Meteor Galaxy, Cloud Run, or a plain Node server where you can add the Atmosphere package.

For infrastructure-level alternatives that do not require editing application code, see [Related](#related) below.

## Legacy `<meta name="fragment">` markup *(optional)*

The legacy `_escaped_fragment_` crawling scheme was [deprecated by Google in 2015](https://developers.google.com/search/blog/2015/10/deprecating-our-ajax-crawling-scheme) but is still honored by some non-Google crawlers. If you care about those edge cases, add the meta tag to your HTML shell:

```html
<html>
  <head>
    <meta name="fragment" content="!">
  </head>
</html>
```

Modern crawlers rely on the User-Agent check that `ostrio:spiderable-middleware` performs automatically, so this markup is **not required** for Googlebot, Bingbot, facebookexternalhit, AI fetchers, or any crawler that advertises itself via User-Agent.

## Related

For Meteor apps deployed behind a reverse proxy or CDN, you can also enable pre-rendering without adding the Atmosphere package:

- [Nginx integration](nginx.md) — reverse-proxy integration
- [Caddy integration](caddy-prerendering.md) — simpler reverse-proxy alternative to Nginx
- [Cloudflare Worker integration](cloudflare-worker.md) — edge-level, works for any origin
- [Detect pre-rendering engine requests at runtime — *Meteor-specific*](detect-prerendering-meteor.md)
