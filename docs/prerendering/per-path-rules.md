# Per-Path Rules

Configure pre-rendering behavior on a per-path basis — choose which paths get pre-rendered, strip query parameters, force pre-rendering for non-bot requests, and select the cache mode.

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
- Case-insensitive
- Examples:
  - `/admin/*` matches `/admin/`, `/admin/users`, `/admin/users/create`, etc.
  - `/products/*` matches `/products/laptop`, `/products/monitor`, etc.
  - `/api/*` matches `/api/users`, `/api/data`, etc.
  - `/search` matches only `/search` (exact)

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

Edit your Worker to include path rules. The example Worker already contains the parsing and evaluation logic:

```javascript
// In cloudflare.worker.js, define your rules:
const OSTR_PATH_RULES = `[
  {"match": "/admin/*", "render": false},
  {"match": "/docs/*", "force": true},
  {"match": "/search", "ignoreGetQuery": true},
  {"match": "/products/*", "stripParams": ["utm_*", "fbclid", "gclid"]},
  {"match": "/status/*", "endpoint": "render-bypass"}
]`;

// The Worker's buildPathRules() and matchRule() functions handle parsing and evaluation
const rule = matchRule(pathRulesFor(OSTR_PATH_RULES), url.pathname.toLowerCase());
```

For the complete Worker example, see [`docs/prerendering/examples/cloudflare-worker/cloudflare.worker.js`](examples/cloudflare-worker/cloudflare.worker.js).

### Nginx

Map paths to pre-rendering behavior using `location` and `set` directives:

```nginx
location /admin/ {
  # Skip pre-rendering for admin paths
  set $prerender 0;
}

location /docs/ {
  # Force pre-rendering
  set $force_prerender 1;
}

location /products/ {
  # Use aggressive cache
  set $prerender_endpoint "render-cache";
}

# Main pre-rendering check
if ($prerender = 1) {
  proxy_pass http://prerender.ostr.io/?url=$scheme://$http_host$request_uri;
}
```

For a complete Nginx example, see [`docs/prerendering/nginx.md`](nginx.md).

### Apache

Use `RewriteCond` to match paths and set environment variables:

```apache
# Skip pre-rendering for admin paths
RewriteCond %{REQUEST_URI} ^/admin/
RewriteRule ^(.*)$ - [env=skip_prerender:1,L]

# Force pre-rendering for docs
RewriteCond %{REQUEST_URI} ^/docs/
RewriteRule ^(.*)$ - [env=force_prerender:1,L]
```

For a complete Apache example, see [`docs/prerendering/apache.md`](apache.md).

### Next.js Middleware

Add path-based logic to your `middleware.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const userAgent = request.headers.get('User-Agent') || '';
  
  // Skip pre-rendering for admin paths
  if (pathname.startsWith('/admin/')) {
    return NextResponse.next();
  }
  
  // Force pre-rendering for /docs even if not a bot
  if (pathname.startsWith('/docs/')) {
    // Forward to pre-rendering endpoint
  }
  
  // Strip tracking params for /products
  if (pathname.startsWith('/products/')) {
    const url = request.nextUrl;
    url.searchParams.delete('utm_source');
    url.searchParams.delete('utm_medium');
    // Forward modified URL
  }
}
```

For a complete Next.js example, see [`docs/prerendering/nextjs-prerendering.md`](nextjs-prerendering.md).

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
