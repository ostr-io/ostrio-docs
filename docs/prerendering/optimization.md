# Pre-rendering Optimization

## Contents

- [Speed up rendering](#speed-up-rendering)
- [Nginx tuning](#nginx-tuning)
- [Further reading](#further-reading)

## Speed up rendering

Tell the pre-rendering engine when the page is fully rendered via the `window.IS_RENDERED` global variable. Define it as `false` at the very beginning of your page or application bundle script — ideally inside the `<head>` tag:

```html
<html>
  <head>
    <script type="text/javascript">
      window.IS_RENDERED = false;
    </script>
  </head>
</html>
```

After the page is fully rendered and populated with data, set `IS_RENDERED` to `true`:

```html
<html>
  <head>
    <script type="text/javascript">
      window.IS_RENDERED = false;
    </script>
  </head>
  <body>
    <script type="text/javascript">
      asyncFunc(function (err, res) {
        // More synchronous code here
        window.IS_RENDERED = true;
      });
    </script>
  </body>
</html>
```

It is a good idea to set a safety timeout in case the page never finishes rendering (*due to an error or bad application logic*):

```js
setTimeout(function () {
  window.IS_RENDERED = true;
}, 6000);
```

## Nginx tuning

If the default Nginx integration settings do not satisfy your use case, tune with the following directives.

Place `proxy_cache_path` in the `http` context, and the `location`-scoped directives inside your existing `location @prerendering` block.

```nginx
# http context
proxy_cache_path /var/lib/nginx/cache levels=1:2 keys_zone=backcache:10m max_size=5G inactive=60m use_temp_path=off;
```

```nginx
# inside server { ... } block
location @prerendering {
  # Enlarge these directives in case of 408 errors
  proxy_read_timeout    25s;
  proxy_send_timeout    35s;
  proxy_connect_timeout 45s;

  # Disable buffering
  proxy_request_buffering off;
  proxy_buffering         off;
  proxy_buffers           256 8k;
  proxy_buffer_size       8k;
  proxy_busy_buffers_size 64k;

  # Enable caching
  proxy_cache            backcache;
  proxy_cache_use_stale  error timeout http_404 http_500 http_502 http_503 http_504;
  proxy_cache_key        "$scheme$request_method$host$request_uri";
  proxy_cache_valid      200 301 302 10m;
  proxy_cache_valid      404 2m;
  proxy_cache_valid      any 1m;
  proxy_cache_lock       on;
  proxy_cache_revalidate on;
  proxy_cache_bypass     $http_pragma $http_upgrade;
  proxy_cache_min_uses   2;

  # Cache for descriptors
  open_file_cache          max=1024 inactive=12h;
  open_file_cache_valid    12h;
  open_file_cache_min_uses 2;
  open_file_cache_errors   off;
}
```

## Further reading

- [Nginx integration](nginx.md)
- [Detect pre-rendering engine requests](detect-prerendering.md) — content optimization for different crawlers
- [Rendering endpoints](rendering-endpoints.md)
