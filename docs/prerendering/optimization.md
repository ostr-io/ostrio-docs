# Prerendering Optimization

## ToC:

- [Speed up rendering](https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/optimization.md#speed-up-rendering)
- [Nginx](https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/optimization.md#nginx)

### Speed up rendering

You should tell to the Prerendering engine when the page is fully rendered. It's can be easily done via `IS_RENDERED` variable located in the global scope.
`window.IS_RENDERED` should be defined and set to `false` at the very beginning of your page or application bundle script file, for example right in `head` tag:

```html
<html>
  <head>
    <script type="text/javascript">
      window.IS_RENDERED = false;
    </script>
  </head>
</html>
```

After the page is fully rendered and filled with data, set `IS_RENDERED` to `true`:

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

It is a good idea to set a timeout, for the case if the page wasn't rendered in an expected period of time (*due to an error or bad application logic*):

```js
setTimeout(function () {
  window.IS_RENDERED = true;
}, 6000);
```

### Nginx

If you're using Nginx integration for Prerendering and default settings doesn't satisfy you, you may want to do precise tuning with next directives:

```nginx
http {
  # Enable caching
  proxy_cache_path /var/lib/nginx/cache levels=1:2 keys_zone=backcache:10m max_size=5G inactive=60m use_temp_path=off;

  location @prerendering {
    # Enlarge this directives in case of 408 errors
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
}
```

## Further reading

- [Content optimization for different crawlers](https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/detect-prerendering.md)
