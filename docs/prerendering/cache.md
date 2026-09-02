# Pre-rendering: Caching

All pre-rendering engine results are cached by default. Cache TTL can be changed in the pre-rendering settings, individually per host.

## Why cache results?

Caching offloads your origin, saves bandwidth, and speeds up sequential requests to the same pages by web crawlers — resulting in a better SEO score for your website.

Requests served from cache are **not** billed, making pre-rendering cheaper the more it is used.

## Cache TTL

Cache TTL is set per host and ranges from **2232 hours (93 days)** down to a plan-specific floor: **4 hours** (hobby), **2 hours** (pro), or **0 hours** (business).

![Set Pre-rendering Cache TTL screenshot](./prerendering-cache.png)

## Cache purging

Full cache purges are limited to once per 2 hours, but any specific page can be purged individually at any moment. See [cache purging](cache-purge.md) for details.

## Related

- [Rendering endpoints](rendering-endpoints.md) — caching behavior per endpoint
- [Cache purge](cache-purge.md)
