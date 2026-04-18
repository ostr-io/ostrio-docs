# Prerendering Cache Purging

## Full cache purging:

In the case of significant changes on a website, cached results can be purged. Full cache purging available once per 2 hours.

![Purge Full Pre-rendering Cache Screenshot](https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/prerendering-cache-purge.png?raw=true)

## Individual page cache purge:

While full cache purging is limited by time-frame. The individually cached page can be purged anytime without limits. To purge single page from cache "Cache ID" has to be obtained in response headers as `X-Prerender-Id`.

<table><tbody><tr>
  <td>
    <img src="https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/prerendering-cache-id.png?raw=true" alt="Prerendering Id Header Screenshot">
  </td>
  <td>
    <img src="https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/prerendering-cache-purge-single.png?raw=true" alt="Purge Single Page from Prerendering Cache Screenshot">
  </td>
</tr></tbody></table>

## Purge aggressively cached pages

The reason why you may not found `x-prerender-id` header in DevTools is aggressive caching headers or usage of ServiceWorker or AppCache, to avoid this issue please follow next steps (*in Chrome, Opera, Brave, and other Chromium-based browser*):

1. Open new **Private** window
2. Open URL with appended `?_escaped_fragment_=`
3. Open "Developer Tools"
4. In "Developer Tools" go to "Network" tab
5. Check "Disable Cache" checkbox
6. Reload/Refresh page
7. In "Network" tab select `/?_escaped_fragment_=` document (*should be the first*)
8. In opened area make sure "Header" tab is selected
9. In "Response Headers" section find `x-prerender-id` header

## Notes:

While cache is purged from Pre-rendering engine it may remain cached in intermediate caching layers from few minutes to several days, it depends on selected "Cache TTL" and [rendering endpoint](https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/rendering-endpoints.md).
