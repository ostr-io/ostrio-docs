# Nginx Integration

ostr.io pre-rendering SEO Middleware delivers fully rendered HTML to search engines and modern AI crawlers, improving index coverage and discoverability while reducing origin load. The Nginx integration redirects bot's traffic to ostr.io pre-rendering engine.

- Learn more - [what is Pre-rendering and why you need it](https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/README.md)
- [Nginx config examples](https://github.com/ostr-io/ostrio-docs/tree/master/docs/prerendering/examples/nginx)

## ToC:

- [Installation](https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/nginx.md#installation)
- [Update HTML Markup](https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/nginx.md#update-html-markup)
- [Nginx integration](https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/nginx.md#nginx-integration-1)
    1. Prerequisite: [Map Variables](https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/nginx.md#map-module)
    2. Prerequisite: [Static files](https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/nginx.md#serve-static-files)
    3. Prerequisite: [Create pre-rendering directive](https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/nginx.md#pre-rendering-directive-location)
- [Nginx: Examples](https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/nginx.md#nginx-examples)
    - [Nginx: Basic integration](https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/nginx.md#basic-integration)
    - [Nginx: Phusion Passenger integration](https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/nginx.md#phusion-passenger-integration)
    - [Nginx: Basic upstream integration](https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/nginx.md#basic-upstream-integration)
    - [Nginx: FastCGI integration](https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/nginx.md#fastcgi-integration)
    - [Nginx: PHP integration](https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/nginx.md#php-integration)

## Installation

All you need is installed Nginx in the latest stable release.

## Update HTML Markup

To cause the special behavior of web crawlers on JavaScript powered websites use `fragment` meta tag. Although it's officially deprecated by Google search engine, it's may be used by other search engines and web crawlers. [Learn more](https://developers.google.com/webmasters/ajax-crawling/docs/specification):

```html
<html>
  <head>
    <meta name="fragment" content="!">
    <!-- ... -->
  </head>
  <body>
    <!-- ... -->
  </body>
</html>
```

## Nginx integration

Pre-rendering integration via Nginx is the most efficient and simple way to enable our service on a website. It doesn't require any changes in the application and has smallest footprint in compute and consumed resources.

### Map module

> [!IMPORTANT]
>
> 1. Use these `map` definitions on the `http` block level
> 2. `map` definitions must be defined for all NGINX configuration examples below

Use `map` module to check if request coming from bot and if request has `_escaped_fragment_` query. These three `map` definitions will set `$is_webbot`, `$fragment`, and `$filtered_args` variables that are used for pre-rendering logic

```nginx
# Edit bots User Agent regular expression when necessary
# This example includes most of the crawlers and AI Bots
# that were active for at least 5 past years
map $http_user_agent $is_webbot {
  default 0;
  "~*(?:\.net crawler|360spider|50\.nu|8bo crawler bot|aboundex|accoona|adldxbot|ahrefsbot|altavista|appengine-google|applebot|archiver|arielisbot|ask jeeves|auskunftbot|baidumobaider|baiduspider|becomebot|bingbot|bingpreview|bitbot|bitlybot|blitzbot|blogbridge|boardreader|botseer|catchbot|catchpoint bot|charlotte|checklinks|cliqzbot|clumboot|coccocbot|converacrawler|crawl-e|crawlconvera|dataparksearch|daum|deusu|discordbot|dotbot|duckduckbot|elefent|embedly|evernote|exabot|facebookbot|facebookexternalhit|meta-external|fatbot|fdse robot|feed seeker bot|feedfetcher|femtosearchbot|findlinks|flamingo_searchengine|flipboard|followsite bot|furlbot|fyberspider|gaisbot|galaxybot|geniebot|genieo|gigablast|gigabot|girafabot|gomezagent|gonzo1|googlebot|google sketchup|adsbot-google|google-structured-data-testing-tool|google-extended|developers\.google\.com/+/web/snippet|haosouspider|heritrix|holmes|hoowwwer|htdig|ia_archiver|idbot|infuzapp|innovazion crawler|instagram|internetarchive|iqdb|iskanie|istellabot|izsearch\.com|kaloogabot|kaz\.kz_bot|kd bot|konqueror|kraken|kurzor|larbin|leia|lesnikbot|linguee bot|linkaider|linkapediabot|linkedinbot|lite bot|llaut|lookseek|lycos|mail\.ru_bot|masidani_bot|masscan|mediapartners-google|metajobbot|mj12bot|mnogosearch|mogimogi|mojeekbot|motominerbot|mozdex|msiecrawler|msnbot|msrbot|netpursual|netresearch|netvibes|newsgator|ng-search|nicebot|nutchcvs|nuzzel|nymesis|objectssearch|odklbot|omgili|oovoo|oozbot|openfosbot|orangebot|orbiter|org_bot|outbrain|pagepeeker|pagesinventory|parsijoobot|paxleframework|peeplo screenshot bot|pinterest|plantynet_webrobot|plukkie|pompos|psbot|quora link preview|qwantify|read%20later|reaper|redcarpet|redditbot|retreiver|riddler|rival iq|rogerbot|saucenao|scooter|scrapy|scrubby|searchie|searchsight|seekbot|semanticdiscovery|seznambot|showyoubot|simplepie|simpy|sitelockspider|skypeuripreview|petalbot|slackbot|slack-imgproxy|slurp|snappy|sogou|solofield|speedyspider|speedy spider|sputnikbot|stackrambler|teeraidbot|teoma|theusefulbot|thumbshots\.ru|thumbshotsbot|tineye|tiktokspider|toweya\.com|toweyabot|tumblr|tweetedtimes|tweetmemebot|twitterbot|url2png|vagabondo|vebidoobot|viber|visionutils|vkshare|voilabot|vortex|votay bot|voyager|w3c_validator|wasalive\.bot|web-sniffer|websquash\.com|webthumb|whatsapp|whatweb|wire|wotbox|yacybot|yahoo|yandex|yeti|yisouspider|yodaobot|yooglifetchagent|yoozbot|yottaamonitor|yowedo|zao-crawler|zebot_www\.ze\.bz|zooshot|zyborgi|ai2bot|amazonbot|anthropic\.com|bard|bytespider|ccbot|chatgpt-user|claude-web|claudebot|cohere-ai|deepseek|diffbot|duckassistbot|gemini|gptbot|grok|mistralai|oai-searchbot|omgili|openai\.com|perplexity\.ai|perplexitybot|xai|youbot)" 1;
}

# CHECK AND SET ESCAPED FRAGMENT
# For more info read: https://developers.google.com/webmasters/ajax-crawling/docs/specification
map $arg__escaped_fragment_ $fragment {
  ""   "";
  default "/$arg__escaped_fragment_";
}

# FILTER OUT _escaped_fragment_ FROM GET QUERY
map $args $filtered_args {
  ~(^|&)_escaped_fragment_=[^&]*&?(.*) $1$2;
  default $args;
}
```

### Serve static files

Serve static files directly using Nginx

> [!IMPORTANT]
> This `location` directive is recommended for all NGINX configuration examples below and should be defined inside `server` block. It's mentioned only once to DRY examples below

```nginx
location ~* \.(?:3ds|3g2|3gp|3gpp|7z|a|aac|aaf|adp|ai|aif|aiff|alz|ape|apk|appcache|ar|arj|asf|asx|atom|au|avchd|avi|bak|bbaw|bh|bin|bk|bmp|btif|bz2|bzip2|cab|caf|cco|cgm|class|cmx|cpio|cr2|crt|crx|css|csv|cur|dat|deb|der|dex|djvu|dll|dmg|dng|doc|docm|docx|dot|dotm|dra|drc|DS_Store|dsk|dts|dtshd|dvb|dwg|dxf|ear|ecelp4800|ecelp7470|ecelp9600|egg|eol|eot|eps|epub|exe|f4a|f4b|f4p|f4v|fbs|fh|fla|flac|fli|flv|fpx|fst|fvt|g3|geojson|gif|graffle|gz|gzip|h261|h263|h264|hqx|htc|ico|ief|img|ipa|iso|jad|jar|jardiff|jng|jnlp|jpeg|jpg|jpgv|jpm|js|jxr|key|kml|kmz|ktx|less|lha|lvp|lz|lzh|lzma|lzo|m2v|m3u|m4a|m4p|m4v|map|manifest|mar|markdown|md|mdi|mdown|mdwn|mht|mid|midi|mj2|mka|mkd|mkdn|mkdown|mkv|mml|mmr|mng|mobi|mov|movie|mp2|mp3|mp4|mp4a|mpe|mpeg|mpg|mpga|mpv|msi|msm|msp|mxf|mxu|nef|npx|nsv|numbers|o|oex|oga|ogg|ogv|opus|otf|pages|pbm|pcx|pdb|pdf|pea|pem|pgm|pic|pl|pm|png|pnm|pot|potm|potx|ppa|ppam|ppm|pps|ppsm|ppsx|ppt|pptm|pptx|prc|ps|psd|pya|pyc|pyo|pyv|qt|ra|rar|ras|raw|rdf|rgb|rip|rlc|rm|rmf|rmvb|ron|roq|rpm|rss|rtf|run|rz|s3m|s7z|safariextz|scpt|sea|sgi|shar|sil|sit|slk|smv|so|sub|svg|svgz|svi|swf|tar|tbz|tbz2|tcl|tga|tgz|thmx|tif|tiff|tk|tlz|topojson|torrent|ttc|ttf|txt|txz|udf|uvh|uvi|uvm|uvp|uvs|uvu|vcard|vcf|viv|vob|vtt|war|wav|wax|wbmp|wdp|weba|webapp|webm|webmanifest|webp|whl|wim|wm|wma|wml|wmlc|wmv|wmx|woff|woff2|wvx|xbm|xif|xla|xlam|xloc|xls|xlsb|xlsm|xlsx|xlt|xltm|xltx|xm|xmind|xml|xpi|xpm|xsl|xwd|xz|yuv|z|zip|zipx)$ {
  # UNCOMMENT THE NEXT 2 LINES TO ENABLE CACHING FOR STATIC FILES
  # expires 30d;
  # add_header Cache-Control "public";

  # REDUCE LOAD BY DISABLING LOGGING FOR STATIC FILES
  access_log off;
  log_not_found off;
  try_files $uri =404;
}
```

### Pre-rendering directive location

Define the next __internal__ `@prerendering` location directive inside `server` block

```nginx
location @prerendering {
  internal;
  # SET RENDERING ENDPOINT
  # read more at: https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/rendering-endpoints.md
  set $renderer_domain "render.ostr.io";
  set $orig_uri $request_uri;

  # Avoid dead loop and drop get query
  if ($orig_uri ~ "^(.*)\?(.*)$") {
    set $orig_uri $1;
  }

  # DO NOT RENDER WEBSOCKETS AND OTHER STREAMS
  if ($http_upgrade) {
   return 450;
  }

  # Minimize amount of forwarded headers
  proxy_pass_request_headers off;
  proxy_hide_header WWW-Authenticate;
  proxy_hide_header Set-Cookie;

  # !!Very important and required:
  proxy_set_header Host $renderer_domain;
  proxy_set_header User-Agent $http_user_agent;
  proxy_set_header Connection "close";

  ########
  # Do not forget to change _YOUR_AUTH_TOKEN_ to token obtained via ostr.io
  ########
  proxy_set_header Authorization "Basic _YOUR_AUTH_TOKEN_";

  # Optional headers, pass if necessary for backend:
  # proxy_set_header Pragma $http_pragma;
  # proxy_set_header Cache-Control $http_cache_control;
  # proxy_set_header Accept $http_accept;
  # proxy_set_header Accept-Encoding $http_accept_encoding;
  # proxy_set_header Accept-Language $http_accept_language;

  # Disable keepalive support, it's not needed for Pre-rendering
  # For more info read: http://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_http_version
  proxy_http_version 1.0;

  # ENABLE FOR SNI + SSL SETUP
  proxy_ssl_server_name on;

  # You can change resolver to local DNS server
  # And resolver can be moved to nginx.conf
  # Add ipv6=off if your server has no IPv6 support, ex.: `resolver 1.1.1.1 8.8.4.4 8.8.8.8 1.0.0.1 valid=300s ipv6=off;`
  resolver 1.1.1.1 8.8.4.4 8.8.8.8 1.0.0.1 valid=300s;
  resolver_timeout 15s;

  # Sendfile is useless for proxied requests, disable it
  # For more info read: http://nginx.org/en/docs/http/ngx_http_core_module.html#sendfile
  sendfile off;
  proxy_pass https://$renderer_domain/render/https://$host$orig_uri$fragment$is_args$filtered_args;
}
```

## Nginx: Examples

See various Nginx integrations examples for different apps, environments, and stacks

### Basic integration

Basic pre-rendering integration with `@prerendering` location and internal redirect via custom `454` code

```nginx
server {
  listen 80;
  listen [::]:80;
  server_name example.com;

  # DEFINE ROOT AND INDEX
  root /path/to/public;
  index index.php index.html;

  recursive_error_pages on;
  # CUSTOM 454 CODE FOR INTERNAL REDIRECT TO @prerendering
  error_page 454 = @prerendering;

  location / {
    # IF REQUEST RECEIVED FROM BOT OR
    # WITH "FRAGMENT" REDIRECT TO @prerendering
    if ($is_webbot = 1) {
      return 454;
    }
    if ($args ~ _escaped_fragment_) {
      return 454;
    }

    try_files $uri $uri/ /index.html;
  }

  # ...THE REST OF THE CONFIG INCLUDING @prerendering LOCATION...
}
```

### Phusion Passenger integration

Pre-rendering integration for Nginx built with Phusion Passenger. See [full nginx config file for Phusion Passenger here](https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/examples/nginx/phusion-passenger.conf)

```nginx
server {
  listen 80;
  listen [::]:80;
  server_name example.com;
  root /path/to/public;
  passenger_app_root /path/to/public;

  passenger_enabled on;
  passenger_app_type node;
  passenger_startup_file index.js;

  location / {
    try_files $uri @prerendering;
  }

  location @prerendering {
    internal;
    # SET RENDERING ENDPOINT
    # read more at: https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/rendering-endpoints.md
    set $renderer_domain "render.ostr.io";
    set $orig_uri $request_uri;

    if ($orig_uri ~ "^(.*)\?(.*)$") {
      set $orig_uri $1;
    }

    # DO NOT RENDER WEBSOCKETS AND OTHER STREAMS
    if ($http_upgrade) {
      set $is_webbot 0;
    }

    proxy_pass_request_headers off;
    proxy_ssl_server_name on;
    proxy_http_version 1.0;
    proxy_hide_header WWW-Authenticate;
    proxy_hide_header Set-Cookie;
    proxy_set_header Host $renderer_domain;
    proxy_set_header User-Agent $http_user_agent;
    proxy_set_header Connection "close";

    ########
    # Do not forget to change _YOUR_AUTH_TOKEN_ to token you get from ostr.io
    ########
    proxy_set_header Authorization "Basic _YOUR_AUTH_TOKEN_";

    resolver 1.1.1.1 8.8.4.4 8.8.8.8 1.0.0.1 valid=300s;
    resolver_timeout 15s;

    if ($is_webbot = 1) {
      sendfile off;
      proxy_pass https://$renderer_domain/render/https//$host$orig_uri$fragment$is_args$filtered_args;
      break;
    }
  }
}
```

### Basic upstream integration

Suitable for apps that run locally in single or multi-instance mode, like Node.js, Django, Go, Ruby on Rails, and similar. Use `@application` location directive for internal redirects and custom `450` and `454` codes; Handle `404` code with app logic. See [full nginx config file for Server + Upstream setup here](https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/examples/nginx/upstream.conf)

```nginx
upstream app {
  ip_hash;
  keepalive 500;
  server 127.0.0.1:3001;
  server 127.0.0.1:3002;
  server 127.0.0.1:3003;
}

server {
  listen 80;
  listen [::]:80;
  server_name example.com;
  root /path/to/public;

  recursive_error_pages on;
  # CUSTOM 454 CODE FOR INTERNAL REDIRECT TO @prerendering
  error_page 454 = @prerendering;
  # CUSTOM 450 CODE FOR INTERNAL REDIRECT TO @application
  error_page 450 = @application;
  # HANDLE 404s BY THE APP
  error_page 404 = @application;

  location / {
    # IF REQUEST RECEIVED FROM BOT OR
    # WITH "FRAGMENT" REDIRECT TO @prerendering
    if ($is_webbot = 1) {
      return 454;
    }
    if ($args ~ _escaped_fragment_) {
      return 454;
    }

    # TRY STATIC FILE, THEN PASS TO THE APPLICATION
    try_files $uri @application;
  }

  location @application {
    internal;
    sendfile off;
    proxy_http_version  1.1;
    proxy_pass http://app;
  }

  # ...THE REST OF THE CONFIG INCLUDING @prerendering LOCATION...
}
```

### FastCGI integration

Pre-rendering integration to Nginx with PHP app that runs by FastCGI protocol. See [full nginx config file for CGI FPM here](https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/examples/nginx/php-fpm.conf)

```nginx
server {
  listen 80;
  listen [::]:80;
  server_name example.com;

  # DEFINE ROOT AND INDEX
  root /path/to/public;
  index index.php index.html;

  recursive_error_pages on;
  # CUSTOM 454 CODE FOR INTERNAL REDIRECT TO @prerendering
  error_page 454 = @prerendering;

  location / {
    # IF REQUEST RECEIVED FROM BOT OR
    # WITH "FRAGMENT" REDIRECT TO @prerendering
    if ($is_webbot = 1) {
      return 454;
    }
    if ($args ~ _escaped_fragment_) {
      return 454;
    }

    # TRY STATIC FILE, THEN PASS TO THE APPLICATION
    try_files $uri $uri/ /index.php?$args;
  }

  location ~ \.php$ {
    # IF REQUEST RECEIVED FROM BOT OR
    # WITH "FRAGMENT" REDIRECT TO @prerendering
    if ($is_webbot = 1) {
      return 454;
    }
    if ($args ~ _escaped_fragment_) {
      return 454;
    }

    include /etc/nginx/fastcgi_params;
    fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
    fastcgi_param DOCUMENT_ROOT $realpath_root;
    fastcgi_pass unix:/var/run/example.com.sock;
  }

  # ...THE REST OF THE CONFIG INCLUDING @prerendering LOCATION...
}
```

### PHP integration

Pre-rendering integration for PHP apps like Laravel, WordPress, and similar. That runs using `php -S`, `artisan`, Apache, Docker, or alike on a specific port;

```nginx
upstream app {
  keepalive 500;
  server 127.0.0.1:8000;
}

server {
  listen 80;
  listen [::]:80;
  server_name example.com;

  # DEFINE ROOT AND INDEX
  root /path/to/public;
  index index.php index.html;

  recursive_error_pages on;
  # custom 454 code for internal redirect to @prerendering
  error_page 454 = @prerendering;

  location / {
    # IF REQUEST RECEIVED FROM BOT OR
    # WITH "FRAGMENT" REDIRECT TO @prerendering
    if ($is_webbot = 1) {
      return 454;
    }
    if ($args ~ _escaped_fragment_) {
      return 454;
    }

    # TRY STATIC FILE, THEN PASS TO THE APPLICATION
    try_files $uri $uri/ /index.php?$args;
  }

  location ~ \.php$ {
    # IF REQUEST RECEIVED FROM BOT OR
    # WITH "FRAGMENT" REDIRECT TO @prerendering
    if ($is_webbot = 1) {
      return 454;
    }
    if ($args ~ _escaped_fragment_) {
      return 454;
    }

    proxy_http_version  1.1;
    proxy_set_header   Host               $host;
    proxy_set_header   X-Real-IP          $remote_addr;
    proxy_set_header   X-Forwarded-For    $proxy_add_x_forwarded_for;
    proxy_set_header   X-Forwarded-Proto  $scheme;
    proxy_connect_timeout 30s;
    proxy_send_timeout    60s;
    proxy_read_timeout    60s;

    proxy_pass http://app;
  }

  # ...THE REST OF THE CONFIG INCLUDING @prerendering LOCATION...
}
```
