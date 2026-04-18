# Nginx Integration

ostr.io pre-rendering SEO Middleware serves rendered HTML to search engines, social preview bots, and AI crawlers. Nginx integration keeps application code unchanged: Nginx detects crawler traffic and internally proxies matching page requests to ostr.io renderer.

- [Pre-rendering overview](README.md)
- [Rendering endpoints](rendering-endpoints.md)
- [Complete Nginx examples](examples/nginx/)

## Contents

- [How it Works](#how-it-works)
- [Quick Start](#quick-start)
- [Shared Building Blocks](#shared-building-blocks)
- [Minimal Integration Pattern](#minimal-integration-pattern)
- [Choose Example](#choose-example)
- [Validation](#validation)

## How it Works

Nginx pre-rendering integration has four parts:

1. Detect bots with `map $http_user_agent $is_webbot`.
2. Preserve legacy `_escaped_fragment_` support with `$fragment` and `$filtered_args`.
3. Route matching page requests to internal `@prerendering` with custom status `454`.
4. Proxy `@prerendering` to ostr.io renderer with your auth token.

Static files, APIs, admin routes, health checks, feeds, sitemaps, websocket upgrades, and unsafe request methods should stay on origin. Stack-specific `.conf` examples include those exclusions.

## Quick Start

1. Add shared `map` directives to `http` context.
2. Add `recursive_error_pages on;` and `error_page 454 = @prerendering;` to `server` context.
3. Add bot and `_escaped_fragment_` checks to page route.
4. Add internal `location @prerendering`.
5. Replace `_YOUR_AUTH_TOKEN_` with token from ostr.io.
6. Run `nginx -t`, reload Nginx, test bot traffic.

## Shared Building Blocks

### Bot and Fragment Maps

Place these maps in `http` context. They create variables used by all examples.

```nginx
# Comprehensive crawler, social preview, and AI bot User-Agent regular expression.
map $http_user_agent $is_webbot {
  default 0;
  "~*(?:\.net crawler|360spider|50\.nu|8bo crawler bot|aboundex|accoona|adldxbot|ahrefsbot|altavista|appengine-google|applebot|archiver|arielisbot|ask jeeves|auskunftbot|baidumobaider|baiduspider|becomebot|bingbot|bingpreview|bitbot|bitlybot|blitzbot|blogbridge|boardreader|botseer|catchbot|catchpoint bot|charlotte|checklinks|cliqzbot|clumboot|coccocbot|converacrawler|crawl-e|crawlconvera|dataparksearch|daum|deusu|discordbot|dotbot|duckduckbot|elefent|embedly|evernote|exabot|facebookbot|facebookexternalhit|meta-external|fatbot|fdse robot|feed seeker bot|feedfetcher|femtosearchbot|findlinks|flamingo_searchengine|flipboard|followsite bot|furlbot|fyberspider|gaisbot|galaxybot|geniebot|genieo|gigablast|gigabot|girafabot|gomezagent|gonzo1|googlebot|google sketchup|adsbot-google|google-structured-data-testing-tool|google-extended|developers\.google\.com/\+/web/snippet|haosouspider|heritrix|holmes|hoowwwer|htdig|ia_archiver|idbot|infuzapp|innovazion crawler|instagram|internetarchive|iqdb|iskanie|istellabot|izsearch\.com|kaloogabot|kaz\.kz_bot|kd bot|konqueror|kraken|kurzor|larbin|leia|lesnikbot|linguee bot|linkaider|linkapediabot|linkedinbot|lite bot|llaut|lookseek|lycos|mail\.ru_bot|masidani_bot|masscan|mediapartners-google|metajobbot|mj12bot|mnogosearch|mogimogi|mojeekbot|motominerbot|mozdex|msiecrawler|msnbot|msrbot|netpursual|netresearch|netvibes|newsgator|ng-search|nicebot|nutchcvs|nuzzel|nymesis|objectssearch|odklbot|omgili|oovoo|oozbot|openfosbot|orangebot|orbiter|org_bot|outbrain|pagepeeker|pagesinventory|parsijoobot|paxleframework|peeplo screenshot bot|pinterest|plantynet_webrobot|plukkie|pompos|psbot|quora link preview|qwantify|read%20later|reaper|redcarpet|redditbot|retreiver|riddler|rival iq|rogerbot|saucenao|scooter|scrapy|scrubby|searchie|searchsight|seekbot|semanticdiscovery|seznambot|showyoubot|simplepie|simpy|sitelockspider|skypeuripreview|petalbot|slackbot|slack-imgproxy|slurp|snappy|sogou|solofield|speedyspider|speedy spider|sputnikbot|stackrambler|teeraidbot|teoma|theusefulbot|thumbshots\.ru|thumbshotsbot|tineye|tiktokspider|toweya\.com|toweyabot|tumblr|tweetedtimes|tweetmemebot|twitterbot|url2png|vagabondo|vebidoobot|viber|visionutils|vkshare|voilabot|vortex|votay bot|voyager|w3c_validator|wasalive\.bot|web-sniffer|websquash\.com|webthumb|whatsapp|whatweb|wire|wotbox|yacybot|yahoo|yandex|yeti|yisouspider|yodaobot|yooglifetchagent|yoozbot|yottaamonitor|yowedo|zao-crawler|zebot_www\.ze\.bz|zooshot|zyborgi|ai2bot|amazonbot|anthropic\.com|bard|bytespider|ccbot|chatgpt-user|claude-web|claudebot|cohere-ai|deepseek|diffbot|duckassistbot|gemini|gptbot|grok|mistralai|oai-searchbot|openai\.com|perplexity\.ai|perplexitybot|xai|youbot)" 1;
}

# Legacy escaped-fragment support.
map $arg__escaped_fragment_ $fragment {
  "" "";
  default "/$arg__escaped_fragment_";
}

# Remove _escaped_fragment_ from forwarded query string.
map $args $filtered_args {
  ~(^|&)_escaped_fragment_=[^&]*&?(.*) $1$2;
  default $args;
}
```

The same regex appears in every complete example under [`examples/nginx/`](examples/nginx/); update all instances together when adding or removing crawlers.

### Optional Safety Maps

Use these maps for production configs that must avoid rendering non-page traffic.

```nginx
map $request_method $is_prerender_method {
  default 0;
  GET 1;
  HEAD 1;
}

map $http_upgrade $is_upgrade_request {
  default 1;
  "" 0;
}

map $uri $is_prerender_uri {
  default 1;
  ~^/(?:api|admin|auth|oauth|internal|metrics|debug|webhooks?)(?:/|$) 0;
  ~^/(?:health|healthz|livez|readyz|readiness|liveness|status)(?:/|$) 0;
  ~^/(?:robots\.txt|favicon\.ico)$ 0;
  ~^/(?:sitemap(?:_index)?|sitemap).*\.xml$ 0;
  ~^/[^/]+-sitemap[0-9]*\.xml$ 0;
  ~^/(?:feed|rss)(?:/|$) 0;
}

map "$is_webbot:$is_prerender_method:$is_prerender_uri:$is_upgrade_request" $prerender_webbot {
  default 0;
  "1:1:1:0" 1;
}

map "$args:$is_prerender_method:$is_prerender_uri:$is_upgrade_request" $prerender_fragment {
  default 0;
  ~(^|.*&)_escaped_fragment_=[^&]*(?:&.*)?:1:1:0$ 1;
}
```

Adjust `$is_prerender_uri` exclusions for framework-specific routes. See [Node.js](examples/nginx/node.conf), [Laravel](examples/nginx/laravel.conf), and [WordPress](examples/nginx/wordpress.conf) for practical variants.

### Static Files

Serve assets directly from Nginx before page routing so bots do not trigger the renderer for CSS, JS, images, fonts, PDFs, archives, or media files. Use the canonical extension list in every complete example:

```nginx
location ~* \.(?:3ds|3g2|3gp|3gpp|7z|a|aac|aaf|adp|ai|aif|aiff|alz|ape|apk|appcache|ar|arj|asf|asx|atom|au|avchd|avi|bak|bbaw|bh|bin|bk|bmp|btif|bz2|bzip2|cab|caf|cco|cgm|class|cmx|cpio|cr2|crt|crx|css|csv|cur|dat|deb|der|dex|djvu|dll|dmg|dng|doc|docm|docx|dot|dotm|dra|drc|DS_Store|dsk|dts|dtshd|dvb|dwg|dxf|ear|ecelp4800|ecelp7470|ecelp9600|egg|eol|eot|eps|epub|exe|f4a|f4b|f4p|f4v|fbs|fh|fla|flac|fli|flv|fpx|fst|fvt|g3|geojson|gif|graffle|gz|gzip|h261|h263|h264|hqx|htc|ico|ief|img|ipa|iso|jad|jar|jardiff|jng|jnlp|jpeg|jpg|jpgv|jpm|js|jxr|key|kml|kmz|ktx|less|lha|lvp|lz|lzh|lzma|lzo|m2v|m3u|m4a|m4p|m4v|map|manifest|mar|markdown|md|mdi|mdown|mdwn|mht|mid|midi|mj2|mka|mkd|mkdn|mkdown|mkv|mml|mmr|mng|mobi|mov|movie|mp2|mp3|mp4|mp4a|mpe|mpeg|mpg|mpga|mpv|msi|msm|msp|mxf|mxu|nef|npx|nsv|numbers|o|oex|oga|ogg|ogv|opus|otf|pages|pbm|pcx|pdb|pdf|pea|pem|pgm|pic|pl|pm|png|pnm|pot|potm|potx|ppa|ppam|ppm|pps|ppsm|ppsx|ppt|pptm|pptx|prc|ps|psd|pya|pyc|pyo|pyv|qt|ra|rar|ras|raw|rdf|rgb|rip|rlc|rm|rmf|rmvb|ron|roq|rpm|rss|rtf|run|rz|s3m|s7z|safariextz|scpt|sea|sgi|shar|sil|sit|slk|smv|so|sub|svg|svgz|svi|swf|tar|tbz|tbz2|tcl|tga|tgz|thmx|tif|tiff|tk|tlz|topojson|torrent|ttc|ttf|txt|txz|udf|uvh|uvi|uvm|uvp|uvs|uvu|vcard|vcf|viv|vob|vtt|war|wav|wax|wbmp|wdp|weba|webapp|webm|webmanifest|webp|whl|wim|wm|wma|wml|wmlc|wmv|wmx|woff|woff2|wvx|xbm|xif|xla|xlam|xloc|xls|xlsb|xlsm|xlsx|xlt|xltm|xltx|xm|xmind|xpi|xpm|xsl|xwd|xz|yuv|z|zip|zipx)$ {
  expires 30d;
  add_header Cache-Control "public, max-age=2592000, immutable";

  access_log off;
  log_not_found off;
  try_files $uri =404;
}
```

Use examples:

- Static website: [`static.conf`](examples/nginx/static.conf)
- Node.js or Go app: [`node.conf`](examples/nginx/node.conf), [`go.conf`](examples/nginx/go.conf)
- PHP/Laravel/WordPress: [`php-fpm.conf`](examples/nginx/php-fpm.conf), [`laravel.conf`](examples/nginx/laravel.conf), [`wordpress.conf`](examples/nginx/wordpress.conf)

## Minimal Integration Pattern

This minimal pattern shows directive flow. Use complete `.conf` files for production hardening.

```nginx
server {
  listen 80;
  listen [::]:80;
  server_name example.com;

  root /path/to/public;
  index index.html;

  recursive_error_pages on;
  error_page 454 = @prerendering;

  location / {
    if ($is_webbot = 1) {
      return 454;
    }

    if ($args ~ _escaped_fragment_) {
      return 454;
    }

    try_files $uri $uri/ /index.html;
  }

  location @prerendering {
    internal;

    set $renderer_domain "render.ostr.io";
    set $orig_uri $request_uri;

    if ($orig_uri ~ "^(.*)\?(.*)$") {
      set $orig_uri $1;
    }

    if ($http_upgrade) {
      return 450;
    }

    proxy_pass_request_headers off;
    proxy_hide_header WWW-Authenticate;
    proxy_hide_header Set-Cookie;

    proxy_set_header Host $renderer_domain;
    proxy_set_header User-Agent $http_user_agent;
    proxy_set_header Connection "close";
    proxy_set_header Authorization "Basic _YOUR_AUTH_TOKEN_";

    proxy_http_version 1.0;
    proxy_ssl_server_name on;

    resolver 1.1.1.1 8.8.4.4 8.8.8.8 1.0.0.1 valid=300s;
    resolver_timeout 15s;

    sendfile off;
    proxy_pass https://$renderer_domain/render/https://$host$orig_uri$fragment$is_args$filtered_args;
  }
}
```

Core directives:

- `map` creates request classification variables before location matching.
- `error_page 454 = @prerendering` converts local `return 454` into internal redirect.
- `location /` decides whether request goes to origin or renderer.
- `location @prerendering` is internal only and proxies renderer request.
- `proxy_set_header Authorization` authenticates request with ostr.io.
- `proxy_pass` builds renderer URL from original host, path, fragment, and filtered query.

## Choose Example

Pick closest config, then adapt `server_name`, `root`, upstream/socket, excluded routes, and auth token.

| Use case | Start with | Notes |
| --- | --- | --- |
| Static SPA/site: Astro, Vite, Hugo, Gatsby, Eleventy, static Next.js/SvelteKit | [`static.conf`](examples/nginx/static.conf) | Serves files from disk, falls back to `index.html`, keeps sitemaps/feeds/health on origin. |
| Generic upstream app: Rails, custom HTTP backend, multiple instances | [`upstream.conf`](examples/nginx/upstream.conf) | Uses `@application`, upstream pool, custom `450`/`454` redirects. |
| Node.js: Express, Fastify, Koa, NestJS, h3 | [`node.conf`](examples/nginx/node.conf) | Includes websocket upgrade headers and Node-specific route exclusions. |
| Django: Gunicorn or Uvicorn | [`django.conf`](examples/nginx/django.conf) | Serves `STATIC_ROOT` and `MEDIA_ROOT`, proxies dynamic traffic. |
| Go HTTP app: net/http, Gin, Echo, Chi | [`go.conf`](examples/nginx/go.conf) | Uses Go upstream, common API/health/sitemap exclusions. |
| Laravel with PHP-FPM | [`laravel.conf`](examples/nginx/laravel.conf) | Uses `public` root, front controller, Laravel admin/auth/API exclusions. |
| WordPress with PHP-FPM | [`wordpress.conf`](examples/nginx/wordpress.conf) | Keeps wp-admin, REST API, cron, comments, feeds, sitemaps on origin. |
| Generic PHP over HTTP: Octane, RoadRunner, Swoole, FrankenPHP, Docker | [`php.conf`](examples/nginx/php.conf) | Proxies to HTTP PHP process; not for FastCGI. |
| FastCGI/PHP-FPM app | [`php-fpm.conf`](examples/nginx/php-fpm.conf) | Uses `fastcgi_pass` and front-controller pattern. |
| Phusion Passenger | [`phusion-passenger.conf`](examples/nginx/phusion-passenger.conf) | Uses Passenger directives and renderer fallback. |

## Validation

Syntax check:

```shell
nginx -t
```

Bot request should hit renderer path:

```shell
curl -I -A "Googlebot" https://example.com/some-page
```

Normal browser request should stay on origin:

```shell
curl -I -A "Mozilla/5.0" https://example.com/some-page
```

Escaped-fragment request should hit renderer path:

```shell
curl -I "https://example.com/some-page?_escaped_fragment_="
```

If response is wrong, check in this order:

1. `map` directives live in `http` context, not `server` or `location`.
2. `error_page 454 = @prerendering;` exists in `server` context.
3. Static files, APIs, admin routes, health checks, sitemaps, and feeds are excluded before page rendering.
4. `_YOUR_AUTH_TOKEN_` is replaced.
5. Resolver works from Nginx host.
6. Application upstream still handles normal browser traffic.
