# Node.js Integration via NPM

[`spiderable-middleware`](https://github.com/veliovgroup/spiderable-middleware) is the Node.js package that routes bot traffic from your app to the ostr.io pre-rendering engine.

- [Pre-rendering overview](README.md)
- [Rendering endpoints](rendering-endpoints.md)
- 📦 [`spiderable-middleware` on NPM](https://www.npmjs.com/package/spiderable-middleware)
- 🐙 [`spiderable-middleware` repository](https://github.com/veliovgroup/spiderable-middleware) — installation, API, options
- 📚 [Framework-specific examples](https://github.com/veliovgroup/spiderable-middleware/tree/master/examples) — Express, Connect, Koa, Fastify, vanilla `http`, and more
- ℹ️ [What is pre-rendering and why you need it](https://ostr.io/info/prerendering)

## What it does

`spiderable-middleware` inspects incoming requests in your Node.js app. When the request comes from a known crawler, social previewer, or AI fetcher, it is transparently proxied to the ostr.io [rendering endpoint](rendering-endpoints.md) with your `Basic` auth credentials. Regular browser traffic continues straight to your application, untouched.

## When to use

- You run a Node.js app and prefer an **in-process** integration over a reverse-proxy or edge solution.
- You want pre-rendering decisions to live in your app code alongside other request handling.
- You need compatibility with any of the Node middleware signatures — Express, Connect, Koa, Fastify (via adapter), NestJS, h3, or a vanilla [`http` server](https://nodejs.org/api/http.html).

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

Modern crawlers rely on the User-Agent check that `spiderable-middleware` performs automatically, so this markup is **not required** for Googlebot, Bingbot, facebookexternalhit, AI fetchers, or any crawler that advertises itself via User-Agent.

## Related

For Node.js apps you can also route bot traffic **outside** the app layer, without adding any dependency:

- [Next.js integration](nextjs-prerendering.md) — if your Node.js app is specifically Next.js
- [Nginx integration](nginx.md) — reverse-proxy integration for Node upstreams
- [Caddy integration](caddy-prerendering.md) — simpler reverse-proxy alternative to Nginx
- [Vercel integration](vercel-prerendering.md) — for Node apps deployed on Vercel
- [Cloudflare Worker integration](cloudflare-worker.md) — edge-level, works for any origin
- [Detect pre-rendering engine requests at runtime](detect-prerendering.md)
