# Meteor.js Integration via Atmosphere

[`ostrio:spiderable-middleware`](https://atmospherejs.com/ostrio/spiderable-middleware) is the Atmosphere package that routes bot traffic from Meteor's `WebApp` layer to the ostr.io pre-rendering engine.

- [Pre-rendering overview](README.md)
- [Rendering endpoints](rendering-endpoints.md)
- 🌠 [`ostrio:spiderable-middleware` on Atmosphere](https://atmospherejs.com/ostrio/spiderable-middleware) — installation, API, options
- 📚 [Framework-specific examples](https://github.com/veliovgroup/spiderable-middleware/tree/master/examples) — shared with the Node.js package
- ℹ️ [What is pre-rendering and why you need it](https://ostr.io/info/prerendering)

## What it does

The package registers as middleware on Meteor's `WebApp` and inspects every incoming request. When the User-Agent matches a known crawler, social previewer, or AI fetcher, the request is transparently proxied to the ostr.io [rendering endpoint](rendering-endpoints.md) with your `Basic` auth credentials. Regular browser traffic is passed through to Meteor, untouched.

## Register the middleware

The `Spiderable` instance is a middleware function. Pass it to `WebApp.handlers` on Meteor 3, or to `WebApp.connectHandlers` on Meteor 2 and older:

```javascript
import { WebApp } from 'meteor/webapp';
import Spiderable from 'meteor/ostrio:spiderable-middleware';

const spiderable = new Spiderable({ auth: 'username:password' });

// Meteor 3
WebApp.handlers.use(spiderable);

// Meteor 2 and older
// WebApp.connectHandlers.use(spiderable);
```

Passing the instance itself to `WebApp.handlers` needs `ostrio:spiderable-middleware` 2.4.0 or newer. Older releases on Meteor 3 must pass `spiderable.handle` instead.

When `auth` is not set, the package reads the `SPIDERABLE_SERVICE_AUTH`, `PRERENDER_SERVICE_AUTH`, then `OSTR_AUTH` environment variable. As of 2.4.1, the value can be `user:pass` or the ready `Basic xxx` value from the [ostr.io pre-rendering panel](https://ostr.io/service/prerender). Version 2.4.0 accepts only `user:pass`.

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

Modern crawlers rely on the User-Agent check that `ostrio:spiderable-middleware` performs automatically, so this markup is **not required** for Googlebot, Bingbot, facebookexternalhit, meta-externalagent, AI fetchers, or any crawler that advertises itself via User-Agent.

## Add custom crawlers to the bot list

To treat additional crawlers as bots, use the `botsUA` option when initializing the package. The canonical crawler list is in [shared/crawler-ua-regex.md](shared/crawler-ua-regex.md). This section shows how to add custom entries in Meteor.

In your app's server code, pass custom User-Agent substrings to the middleware initialization:

```javascript
import { WebApp } from 'meteor/webapp';
import Spiderable from 'meteor/ostrio:spiderable-middleware';

WebApp.handlers.use(new Spiderable({
  auth: 'username:password',
  botsUA: ['mycompany-crawler', 'internal-spider', 'audit-bot']
}));
```

Use plain-text substrings, not regex patterns. The middleware applies case-insensitive matching. Custom entries extend the canonical bot list without replacing it. All standard crawlers remain detected.

For complete usage examples and all available options, see the [`ostrio:spiderable-middleware` on Atmosphere](https://atmospherejs.com/ostrio/spiderable-middleware) and the [package README](https://github.com/veliovgroup/spiderable-middleware#readme) on GitHub.

## Related

For Meteor apps deployed behind a reverse proxy or CDN, you can also enable pre-rendering without adding the Atmosphere package:

- [Nginx integration](nginx.md) — reverse-proxy integration
- [Caddy integration](caddy-prerendering.md) — simpler reverse-proxy alternative to Nginx
- [Cloudflare Worker integration](cloudflare-worker.md) — edge-level, works for any origin
- [Detect pre-rendering engine requests at runtime — *Meteor-specific*](detect-prerendering-meteor.md)
