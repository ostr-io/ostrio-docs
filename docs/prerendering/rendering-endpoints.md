# Rendering Endpoints

Three differently-configured pre-rendering endpoints are available. Pick one based on cache-tolerance and response-time requirements.

- **`render`** (*default*) — `https://render.ostr.io` — "optimal" settings that fit 98% of cases. Respects cache headers from both the crawler and your origin server.
- **`render-bypass`** (*devel / debug*) — `https://render-bypass.ostr.io` — bypasses intermediate caching (*almost no cache*). Use when experiencing issues or during development to rule out stale intermediate caches. Safe in production, but expect higher usage and response time.
- **`render-cache`** (*under attack*) — `https://render-cache.ostr.io` — aggressive intermediate caching. Use for the shortest response time when 6–12 hour staleness is acceptable.

To change the default endpoint, grab the [integration example code](https://github.com/veliovgroup/spiderable-middleware/tree/master/examples) and replace `render.ostr.io` with the endpoint of your choice. For NPM/Meteor integrations, change the [`serviceURL`](https://github.com/veliovgroup/spiderable-middleware#basic-usage) option.

> [!NOTE]
> The caching differences described above apply to **intermediate proxy caches** only. The `Cache-Control` header is always set to the value defined by *Cache TTL*. Cached results at the pre-rendering engine can be [purged at any time](cache-purge.md).
