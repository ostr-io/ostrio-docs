Rendering Endpoints
======

- __render (*default*)__ - `https://render.ostr.io` - This endpoint has "optimal" settings, and should fit 98% cases. Respects cache headers of both Crawler and your server;
- __render-bypass (*devel/debug*)__ - `https://render-bypass.ostr.io` - This endpoint has bypass caching mechanism (*almost no cache*). Use it if you're experiencing an issue, or during development, to make sure you're not running into the intermediate cache. You're safe to use this endpoint in production, but it may result in higher usage and response time.
- __render-cache (*under attack*)__ - `https://render-cache.ostr.io` - This endpoint has the most aggressive caching mechanism. Use it if you're looking for the shortest response time, and don't really care about outdated pages in cache for 6-12 hours

To change default endpoint, grab [integration examples code](https://github.com/veliovgroup/spiderable-middleware/tree/master/examples) and replace `render.ostr.io`, with endpoint of your choice. For NPM/Meteor integration change value of [`serviceURL`](https://github.com/veliovgroup/spiderable-middleware#basic-usage) option.

__Note:__ Described differences in caching behavior is only about intermediate proxy caching, `Cache-Control` header will be always set to the value defined in "Cache TTL". Cached results at the "Prerendering Engine" end can be [purged at any time](https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/cache-purge.md).
