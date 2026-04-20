# Vercel Integration

Self-managed [Vercel Routing Middleware](https://vercel.com/docs/routing-middleware) that routes bot traffic to the ostr.io pre-rendering CDN. One file, zero config, works with any framework deployed to Vercel.

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
- You want edge-level routing — middleware runs before the CDN cache.
- You use a framework that does not expose its own middleware hook, or you want a single integration that is independent of the framework (Astro, SvelteKit, Nuxt, Remix, plain static, etc.).

For Next.js specifically, the dedicated [Next.js middleware / NPM package](nextjs-prerendering.md) is another good option and runs in the same runtime.

## Framework compatibility

The middleware is framework-agnostic. Works with any framework deployed to Vercel:

- Astro
- Next.js *(also see the [Next.js-specific integration](nextjs-prerendering.md))*
- SvelteKit
- Nuxt
- Remix
- Plain static sites

## Setup

The complete drop-in middleware, env-var reference, and deploy steps live in [`examples/vercel/`](examples/vercel/). High-level flow:

1. Copy [`examples/vercel/middleware.js`](examples/vercel/middleware.js) to your project root.
2. Install `@vercel/functions`.
3. Set `OSTR_AUTH` (from the [ostr.io pre-rendering panel](https://ostr.io/service/prerender)) and, if needed, `OSTR_SITE_ORIGIN` as Vercel environment variables.
4. Deploy.

See the [example README](examples/vercel/README.md) for full details.

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
