# Per-Path Rules

Configure pre-rendering behavior on a per-path basis: add exceptions while all pages pre-render, or switch the domain to pre-render only listed paths. Rules can also strip query parameters, force pre-rendering for non-crawler requests, and select the cache mode.

## Contents

- [Overview](#overview)
- [Modes](#modes)
- [Rule Semantics](#rule-semantics)
- [Rule Keys](#rule-keys)
- [Implementation](#implementation)
- [Examples](#examples)
- [Important Notes](#important-notes)

## Overview

Per-path rules let you fine-tune pre-rendering on specific URL patterns within your domain. By default, unmatched pages still pre-render. Rules act as exceptions unless you switch the domain to "Listed paths only."

For example:

- Skip pre-rendering for admin pages or API endpoints.
- Force pre-rendering for marketing pages even when accessed by browsers.
- Strip tracking parameters from specific pages.
- Use aggressive caching for high-traffic product pages and bypass caching for status endpoints.

Rules are **evaluated first match wins**: the first matching rule applies, and later rules are ignored for that request.

## Modes

The dashboard's **Pre-rendering scope** setting has two modes:

- **All pages** is the default. A page with no matching rule pre-renders for crawlers. Use `render: false` rules to pass specific paths through to your origin.
- **Listed paths only** pre-renders only paths matched by a rule whose `render` value is not `false`. Every unmatched path passes through to your origin. Add at least one pre-render rule before switching modes.

In "Listed paths only," ostr.io appends an internal terminal `{"match":"/*","render":false}` rule to the Worker binding. It is not stored in your rule list or shown as a dashboard chip. The dashboard caps your own list at 63 rules in this mode so the terminal rule remains inside the Worker's 64-rule limit.

Always Green scans, cache-expiry refreshes, the signals API, and the **Render whole site** tool follow the same effective rules. Excluded pages are not rendered ahead of time.

For a self-managed Worker, add the terminal `render: false` rule yourself to get equivalent behavior.

## Rule Semantics

Path matching uses **glob patterns** (not regular expressions):

- `*` matches any sequence of characters
- Anchored at the start of the path
- No end-anchor — patterns match as a prefix of the path
- Case-insensitive
- Examples:
  - `/admin/*` matches `/admin/`, `/admin/users`, `/admin/users/create`, etc.
  - `/products/*` matches `/products/laptop`, `/products/monitor`, etc.
  - `/api/*` matches `/api/users`, `/api/data`, etc.
  - `/search` matches `/search`, `/searching`, `/search/page`, and any path starting with `/search` (prefix match, no end-anchor)

## Rule Keys

Each rule is an object with the following allowed keys:

| Key | Type | Description |
|-----|------|-------------|
| `match` | string | **Required.** Path glob pattern. Maximum 256 characters. |
| `render` | boolean | If `false`, skip pre-rendering and pass through to origin. |
| `force` | boolean | If `true`, pre-render even for non-bot requests (browser user-agents). |
| `ignoreGetQuery` | boolean | If `true`, drop query parameters before forwarding to pre-rendering. If `false`, keep them. |
| `stripParams` | array | Array of parameter names or patterns to remove from the query string (e.g., `["utm_*", "fbclid", "gclid"]`). Patterns ending with `*` are prefix matches. |
| `endpoint` | string | Cache mode: `render` (default), `render-cache` (aggressive caching), or `render-bypass` (no caching). |

## Implementation

### Cloudflare Worker (Plan 3 OAuth Installs)

If you connected pre-rendering through ostr.io's one-click Cloudflare Worker setup, edit rules in the **ostr.io dashboard**. Open your domain's pre-rendering settings and locate the Cloudflare card. The "Path rules" editor adds one path pattern at a time as either **pre-render** or **pass through**. Use the adjacent **Pre-rendering scope** row to switch between "All pages" and "Listed paths only."

The Worker receives the effective rules through the `OSTR_PATH_RULES` binding and evaluates them on every request. No Worker code changes are needed.

### Manual Cloudflare Worker

If you manage your own Cloudflare Worker code, add per-path-rule logic by implementing path matching and rule evaluation. The managed Cloudflare Worker template (included in Plan 3 OAuth installs) contains the full `pathRulesFor()` and `matchRule()` implementation. For a self-managed Worker, refer to the template's logic in [`examples/cloudflare-worker/cloudflare.managed.worker.js`](examples/cloudflare-worker/cloudflare.managed.worker.js) and port the pattern-matching and rule-evaluation functions to your own code.

### Nginx, Apache, and Application-Level Integrations

For per-path routing in Nginx, Apache, Next.js, and other stacks, follow the canonical integration guides linked below. Each guide covers how to route requests based on path patterns:

- **[Nginx Integration](nginx.md)** — use `location` blocks and `map` directives to route requests; see the "Shared Building Blocks" section for base configuration.
- **[Apache Integration](apache.md)** — use `RewriteCond` and environment variables to route requests conditionally.
- **[Next.js Integration](nextjs-prerendering.md)** — implement per-path logic in `middleware.ts` or use the `seo-middleware-nextjs` package, which supports path-based configuration.

For manual integrations not covered by a specific guide, implement per-path rules using the same pattern as the canonical configs: detect the path, check your rule set, and route or transform the request accordingly.

## Examples

### Pre-render only listed sections

In the dashboard, add `/blog/*` and `/docs/*` as **pre-render**, then switch to **Listed paths only**. The effective Worker list is:

```json
[
  {"match": "/blog/*", "render": true},
  {"match": "/docs/*", "render": true},
  {"match": "/*", "render": false}
]
```

The dashboard synthesizes the final rule. Add it yourself only in a self-managed Worker.

### Marketing site with tracking params

```json
[
  {"match": "/admin/*", "render": false},
  {"match": "/api/*", "render": false},
  {"match": "/blog/*", "stripParams": ["utm_*", "fbclid", "gclid"], "endpoint": "render-cache"},
  {"match": "/products/*", "stripParams": ["utm_*"], "endpoint": "render-cache"}
]
```

### SPA with forced pre-rendering

```json
[
  {"match": "/landing/*", "force": true},
  {"match": "/pricing", "force": true},
  {"match": "/api/*", "render": false},
  {"match": "/admin/*", "render": false}
]
```

### Varied cache modes

```json
[
  {"match": "/status/*", "endpoint": "render-bypass"},
  {"match": "/pricing", "endpoint": "render-cache"},
  {"match": "/products/*", "endpoint": "render-cache"},
  {"match": "/api/*", "render": false}
]
```

## Important Notes

**`loadImages`, `stripJS`, and TTL are per-domain, not per-path.** These settings are configured on the domain's pre-rendering dashboard and apply to all requests for that domain, regardless of path. Per-path rules cannot override them.

If a path requires different `loadImages` or `stripJS` behavior, create a separate domain or subdomain with its own settings.

**Query parameters are normalized before caching.** When you use `stripParams`, the normalized URL (with specified parameters removed) becomes the cache key. Two requests with different tracking parameters but the same normalized URL will share a cache entry.

**First match wins.** Once a path matches a rule, no subsequent rules are evaluated for that request. Order your rules from most specific to least specific.

**Unmatched behavior depends on the scope.** In "All pages," an unmatched path pre-renders. In "Listed paths only," an unmatched path passes through without pre-rendering.

## Related

- [Add Your Own Crawler User-Agent](shared/add-custom-crawler-ua.md)
- [Canonical Crawler User-Agent Regex](shared/crawler-ua-regex.md)
- [Cloudflare Worker Integration](cloudflare-worker.md)
- [Nginx Integration](nginx.md)
- [Apache Integration](apache.md)
- [Next.js Integration](nextjs-prerendering.md)
- [Rendering Endpoints and Cache Modes](rendering-endpoints.md)
