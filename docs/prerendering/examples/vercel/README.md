# vercel-ostr-middleware

Drop-in [Vercel Routing Middleware](https://vercel.com/docs/routing-middleware) that routes bot traffic to [ostr.io](https://ostr.io) Pre-rendering CDN. One file, for frameworks without their own routing middleware. `middleware.js` here is a copy of [`ostr-io/vercel-ostr-middleware`](https://github.com/ostr-io/vercel-ostr-middleware), which has the tests and the full README.

> For the integration guide with context, prerequisites, and alternatives see [`../../vercel-prerendering.md`](../../vercel-prerendering.md).

## What it does

| Request | Behavior |
|---------|----------|
| Human visitor | Passes through to your static/server pages |
| Googlebot, Bingbot, AI fetchers, link previewers ([canonical list](../../shared/crawler-ua-regex.md)) | Proxied to ostr.io which returns a fully rendered snapshot |
| Rendered page with 404, 410 or a redirect | Status and `Location` passed to the crawler |
| ostr.io unreachable, times out, or returns its own error | Falls back to your origin page |

## Setup

### 1. Copy `middleware.js` to your project root

```
your-project/
  middleware.js   <-- this file
  src/
  package.json
  ...
```

### 2. Install dependency

```bash
npm install @vercel/functions
```

### 3. Set environment variables in Vercel

| Variable | Value | Required |
|----------|-------|----------|
| `OSTR_AUTH` | `Basic xxx` from the ostr.io dashboard, or `user:pass` | Yes |
| `OSTR_SITE_ORIGIN` or `ROOT_URL` | `https://yourdomain.com` | Only if preview URLs differ from your registered domain |
| `OSTR_SERVICE_URL` | Rendering endpoint | No, defaults to `https://render.ostr.io` |
| `OSTR_TIMEOUT` | Milliseconds to wait for ostr.io | No, defaults to `20000` |

Get your credentials from the [ostr.io pre-rendering panel](https://ostr.io/service/prerender) after adding your domain. The panel shows `OSTR_AUTH` as a ready `Basic xxx` value. A plain `user:pass` also works, the middleware base64-encodes it.

### 4. Deploy

```bash
vercel deploy
```

### Verify

```bash
curl -sI -A 'Googlebot/2.1' https://yourdomain.com/
# Look for x-prerender-id header from ostr.io
```

## How it works

[Vercel Routing Middleware](https://vercel.com/docs/routing-middleware) runs before the CDN cache on every request. This middleware checks the `User-Agent` header against the [canonical crawler list](../../shared/crawler-ua-regex.md). Bot requests are proxied to ostr.io's rendering CDN (`render.ostr.io`) with only the `User-Agent`, `Accept`, `Accept-Language` and `Authorization` headers, so visitor cookies never leave your site. Human traffic is untouched.

Routing Middleware runs on the Node.js runtime by default ([Vercel docs](https://vercel.com/docs/routing-middleware#runtime-options)). The file uses only Web APIs and the `next()` helper from `@vercel/functions`, so it also runs on the Edge runtime. Edge functions must start a response within 25 seconds, the 20-second `OSTR_TIMEOUT` default leaves time for the origin fallback.

## Compatibility

For frameworks that don't build their own routing middleware, such as SvelteKit, Nuxt and plain static sites.

Next.js and Astro build their own routing middleware, and Vercel's docs say Routing Middleware can't be used with them ([Vercel docs](https://vercel.com/docs/routing-middleware#creating-routing-middleware)). Next.js: use the [Next.js integration](../../nextjs-prerendering.md).

## Links

- [Vercel integration guide](../../vercel-prerendering.md) — full context, alternatives, and validation steps
- [Pre-rendering overview](../../README.md)
- [ostr.io](https://ostr.io) — pre-rendering service provider
- [Vercel Routing Middleware docs](https://vercel.com/docs/routing-middleware)
- [`ostr-io/vercel-ostr-middleware`](https://github.com/ostr-io/vercel-ostr-middleware) — source of `middleware.js`, tests, full README

---

Originally built by [Beton](https://getbeton.ai) for [selltostate.com](https://www.selltostate.com).
