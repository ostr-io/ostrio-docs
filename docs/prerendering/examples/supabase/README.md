# Supabase Edge Function examples

Drop-in [Supabase Edge Function](https://supabase.com/docs/guides/functions) middleware that routes crawler traffic to the [ostr.io](https://ostr.io) pre-rendering CDN. Four Deno-native variants — plain `Deno.serve`, [Hono](https://hono.dev/), [Oak](https://jsr.io/@oak/oak), and [Fresh](https://fresh.deno.dev/) — all sharing one detection/proxy helper.

> For the integration guide with context, prerequisites, and alternatives see [`../../supabase-prerendering.md`](../../supabase-prerendering.md).

## Contents

- [What it does](#what-it-does)
- [File layout](#file-layout)
- [Pick a framework](#pick-a-framework)
- [Setup](#setup)
- [Domain routing](#domain-routing)
- [Verify](#verify)
- [How it works](#how-it-works)

## What it does

| Request | Behavior |
| --- | --- |
| Human visitor (`GET`/`HEAD` HTML) | Passes through to your app (inline middleware) or to `ROOT_URL` (reverse proxy) |
| Known crawler / social preview / AI fetcher | Proxied to `render.ostr.io`, rendered snapshot returned |
| Non-`GET`/`HEAD`, `.well-known/`, static-asset extension | Skipped — pre-rendering never fires |
| `render.ostr.io` errors or `OSTR_AUTH` missing | Falls back to origin / next handler (fail-open) |

## File layout

Each file in this folder corresponds to one framework variant. The expected Supabase project layout:

```text
supabase/
  functions/
    _shared/
      ostr.ts               <-- copied from shared.ts
    <your-function>/
      index.ts              <-- copied from deno.ts, hono.ts, or oak.ts
```

For Fresh apps, `fresh-middleware.ts` goes to `routes/_middleware.ts` in the Fresh project root; `_shared/ostr.ts` goes wherever the import path resolves.

## Pick a framework

| File | Shape | Use when |
| --- | --- | --- |
| [`deno.ts`](deno.ts) | Reverse proxy — function is the site's public entry point, forwards non-crawler traffic to `ROOT_URL` | Smallest footprint, no app framework, origin lives elsewhere |
| [`hono.ts`](hono.ts) | Inline middleware — drops into an existing Hono app via `app.use('*', ostrPrerender)` | Your site is already a Hono app deployed as an Edge Function |
| [`oak.ts`](oak.ts) | Inline middleware — drops into an existing Oak app via `app.use(ostrPrerender)` | Your site is already an Oak app deployed as an Edge Function |
| [`fresh-middleware.ts`](fresh-middleware.ts) | Inline `routes/_middleware.ts` — runs before every Fresh route | Your site is a Fresh SSR app (on Supabase Edge Functions or Deno Deploy) |
| [`shared.ts`](shared.ts) | Shared helpers — `decide()`, `fetchRendered()`, `proxyToOrigin()` | Imported by all four variants |

## Setup

### 1. Copy files into your Supabase project

```text
supabase/functions/_shared/ostr.ts          <- shared.ts
supabase/functions/ostr-prerender/index.ts  <- deno.ts (or hono.ts / oak.ts)
```

For Fresh: drop `fresh-middleware.ts` at `routes/_middleware.ts` in the Fresh app root, and put `shared.ts` at an import-resolvable path (`_shared/ostr.ts` relative to `routes/_middleware.ts`).

### 2. Set secrets

Get the `Basic ...` token from the [ostr.io pre-rendering panel](https://ostr.io/service/prerender) after adding and verifying your domain.

```shell
supabase secrets set \
  OSTR_AUTH='Basic <base64 user:password>' \
  ROOT_URL='https://example.com'
```

Optional: set `OSTR_SERVICE_URL` to override the default `https://render.ostr.io` (for example, `https://render-cache.ostr.io` for aggressive caching — see [`../../rendering-endpoints.md`](../../rendering-endpoints.md)).

To encode credentials locally:

```shell
echo -n 'user:password' | base64
```

### 3. Deploy

```shell
supabase functions deploy ostr-prerender --no-verify-jwt
```

`--no-verify-jwt` is required so public unauthenticated traffic can reach the function — see the [Supabase auth docs](https://supabase.com/docs/guides/functions/auth#skip-authentication-for-a-function).

## Domain routing

The function is reachable at `https://<project-ref>.supabase.co/functions/v1/ostr-prerender`. To serve it at `https://example.com/`, choose one:

- **Supabase custom domain** — configure a [custom domain](https://supabase.com/docs/guides/platform/custom-domains) on the project and add a URL rewrite (on your DNS/edge provider) that drops the `/functions/v1/ostr-prerender` prefix.
- **Cloudflare in front** — keep DNS on Cloudflare (orange-cloud proxy) and add a [Transform Rule](https://developers.cloudflare.com/rules/transform/url-rewrite/) that rewrites `example.com/*` → `<project-ref>.supabase.co/functions/v1/ostr-prerender/*`. If Cloudflare is already in the path, consider the [Cloudflare Worker integration](../../cloudflare-worker.md) instead.
- **Fresh / inline shape** — the middleware runs inside the existing SSR function entry point; no extra routing step is needed.

## Verify

Bot request should return a pre-rendered snapshot:

```shell
curl -sI -A 'Googlebot/2.1' https://example.com/
# Look for `x-prerender-id` in the response headers.
```

Regular browser request should pass through untouched:

```shell
curl -sI -A 'Mozilla/5.0' https://example.com/
```

Legacy fragment request should hit the renderer:

```shell
curl -sI 'https://example.com/?_escaped_fragment_='
```

Check **Supabase Studio → Edge Functions → Logs** — a bot request should log one outbound `fetch` to `render.ostr.io`; a visitor request should log one outbound `fetch` to `ROOT_URL` (reverse-proxy variant) or fall through to app routing (inline variants).

## How it works

[`shared.ts`](shared.ts) centralizes three primitives used by every variant:

- **`decide(req, siteOrigin?)`** — classifies the request against the [canonical crawler User-Agent regex](../../shared/crawler-ua-regex.md) and the [canonical static-asset extension list](../../shared/static-extensions-regex.md). Short-circuits non-`GET`/`HEAD`, `/.well-known/`, and static assets. Also strips `_escaped_fragment_` out of the forwarded query string and returns the canonical `renderTarget` URL built from `ROOT_URL`.
- **`fetchRendered(req, renderTarget, ua)`** — `fetch`es the ostr.io renderer with `Authorization: <OSTR_AUTH>`, forwards `user-agent` and `accept-language`, strips hop-by-hop and cache-pollution response headers. Returns `null` on non-2xx/3xx or throw so callers can fail-open.
- **`proxyToOrigin(req, siteOrigin?)`** — passes the request through to `ROOT_URL` untouched. Only used by the reverse-proxy variant (`deno.ts`); inline variants defer to their framework's `next()` handler instead.

Every framework variant wires these three primitives into the same decision tree as the [Vercel middleware](../vercel/middleware.js), [Next.js middleware](../next.js/middleware.ts), and [Cloudflare Worker](../cloudflare-worker/cloudflare.worker.js) — one canonical behavior, one source of truth.

## Links

- [Supabase integration guide](../../supabase-prerendering.md) — full context, alternatives, and validation steps
- [Pre-rendering overview](../../README.md)
- [ostr.io](https://ostr.io) — pre-rendering service provider
- [`spiderable-middleware`](https://github.com/veliovgroup/spiderable-middleware) — bot list source
- [Supabase Edge Functions docs](https://supabase.com/docs/guides/functions)
