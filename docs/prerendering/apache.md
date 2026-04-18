# Apache Integration

ostr.io pre-rendering SEO Middleware serves rendered HTML to search engines, social preview bots, and AI crawlers. Apache integration keeps application code unchanged: Apache detects crawler traffic and proxies matching page requests to ostr.io renderer.

- [Pre-rendering overview](README.md)
- [Rendering endpoints](rendering-endpoints.md)
- [Complete Apache examples](examples/apache/)

## Contents

- [How it Works](#how-it-works)
- [Quick Start](#quick-start)
- [Required Apache Setup](#required-apache-setup)
- [Minimal Integration Pattern](#minimal-integration-pattern)
- [Choose Example](#choose-example)
- [Validation](#validation)
- [Common Issues](#common-issues)

## How it Works

Apache pre-rendering integration has four parts:

1. Enable proxy, rewrite, SSL proxy, and header modules.
2. Keep server-only proxy directives in Apache config or virtual host.
3. Detect safe crawler page requests in `.htaccess` with `mod_rewrite`.
4. Proxy matching requests to `https://render.ostr.io/render/{scheme}://{host}{path}` with ostr.io authorization.

Static files, websocket upgrades, and unsafe request methods stay on origin in every example. Stack-specific `.htaccess` files add exclusions for CMS admin routes, APIs, feeds, and other framework endpoints.

## Quick Start

1. Enable required Apache modules.
2. Add server or virtual-host proxy directives.
3. Pick closest `.htaccess` example from [`examples/apache/`](examples/apache/).
4. Put pre-rendering rules before framework front-controller fallback rules.
5. Replace `_YOUR_AUTH_TOKEN_` with token from ostr.io.
6. Run `apachectl -t`, reload Apache, test bot traffic.

## Required Apache Setup

Enable and verify modules:

```shell
apachectl -M | grep -E "headers|proxy|proxy_http|ssl|rewrite"
```

Common module commands:

```shell
a2enmod headers proxy proxy_http ssl rewrite
```

Keep server-only directives out of `.htaccess`. Put them in Apache config or virtual host:

```apache
<IfModule mod_ssl.c>
  SSLProxyEngine On
</IfModule>

<IfModule mod_proxy.c>
  # Default is Off. Keep backend Host as render.ostr.io.
  ProxyPreserveHost Off
</IfModule>

<Directory "/var/www/example/public">
  AllowOverride FileInfo Indexes Options=Indexes,MultiViews
  Require all granted
</Directory>
```

Directive context matters:

- `LoadModule`: server config only.
- `SSLProxyEngine`: server or virtual host only.
- `ProxyPreserveHost`: server or virtual host only.
- `RewriteRule`, `RewriteCond`, `RequestHeader`, `Header`: valid in `.htaccess` when `AllowOverride FileInfo` is enabled.
- `DirectoryIndex`: valid in `.htaccess` only when `AllowOverride Indexes` is enabled.
- `Options -Indexes` and `Options -MultiViews`: valid in `.htaccess` only when matching option overrides are enabled, for example `AllowOverride Options=Indexes,MultiViews`.
- `AllowOverride All`: works on many shared hosts; use granular overrides above when you manage the virtual host.

## Minimal Integration Pattern

This minimal pattern shows directive flow. Use complete `.htaccess` files for framework-specific route exclusions.

```apache
<IfModule mod_headers.c>
  # Applied only to requests marked by rewrite rule below.
  RequestHeader set Authorization "Basic _YOUR_AUTH_TOKEN_" env=OSTR_PRERENDER
  RequestHeader unset Cookie env=OSTR_PRERENDER

  Header unset WWW-Authenticate env=OSTR_PRERENDER
  Header unset Set-Cookie env=OSTR_PRERENDER
</IfModule>

<IfModule mod_rewrite.c>
  RewriteEngine On

  # Legacy escaped-fragment signal: render current page and drop the marker query.
  RewriteCond %{REQUEST_METHOD} ^(?:GET|HEAD)$ [NC]
  RewriteCond %{HTTP:Upgrade} ^$
  RewriteCond %{REQUEST_URI} !\.(?:3ds|3g2|3gp|3gpp|7z|a|aac|aaf|adp|ai|aif|aiff|alz|ape|apk|appcache|ar|arj|asf|asx|atom|au|avchd|avi|bak|bbaw|bh|bin|bk|bmp|btif|bz2|bzip2|cab|caf|cco|cgm|class|cmx|cpio|cr2|crt|crx|css|csv|cur|dat|deb|der|dex|djvu|dll|dmg|dng|doc|docm|docx|dot|dotm|dra|drc|DS_Store|dsk|dts|dtshd|dvb|dwg|dxf|ear|ecelp4800|ecelp7470|ecelp9600|egg|eol|eot|eps|epub|exe|f4a|f4b|f4p|f4v|fbs|fh|fla|flac|fli|flv|fpx|fst|fvt|g3|geojson|gif|graffle|gz|gzip|h261|h263|h264|hqx|htc|ico|ief|img|ipa|iso|jad|jar|jardiff|jng|jnlp|jpeg|jpg|jpgv|jpm|js|jxr|key|kml|kmz|ktx|less|lha|lvp|lz|lzh|lzma|lzo|m2v|m3u|m4a|m4p|m4v|map|manifest|mar|markdown|md|mdi|mdown|mdwn|mht|mid|midi|mj2|mka|mkd|mkdn|mkdown|mkv|mml|mmr|mng|mobi|mov|movie|mp2|mp3|mp4|mp4a|mpe|mpeg|mpg|mpga|mpv|msi|msm|msp|mxf|mxu|nef|npx|nsv|numbers|o|oex|oga|ogg|ogv|opus|otf|pages|pbm|pcx|pdb|pdf|pea|pem|pgm|pic|pl|pm|png|pnm|pot|potm|potx|ppa|ppam|ppm|pps|ppsm|ppsx|ppt|pptm|pptx|prc|ps|psd|pya|pyc|pyo|pyv|qt|ra|rar|ras|raw|rdf|rgb|rip|rlc|rm|rmf|rmvb|ron|roq|rpm|rss|rtf|run|rz|s3m|s7z|safariextz|scpt|sea|sgi|shar|sil|sit|slk|smv|so|sub|svg|svgz|svi|swf|tar|tbz|tbz2|tcl|tga|tgz|thmx|tif|tiff|tk|tlz|topojson|torrent|ttc|ttf|txt|txz|udf|uvh|uvi|uvm|uvp|uvs|uvu|vcard|vcf|viv|vob|vtt|war|wav|wax|wbmp|wdp|weba|webapp|webm|webmanifest|webp|whl|wim|wm|wma|wml|wmlc|wmv|wmx|woff|woff2|wvx|xbm|xif|xla|xlam|xloc|xls|xlsb|xlsm|xlsx|xlt|xltm|xltx|xm|xmind|xpi|xpm|xsl|xwd|xz|yuv|z|zip|zipx)$ [NC]
  RewriteCond %{QUERY_STRING} (^|&)_escaped_fragment_= [NC]
  RewriteRule ^ https://render.ostr.io/render/%{REQUEST_SCHEME}://%{HTTP_HOST}%{REQUEST_URI}? [P,END,E=OSTR_PRERENDER:1]

  # Bot traffic: render page URL and preserve normal query string.
  RewriteCond %{REQUEST_METHOD} ^(?:GET|HEAD)$ [NC]
  RewriteCond %{HTTP:Upgrade} ^$
  RewriteCond %{REQUEST_URI} !\.(?:3ds|3g2|3gp|3gpp|7z|a|aac|aaf|adp|ai|aif|aiff|alz|ape|apk|appcache|ar|arj|asf|asx|atom|au|avchd|avi|bak|bbaw|bh|bin|bk|bmp|btif|bz2|bzip2|cab|caf|cco|cgm|class|cmx|cpio|cr2|crt|crx|css|csv|cur|dat|deb|der|dex|djvu|dll|dmg|dng|doc|docm|docx|dot|dotm|dra|drc|DS_Store|dsk|dts|dtshd|dvb|dwg|dxf|ear|ecelp4800|ecelp7470|ecelp9600|egg|eol|eot|eps|epub|exe|f4a|f4b|f4p|f4v|fbs|fh|fla|flac|fli|flv|fpx|fst|fvt|g3|geojson|gif|graffle|gz|gzip|h261|h263|h264|hqx|htc|ico|ief|img|ipa|iso|jad|jar|jardiff|jng|jnlp|jpeg|jpg|jpgv|jpm|js|jxr|key|kml|kmz|ktx|less|lha|lvp|lz|lzh|lzma|lzo|m2v|m3u|m4a|m4p|m4v|map|manifest|mar|markdown|md|mdi|mdown|mdwn|mht|mid|midi|mj2|mka|mkd|mkdn|mkdown|mkv|mml|mmr|mng|mobi|mov|movie|mp2|mp3|mp4|mp4a|mpe|mpeg|mpg|mpga|mpv|msi|msm|msp|mxf|mxu|nef|npx|nsv|numbers|o|oex|oga|ogg|ogv|opus|otf|pages|pbm|pcx|pdb|pdf|pea|pem|pgm|pic|pl|pm|png|pnm|pot|potm|potx|ppa|ppam|ppm|pps|ppsm|ppsx|ppt|pptm|pptx|prc|ps|psd|pya|pyc|pyo|pyv|qt|ra|rar|ras|raw|rdf|rgb|rip|rlc|rm|rmf|rmvb|ron|roq|rpm|rss|rtf|run|rz|s3m|s7z|safariextz|scpt|sea|sgi|shar|sil|sit|slk|smv|so|sub|svg|svgz|svi|swf|tar|tbz|tbz2|tcl|tga|tgz|thmx|tif|tiff|tk|tlz|topojson|torrent|ttc|ttf|txt|txz|udf|uvh|uvi|uvm|uvp|uvs|uvu|vcard|vcf|viv|vob|vtt|war|wav|wax|wbmp|wdp|weba|webapp|webm|webmanifest|webp|whl|wim|wm|wma|wml|wmlc|wmv|wmx|woff|woff2|wvx|xbm|xif|xla|xlam|xloc|xls|xlsb|xlsm|xlsx|xlt|xltm|xltx|xm|xmind|xpi|xpm|xsl|xwd|xz|yuv|z|zip|zipx)$ [NC]
  RewriteCond %{HTTP_USER_AGENT} "\.net crawler|360spider|50\.nu|8bo crawler bot|aboundex|accoona|adldxbot|ahrefsbot|altavista|appengine-google|applebot|archiver|arielisbot|ask jeeves|auskunftbot|baidumobaider|baiduspider|becomebot|bingbot|bingpreview|bitbot|bitlybot|blitzbot|blogbridge|boardreader|botseer|catchbot|catchpoint bot|charlotte|checklinks|cliqzbot|clumboot|coccocbot|converacrawler|crawl-e|crawlconvera|dataparksearch|daum|deusu|discordbot|dotbot|duckduckbot|elefent|embedly|evernote|exabot|facebookbot|facebookexternalhit|meta-external|fatbot|fdse robot|feed seeker bot|feedfetcher|femtosearchbot|findlinks|flamingo_searchengine|flipboard|followsite bot|furlbot|fyberspider|gaisbot|galaxybot|geniebot|genieo|gigablast|gigabot|girafabot|gomezagent|gonzo1|googlebot|google sketchup|adsbot-google|google-structured-data-testing-tool|google-extended|developers\.google\.com/\+/web/snippet|haosouspider|heritrix|holmes|hoowwwer|htdig|ia_archiver|idbot|infuzapp|innovazion crawler|instagram|internetarchive|iqdb|iskanie|istellabot|izsearch\.com|kaloogabot|kaz\.kz_bot|kd bot|konqueror|kraken|kurzor|larbin|leia|lesnikbot|linguee bot|linkaider|linkapediabot|linkedinbot|lite bot|llaut|lookseek|lycos|mail\.ru_bot|masidani_bot|masscan|mediapartners-google|metajobbot|mj12bot|mnogosearch|mogimogi|mojeekbot|motominerbot|mozdex|msiecrawler|msnbot|msrbot|netpursual|netresearch|netvibes|newsgator|ng-search|nicebot|nutchcvs|nuzzel|nymesis|objectssearch|odklbot|omgili|oovoo|oozbot|openfosbot|orangebot|orbiter|org_bot|outbrain|pagepeeker|pagesinventory|parsijoobot|paxleframework|peeplo screenshot bot|pinterest|plantynet_webrobot|plukkie|pompos|psbot|quora link preview|qwantify|read%20later|reaper|redcarpet|redditbot|retreiver|riddler|rival iq|rogerbot|saucenao|scooter|scrapy|scrubby|searchie|searchsight|seekbot|semanticdiscovery|seznambot|showyoubot|simplepie|simpy|sitelockspider|skypeuripreview|petalbot|slackbot|slack-imgproxy|slurp|snappy|sogou|solofield|speedyspider|speedy spider|sputnikbot|stackrambler|teeraidbot|teoma|theusefulbot|thumbshots\.ru|thumbshotsbot|tineye|tiktokspider|toweya\.com|toweyabot|tumblr|tweetedtimes|tweetmemebot|twitterbot|url2png|vagabondo|vebidoobot|viber|visionutils|vkshare|voilabot|vortex|votay bot|voyager|w3c_validator|wasalive\.bot|web-sniffer|websquash\.com|webthumb|whatsapp|whatweb|wire|wotbox|yacybot|yahoo|yandex|yeti|yisouspider|yodaobot|yooglifetchagent|yoozbot|yottaamonitor|yowedo|zao-crawler|zebot_www\.ze\.bz|zooshot|zyborgi|ai2bot|amazonbot|anthropic\.com|bard|bytespider|ccbot|chatgpt-user|claude-web|claudebot|cohere-ai|deepseek|diffbot|duckassistbot|gemini|gptbot|grok|mistralai|oai-searchbot|openai\.com|perplexity\.ai|perplexitybot|xai|youbot" [NC]
  RewriteRule ^ https://render.ostr.io/render/%{REQUEST_SCHEME}://%{HTTP_HOST}%{REQUEST_URI} [P,END,E=OSTR_PRERENDER:1]

  # Existing application rules continue here.
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^ index.php [END]
</IfModule>
```

Core directives:

- `RequestHeader set Authorization ... env=OSTR_PRERENDER` authenticates only proxied renderer requests.
- `RequestHeader unset Cookie` avoids forwarding visitor cookies to renderer.
- `Header unset Set-Cookie` avoids returning renderer cookies to crawlers.
- `RewriteCond %{REQUEST_METHOD}` limits rendering to safe read methods.
- `RewriteCond %{HTTP:Upgrade}` keeps websocket or upgrade traffic on origin.
- `RewriteCond %{REQUEST_URI}` excludes assets and non-page routes.
- `RewriteCond %{HTTP_USER_AGENT}` detects crawler traffic.
- `RewriteCond %{QUERY_STRING}` supports legacy `_escaped_fragment_` as render signal.
- `RewriteRule ... [P,END,E=OSTR_PRERENDER:1]` proxies request, stops rewrite processing, and marks headers for renderer.

## Choose Example

Pick closest config, then adapt public root placement, framework routes, and auth token.

| Use case | Start with | Notes |
| --- | --- | --- |
| WordPress | [`wordpress.htaccess`](examples/apache/wordpress.htaccess) | Keeps `wp-admin`, REST API, cron, comments, feeds, sitemaps, and system endpoints on origin. |
| Drupal | [`drupal.htaccess`](examples/apache/drupal.htaccess) | Keeps Drupal admin, files, JSON:API, cron, update, install, and module/theme assets on origin. |
| Joomla | [`joomla.htaccess`](examples/apache/joomla.htaccess) | Keeps administrator, API, component assets, media, cache, and AJAX routes on origin. |
| Magento | [`magento.htaccess`](examples/apache/magento.htaccess) | Designed for Magento `pub/.htaccess`; keeps checkout, customer, REST, GraphQL, static, and media routes on origin. |
| Moodle | [`moodle.htaccess`](examples/apache/moodle.htaccess) | Adds pre-rendering in front of Moodle routes without replacing Moodle's direct PHP script handling. |
| Laravel | [`laravel.htaccess`](examples/apache/laravel.htaccess) | Designed for Laravel `public/.htaccess`; keeps API, auth, Horizon, Telescope, Pulse, and storage routes on origin. |
| Zend or Laminas | [`zend.htaccess`](examples/apache/zend.htaccess) | Uses public front-controller pattern with static-file pass-through. |
| Plain PHP app | [`plain-php.htaccess`](examples/apache/plain-php.htaccess) | Generic `index.php` fallback; add exclusions for app-specific API/admin routes. |

## Validation

Syntax check:

```shell
apachectl -t
```

Reload Apache:

```shell
systemctl reload apache2 || systemctl reload httpd
```

Use `GET` requests for renderer tests:

```shell
curl -sS -A "Mozilla/5.0" "https://example.com/some-page" -o /tmp/human.html
curl -sS -A "Googlebot" "https://example.com/some-page" -o /tmp/bot.html
curl -sS "https://example.com/some-page?_escaped_fragment_=" -o /tmp/fragment.html
curl -i -A "Googlebot" "https://example.com/app.js"
```

Success criteria:

1. Bot traffic receives prerendered HTML.
2. Normal browser traffic remains unchanged.
3. `_escaped_fragment_` requests receive prerendered HTML.
4. Static assets, APIs, admin routes, sitemaps, and feeds stay on origin.

## Common Issues

- `Invalid command 'SSLProxyEngine'`: directive is in `.htaccess`, or `mod_ssl` is not loaded.
- `Invalid command 'ProxyPreserveHost'`: directive is in `.htaccess`, or `mod_proxy` is not loaded.
- `RewriteRule: bad flag delimiters`: Apache version is old or flags contain unsupported syntax; examples require Apache 2.4+.
- Bot requests return origin HTML: `AllowOverride FileInfo` is missing, module is disabled, or crawler condition did not match.
- Bot requests return renderer `401`: `_YOUR_AUTH_TOKEN_` was not replaced or token format is invalid.
- Bot requests return renderer `404`: `ProxyPreserveHost` is `On`; keep it `Off` for renderer proxying.
- Browser requests receive pre-rendered HTML: route exclusions are too broad or custom bot regex matches browser UA.
