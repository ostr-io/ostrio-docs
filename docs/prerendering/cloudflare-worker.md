# Cloudflare Worker Integration

<img width="1536" height="1024" alt="ostrio-prerendering-cloudflare-support" src="https://github.com/user-attachments/assets/b775192e-1d6b-49c7-925c-a17e60d97304" />

Cloudflare Workers are a great alternative to server-specific proxies (Nginx, Apache, Caddy, HAProxy) and app-specific middleware (NPM, PHP, Node.js, Django, and others). Pre-rendering runs at the edge, so your origin is untouched.

## When to use

- You control DNS and can place a Worker in front of your domain
- You want a single integration that spans multiple origins or stacks
- Your origin is on a platform that does not allow proxy/middleware customization (e.g. Shopify)

## Worker examples

- [Step-by-step tutorial](examples/cloudflare-worker/coudflare-worker-guide.md)
- **Shopify** — [Cloudflare Worker integration](shopify-seo-integration.md#seo-middleware-worker-for-shopify)
- *Modern and recommended:* [ES Module Worker](examples/cloudflare-worker/cloudflare.worker.js)
- *Legacy:* [Event Listener Worker](examples/cloudflare-worker/cloudflare-listener.worker.js)

## Related

- [Rendering endpoints](rendering-endpoints.md)
- [Crawler User-Agent regex](shared/crawler-ua-regex.md)
- [Static-asset extensions regex](shared/static-extensions-regex.md)
