# Vercel Integration

Self-managed [Vercel Routing Middleware](https://vercel.com/docs/routing-middleware) that routes bot traffic to the ostr.io pre-rendering CDN. One file, for frameworks deployed to Vercel that don't build their own routing middleware.

- [Pre-rendering overview](README.md)
- [Rendering endpoints](rendering-endpoints.md)
- 📦 [Ready-to-use middleware + setup guide](examples/vercel/) — drop-in `middleware.js`, env-var reference, deploy steps
- 📄 [Vercel Routing Middleware docs](https://vercel.com/docs/routing-middleware)

## What it does

[Vercel Routing Middleware](https://vercel.com/docs/routing-middleware) runs on every request before the CDN cache. The supplied middleware:

1. Lets non-`GET`/`HEAD` traffic pass through to origin unchanged.
2. Skips static assets and `/.well-known/` paths.
3. Checks the `User-Agent` against the [canonical crawler regex](shared/crawler-ua-regex.md) and handles the legacy `_escaped_fragment_` query parameter.
4. For bot traffic, proxies the request to `https://render.ostr.io` with your `OSTR_AUTH` header.
5. On any renderer error, falls back to your origin response (fail-open).

## When to use

- You deploy to Vercel and want pre-rendering without touching your framework code.
- You want routing before the CDN cache — Routing Middleware runs before it.
- You use a framework that does not build its own routing middleware (SvelteKit, Nuxt, plain static, etc.).

For Next.js, use the [Next.js integration](nextjs-prerendering.md) instead.

## Framework compatibility

Vercel's docs say Routing Middleware can't be used with Next.js or Astro, which build their own routing middleware ([Vercel docs](https://vercel.com/docs/routing-middleware#creating-routing-middleware)). Use it with frameworks that don't, such as:

- SvelteKit
- Nuxt
- Plain static sites

Next.js: use the [Next.js integration](nextjs-prerendering.md). Astro: use Astro's own middleware.

## Setup

The complete drop-in middleware, env-var reference, and deploy steps live in [`examples/vercel/`](examples/vercel/). High-level flow:

1. Copy [`examples/vercel/middleware.js`](examples/vercel/middleware.js) to your project root.
2. Install `@vercel/functions`.
3. Set `OSTR_AUTH` (the `Basic xxx` value from the [ostr.io pre-rendering panel](https://ostr.io/service/prerender), or `user:pass`) and, if needed, `OSTR_SITE_ORIGIN` (alias `ROOT_URL`) and `OSTR_TIMEOUT` as Vercel environment variables.
4. Deploy.

See the [example README](examples/vercel/README.md) for full details.

## Add custom crawlers to the bot list

To treat additional crawlers as bots, extend the bot-detection array in your Vercel middleware with custom User-Agent substrings. The canonical crawler list is in [shared/crawler-ua-regex.md](shared/crawler-ua-regex.md). This section shows how to add custom entries in Vercel middleware.

Edit your `middleware.js` (copied from the example) to add custom substrings to the `BOT_AGENTS` array:

```javascript
const BOT_AGENTS = [
  // Canonical crawlers (from shared/crawler-ua-regex.md)
  // ... all entries from the canonical list ...
  // Custom entries:
  'mycompany-crawler',
  'internal-spider',
  'audit-bot'
];
const BOT_RE = new RegExp(BOT_AGENTS.join('|'), 'i');
```

Use plain-text substrings, not regex patterns. The `RegExp(..., 'i')` flag applies case-insensitive matching. If your custom substrings contain regex special characters like `.`, `+`, or `(`, escape them with `\\`:

```javascript
const BOT_AGENTS = [
  // ... existing entries ...
  'mycompany-crawler',
  'internal-spider\\.bot',  // literal dot
  'audit\\+pro'              // literal plus
];
```

Custom entries extend the canonical bot list without replacing it. All standard crawlers remain detected. Redeploy after editing.

## Validation

Bot request should return a pre-rendered snapshot with the `X-Prerender-Id` header:

```shell
curl -sI -A 'Googlebot/2.1' https://yourdomain.com/
```

Regular browser request should pass through untouched:

```shell
curl -sI -A 'Mozilla/5.0' https://yourdomain.com/
```

## Related

- [Next.js integration](nextjs-prerendering.md) — Next.js-specific alternative
- [Netlify integration](netlify-prerendering.md) — same layer, different host
- [Cloudflare Worker integration](cloudflare-worker.md) — CDN-level alternative that does not require Vercel
- [Detect pre-rendering engine requests at runtime](detect-prerendering.md)
- [Rendering endpoints](rendering-endpoints.md)
