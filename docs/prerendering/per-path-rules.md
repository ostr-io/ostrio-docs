# Per-Path Rules

Configure pre-rendering behavior on a per-path basis — choose which paths get pre-rendered, strip query parameters, force pre-rendering for non-bot requests, and select the cache mode.

## Contents

- [Overview](#overview)
- [Rule Semantics](#rule-semantics)
- [Rule Keys](#rule-keys)
- [Implementation](#implementation)
- [Examples](#examples)
- [Important Notes](#important-notes)

## Overview

Per-path rules let you fine-tune pre-rendering on specific URL patterns within your domain. For example:

- Skip pre-rendering for admin pages or API endpoints.
- Force pre-rendering for marketing pages even when accessed by browsers.
- Strip tracking parameters from specific pages.
- Use aggressive caching for high-traffic product pages and bypass caching for status endpoints.

Rules are **evaluated first match wins** — the first matching rule applies, and later rules are ignored for that request.

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

If you connected pre-rendering through ostr.io's one-click Cloudflare Worker setup, edit your per-path rules in the **ostr.io dashboard**. Navigate to your domain's pre-rendering settings, locate the "Path rules" editor, and add your rules as JSON.

The Worker receives these rules via the `OSTR_PATH_RULES` binding and evaluates them on every request. No Worker code changes are needed.

### Manual Cloudflare Worker

If you manage your own Cloudflare Worker code, add per-path-rule logic by implementing path matching and rule evaluation. The managed Cloudflare Worker template (included in Plan 3 OAuth installs) contains the full `pathRulesFor()` and `matchRule()` implementation. For a self-managed Worker, refer to the template's logic in [`examples/cloudflare-worker/cloudflare.managed.worker.js`](examples/cloudflare-worker/cloudflare.managed.worker.js) and port the pattern-matching and rule-evaluation functions to your own code.

### Nginx, Apache, and Application-Level Integrations

For per-path routing in Nginx, Apache, Next.js, and other stacks, follow the canonical integration guides linked below. Each guide covers how to route requests based on path patterns:

- **[Nginx Integration](nginx.md)** — use `location` blocks and `map` directives to route requests; see the "Shared Building Blocks" section for base configuration.
- **[Apache Integration](apache.md)** — use `RewriteCond` and environment variables to route requests conditionally.
- **[Next.js Integration](nextjs-prerendering.md)** — implement per-path logic in `middleware.ts` or use the `seo-middleware-nextjs` package, which supports path-based configuration.

For manual integrations not covered by a specific guide, implement per-path rules using the same pattern as the canonical configs: detect the path, check your rule set, and route or transform the request accordingly.

## Examples

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

## Related

- [Add Your Own Crawler User-Agent](shared/add-custom-crawler-ua.md)
- [Canonical Crawler User-Agent Regex](shared/crawler-ua-regex.md)
- [Cloudflare Worker Integration](cloudflare-worker.md)
- [Nginx Integration](nginx.md)
- [Apache Integration](apache.md)
- [Next.js Integration](nextjs-prerendering.md)
- [Rendering Endpoints and Cache Modes](rendering-endpoints.md)
