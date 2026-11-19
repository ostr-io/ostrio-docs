# Node.js Integration via NPM

[`spiderable-middleware`](https://github.com/veliovgroup/spiderable-middleware) is the Node.js package that routes bot traffic from your app to the ostr.io pre-rendering engine.

- [Pre-rendering overview](README.md)
- [Rendering endpoints](rendering-endpoints.md)
- 📦 [`spiderable-middleware` on NPM](https://www.npmjs.com/package/spiderable-middleware)
- 🐙 [`spiderable-middleware` repository](https://github.com/veliovgroup/spiderable-middleware) — installation, API, options
- 📚 [Framework-specific examples](https://github.com/veliovgroup/spiderable-middleware/tree/master/examples) — Express, Connect, Meteor.js, vanilla `http`, plus Nginx, Apache and Cloudflare configs
- ℹ️ [What is pre-rendering and why you need it](https://ostr.io/info/prerendering)

## What it does

`spiderable-middleware` inspects incoming requests in your Node.js app. When the request comes from a known crawler, social previewer, or AI fetcher, it is transparently proxied to the ostr.io [rendering endpoint](rendering-endpoints.md) with your `Basic` auth credentials. Regular browser traffic continues straight to your application, untouched.

As of 2.4.0 the `Spiderable` instance is a middleware function. Pass it to `app.use(spiderable)` in Express or Connect, or call `spiderable.handle(req, res, next)` from a plain Node.js `http` server. When `auth` is not set, the package reads the `SPIDERABLE_SERVICE_AUTH`, `PRERENDER_SERVICE_AUTH`, then `OSTR_AUTH` environment variable. As of 2.4.1, the value can be `user:pass` or the ready `Basic xxx` value from the [ostr.io pre-rendering panel](https://ostr.io/service/prerender). Version 2.4.0 accepts only `user:pass`.

## When to use

- You run a Node.js app and prefer an **in-process** integration over a reverse-proxy or edge solution.
- You want pre-rendering decisions to live in your app code alongside other request handling.
- You run Express, Connect, NestJS (Express platform), or a vanilla [`http` server](https://nodejs.org/api/http.html), or a framework with a Connect adapter: Koa via `koa-connect`, Fastify via `@fastify/middie`, h3 v1 (Nuxt, Nitro) via `fromNodeMiddleware` (needs 2.4.2 or newer). See [Other frameworks](https://github.com/veliovgroup/spiderable-middleware?tab=readme-ov-file#other-frameworks).

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

Modern crawlers rely on the User-Agent check that `spiderable-middleware` performs automatically, so this markup is **not required** for Googlebot, Bingbot, facebookexternalhit, meta-externalagent, AI fetchers, or any crawler that advertises itself via User-Agent.

## Add custom crawlers to the bot list

To treat additional crawlers as bots, use the `botsUA` option when initializing `spiderable-middleware`. The canonical crawler list is in [shared/crawler-ua-regex.md](shared/crawler-ua-regex.md). This section shows how to add custom entries in Node.js.

Pass custom User-Agent substrings to the constructor:

```javascript
const Spiderable = require('spiderable-middleware');

app.use(new Spiderable({
  auth: 'username:password',
  botsUA: ['mycompany-crawler', 'internal-spider', 'audit-bot']
}));
```

Use plain-text substrings, not regex patterns. The middleware applies case-insensitive matching. Custom entries extend the canonical bot list without replacing it. All standard crawlers remain detected.

For complete usage examples and all available options, see the [`spiderable-middleware` README](https://github.com/veliovgroup/spiderable-middleware#readme) on GitHub.

## Related

For Node.js apps you can also route bot traffic **outside** the app layer, without adding any dependency:

- [Next.js integration](nextjs-prerendering.md) — if your Node.js app is specifically Next.js
- [Nginx integration](nginx.md) — reverse-proxy integration for Node upstreams
- [Caddy integration](caddy-prerendering.md) — simpler reverse-proxy alternative to Nginx
- [Vercel integration](vercel-prerendering.md) — for Node apps deployed on Vercel
- [Cloudflare Worker integration](cloudflare-worker.md) — edge-level, works for any origin
- [Detect pre-rendering engine requests at runtime](detect-prerendering.md)
