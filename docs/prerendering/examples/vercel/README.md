# vercel-ostr-middleware

Drop-in [Vercel Routing Middleware](https://vercel.com/docs/routing-middleware) that routes bot traffic to [ostr.io](https://ostr.io) prerendering CDN. One file, zero config, works with any framework.

> For the integration guide with context, prerequisites, and alternatives see [`../../vercel-prerendering.md`](../../vercel-prerendering.md).

## What it does

| Request | Behavior |
|---------|----------|
| Human visitor | Passes through to your static/server pages |
| Googlebot, Bingbot, etc. (60+ bots) | Proxied to ostr.io which returns a fully rendered snapshot |
| ostr.io down or returns error | Falls back to your origin page |

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
| `OSTR_SERVICE_URL` | `https://render.ostr.io` | Yes |
| `OSTR_AUTH` | `Basic <base64 user:password>` | Yes |
| `OSTR_SITE_ORIGIN` | `https://yourdomain.com` | Only if preview URLs differ from your registered domain |

Get your credentials from the [ostr.io dashboard](https://ostr.io) after adding your domain.

To encode your credentials:

```bash
echo -n "user:password" | base64
# Then set OSTR_AUTH=Basic <output>
```

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

[Vercel Routing Middleware](https://vercel.com/docs/routing-middleware) runs before the CDN cache on every request. This middleware checks the `User-Agent` header against 60+ known bot patterns. Bot requests are proxied to ostr.io's rendering CDN (`render.ostr.io`) which returns a pre-rendered HTML snapshot. Human traffic is untouched.

The middleware uses `@vercel/functions` for the `next()` helper and runs on the edge runtime by default.

## Compatibility

Works with any framework deployed to Vercel:

- Astro
- Next.js
- SvelteKit
- Nuxt
- Plain static sites

## Links

- [Vercel integration guide](../../vercel-prerendering.md) — full context, alternatives, and validation steps
- [Pre-rendering overview](../../README.md)
- [ostr.io](https://ostr.io) — pre-rendering service provider
- [Vercel Routing Middleware docs](https://vercel.com/docs/routing-middleware)
- [`spiderable-middleware`](https://github.com/veliovgroup/spiderable-middleware) — bot list source

---

Originally built by [Beton](https://getbeton.ai) for [selltostate.com](https://www.selltostate.com).
