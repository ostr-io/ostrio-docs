# Pre-rendering: Cache Purging

## Full cache purge

When significant changes happen on a website, cached results can be purged entirely. Full cache purge is available **once per 2 hours**.

![Purge full pre-rendering cache screenshot](./prerendering-cache-purge.png)

## Individual page cache purge

Full cache purge is rate-limited, but individual pages can be purged **any time, without limits**. To purge a single page, obtain its *Cache ID* from the response headers as `X-Prerender-Id`.

<table><tbody><tr>
  <td>
    <img src="./prerendering-cache-id.png" alt="Pre-rendering Id header screenshot">
  </td>
  <td>
    <img src="./prerendering-cache-purge-single.png" alt="Purge single page from pre-rendering cache screenshot">
  </td>
</tr></tbody></table>

## Purging aggressively-cached pages

The `X-Prerender-Id` header may be missing in DevTools because of aggressive client caching headers, a Service Worker, or AppCache. To work around this (*in Chrome, Opera, Brave, and other Chromium-based browsers*):

1. Open a new **Private** window
2. Open the URL with `?_escaped_fragment_=` appended
3. Open **Developer Tools**
4. Go to the **Network** tab
5. Enable **Disable Cache**
6. Reload / refresh the page
7. Select the `/?_escaped_fragment_=` document (*should be first*)
8. Open the **Headers** tab
9. Under **Response Headers**, find `x-prerender-id`

## Notes

When cache is purged from the pre-rendering engine, it may remain cached in intermediate caching layers for a few minutes up to several days, depending on your *Cache TTL* and [rendering endpoint](rendering-endpoints.md).
