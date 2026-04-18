# Caddy Integration

Tutorial for adding `ostr.io` pre-rendering middleware to a site behind Caddy. In short, Caddy detects crawler traffic and rewrites matching requests to: `https://render.ostr.io/render/<original-url>` so bots get prerendered HTML while regular users continue to receive the normal app response.

## ToC

- [1. Prerequisites](#1-prerequisites)
- [2. Install `Authorization` token](#2-install-authorization-token)
- [3. Core routing logic](#3-core-routing-logic)
- [4. Setup by stack](#4-setup-by-stack)
  - [Node.js / Next.js and alike](#41-nodejs--nextjs-and-alike)
  - [PHP and alike](#42-php-and-alike)
  - [Python / Django and alike](#43-python--django-and-alike)
  - [Static sites](#44-static-sites)
- [5. Other popular framework examples](#5-other-popular-framework-examples)
- [6. Verify deployment](#6-verify-deployment)
- [7. Notes](#7-notes)

## 1. Prerequisites

- Caddy v2.x running for your domain
- Existing `Authorization` token from `ostr.io` integration settings
- HTTPS enabled (recommended; still works with HTTP for testing)

When to use Caddy integration:
- If you want a uniform server-level integration for multiple apps

## 2. Install `Authorization` token

From `ostr.io`:

1. Open your domain in the [pre-rendering panel](https://ostr.io/service/prerender)
2. Copy the header from the integration card
3. Set it in Caddy runtime environment:

```text
OSTR_AUTH=Basic <your_base64_or_token>
```

Prefer environment variables over inline secrets in Caddyfile.

In `caddy.service` (systemd), that usually means setting environment through
`Environment=` or an environment file.

Alternatively, `OSTR_AUTH` can be defined directly in the Caddyfile using the
`vars` directive. This is convenient for local development or when a secrets
manager is not available, but keep in mind that the value will be stored in
plain text inside the config file:

```caddy
example.com {
  vars OSTR_AUTH "Basic <your_base64_or_token>"

  # Reference it in the proxy block:
  reverse_proxy https://render.ostr.io {
    header_up Authorization "{vars.OSTR_AUTH}"
  }
}
```

## 3. Core routing logic

All examples rely on the same request filtering idea:

- Match `GET`/`HEAD` crawler traffic
- Skip static assets
- Skip websocket upgrades
- Detect either:
  - known crawler UA
  - `_escaped_fragment_` query parameter

### Variables and placeholders

Each example Caddyfile defines two user-configurable variables at the top of
the site block and uses Caddy's built-in request placeholders for dynamic
values:

| Name | Type | Description |
|---|---|---|
| `OSTR_SCHEME` | `vars` (Caddyfile) | Site scheme forwarded to the prerender service. Set to `"https"` or `"http"`. |
| `OSTR_HOST` | `vars` (Caddyfile) | Site hostname forwarded to the prerender service. Set to your domain, e.g. `"example.com"`. |
| `OSTR_AUTH` | environment variable | `Authorization` header value. Set via `OSTR_AUTH=Basic …` in the process environment or `caddy.service`. Can also be defined with `vars` in the Caddyfile (see §2). |
| `{uri}` | Caddy placeholder | Full request URI including path and query string. Used in the prerender rewrite so the service receives the complete URL. |
| `{path}` | Caddy placeholder | Request path **without** query string. Use instead of `{uri}` when your project does not rely on query strings for routing (see §3 below). |
| `{http.request.header.User-Agent}` | Caddy placeholder | Original request User-Agent forwarded to the prerender service. |

Example variable declarations inside a site block:

```caddy
example.com {
  # Forwarded to the prerender service to reconstruct the full URL.
  # {uri} is always resolved dynamically from the incoming request.
  vars OSTR_SCHEME "https"
  vars OSTR_HOST   "example.com"
  ...
}
```

### `{uri}` vs `{path}` in the prerender rewrite

The prerender rewrite in all examples uses `{uri}` by default:

```caddy
rewrite /render/{vars.OSTR_SCHEME}://{vars.OSTR_HOST}{uri}
```

- **`{uri}`** — path + query string (e.g. `/page?lang=en`). Use this when your app uses query parameters for content routing, pagination, filters, or anything that should be reflected in the prerendered snapshot.
- **`{path}`** — path only, no query string (e.g. `/page`). Swap `{uri}` for `{path}` when your app does not use query strings for routing and you want cleaner prerender cache keys.

```caddy
rewrite /render/{vars.OSTR_SCHEME}://{vars.OSTR_HOST}{path}
```

Each `.caddyfile` example includes a comment at the rewrite line as a reminder.

### Reusable matcher pattern

All example configs use the same matcher shape:

- `@static_assets` – skips typical static assets
- `@query_fragment` – route URLs that include `_escaped_fragment_`
- `@is_bot` – route requests from crawler user-agents

A shared rendering upstream is:

- `https://render.ostr.io` (default)
- `https://render-bypass.ostr.io` (debug/testing)
- `https://render-cache.ostr.io` (aggressive cache)

## 4. Setup by stack

Pick the example that matches your stack and place it in Caddyfile.

### 4.1 Node.js / Next.js and alike

`docs/prerendering/examples/caddy/node-nextjs.caddyfile`

Use this when your Node app runs on HTTP (Express, Next.js, Nuxt, Remix, etc.).

### 4.2 PHP and alike

`docs/prerendering/examples/caddy/php.caddyfile`

Use this for `php-fpm` apps, WordPress-like stacks, Laravel, Drupal, or Symfony.

### 4.3 Python/Django and alike

`docs/prerendering/examples/caddy/django.caddyfile`

Use this for Django, Flask, FastAPI (or any Python HTTP app behind reverse proxy).

### 4.4 Static sites

`docs/prerendering/examples/caddy/static.caddyfile`

Use this if pages are mostly static files but crawler-friendly prerender is still required
for SEO on JS-heavy entry pages.

## 5. Other popular framework examples

`docs/prerendering/examples/caddy/other-frameworks.caddyfile`

Contains additional real-world examples for:

- Ruby on Rails
- Go apps behind reverse proxy

Use these as pattern starters for any framework with a single upstream endpoint.

## 6. Verify deployment

### A. Check prerender response header

```bash
curl -I -A "Googlebot" https://example.com/
```

Expect `X-Prerender-Id` in headers for crawler traffic.

### B. Check legacy hash-fragment query handling

```bash
curl -I "https://example.com/?_escaped_fragment_=/"
```

Expect `X-Prerender-Id` in headers for crawler traffic.

### C. Check app traffic bypass

```bash
curl -I "https://example.com/"
```

For non-crawler traffic, response should be from your app server without `X-Prerender-Id` header.

### D. Optional endpoint test

Use the `render-bypass.ostr.io` endpoint temporarily if you suspect cached results. See the full list of rendering endpoints and their behaviour in the [ostr.io rendering endpoints documentation](https://docs.ostr.io/prerendering/rendering-endpoints). Swap `OSTR_AUTH` and endpoint only in a temporary staging config first.

## 7. Notes

- If you use a CDN in front of Caddy, keep your bot detection and token in Caddy, not in CDN logic.
- Keep websocket routes out of prerender matchers (`Connection: Upgrade` / `Upgrade: websocket`).
- **Core Web Vitals (LCP, FCP, TBT):** Search engine crawlers measure page performance during indexing. Delivering fully rendered HTML via the prerender service eliminates JavaScript parse and execution time for crawlers, resulting in faster perceived load and better LCP/FCP scores in Google Search Console.
- **Structured data and meta tags:** Client-side frameworks often inject `<meta>`, JSON-LD, and Open Graph tags after JavaScript execution. Pre-rendering ensures these tags are present in the HTML delivered to crawlers, improving rich-result eligibility and social preview accuracy.
- **Crawl budget:** Googlebot and other crawlers have a finite crawl budget per domain. Serving prerendered HTML directly avoids the overhead of headless-browser rendering on the crawler side, allowing more pages to be crawled and indexed within the same budget window.
- **JavaScript-heavy SPAs:** Single-page applications built with React, Vue, Angular, or similar frameworks are invisible to crawlers that do not execute JavaScript. Pre-rendering at the server level (via Caddy + ostr.io) makes every route fully indexable without changing the application code.
- **Consistent canonical signals:** Because the prerender service receives the full URL (including query string via `{uri}`), canonical tags and hreflang attributes rendered by the app are preserved in the snapshot, reducing the risk of duplicate-content issues.
