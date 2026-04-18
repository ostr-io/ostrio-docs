# Apache + ostr.io prerender integration

This guide explains how to route crawler traffic from Apache to `render.ostr.io` in a production-safe way.

## 1) Required modules

Enable and verify these Apache modules:

- `mod_headers`
- `mod_proxy`
- `mod_proxy_http`
- `mod_ssl`
- `mod_rewrite`

Verification:

```bash
apachectl -M | grep -E "headers|proxy|proxy_http|ssl|rewrite"
```

Notes:

- Debian/Ubuntu package Apache: `a2enmod headers proxy proxy_http ssl rewrite`
- RHEL/Alma/Rocky/cPanel: enable via distro/panel tooling and verify with `apachectl -M`

## 2) Use correct directive context

Do **not** put server-level directives into `.htaccess`:

- `LoadModule` is server-level only.
- `SSLProxyEngine` is server/vhost/proxy-section only.

Recommended server/vhost config:

```apache
<IfModule mod_ssl.c>
  SSLProxyEngine on
</IfModule>

<IfModule mod_proxy.c>
  # Keep upstream Host as render.ostr.io to avoid host mismatch 404.
  ProxyPreserveHost Off
</IfModule>
```

## 3) `.htaccess` rules for prerender routing

Add/update rules in your site `.htaccess`:

```apacheconf
<IfModule mod_headers.c>
  ########
  # Replace _YOUR_AUTH_TOKEN_ with your ostr.io token (base64, without extra spaces)
  ########
  RequestHeader set Authorization "Basic _YOUR_AUTH_TOKEN_"
  RequestHeader set User-Agent "%{User-Agent}i"
</IfModule>

<IfModule mod_rewrite.c>
  RewriteEngine On
  <IfModule mod_proxy_http.c>
    RewriteCond %{REQUEST_URI} !\.(?:3ds|3g2|3gp|3gpp|7z|a|aac|aaf|adp|ai|aif|aiff|alz|ape|apk|appcache|ar|arj|asf|asx|atom|au|avchd|avi|bak|bbaw|bh|bin|bk|bmp|btif|bz2|bzip2|cab|caf|cco|cgm|class|cmx|cpio|cr2|crt|crx|css|csv|cur|dat|deb|der|dex|djvu|dll|dmg|dng|doc|docm|docx|dot|dotm|dra|drc|DS_Store|dsk|dts|dtshd|dvb|dwg|dxf|ear|ecelp4800|ecelp7470|ecelp9600|egg|eol|eot|eps|epub|exe|f4a|f4b|f4p|f4v|fbs|fh|fla|flac|fli|flv|fpx|fst|fvt|g3|geojson|gif|graffle|gz|gzip|h261|h263|h264|hqx|htc|ico|ief|img|ipa|iso|jad|jar|jardiff|jng|jnlp|jpeg|jpg|jpgv|jpm|js|jxr|key|kml|kmz|ktx|less|lha|lvp|lz|lzh|lzma|lzo|m2v|m3u|m4a|m4p|m4v|map|manifest|mar|markdown|md|mdi|mdown|mdwn|mht|mid|midi|mj2|mka|mkd|mkdn|mkdown|mkv|mml|mmr|mng|mobi|mov|movie|mp2|mp3|mp4|mp4a|mpe|mpeg|mpg|mpga|mpv|msi|msm|msp|mxf|mxu|nef|npx|nsv|numbers|o|oex|oga|ogg|ogv|opus|otf|pages|pbm|pcx|pdb|pdf|pea|pem|pgm|pic|pl|pm|png|pnm|pot|potm|potx|ppa|ppam|ppm|pps|ppsm|ppsx|ppt|pptm|pptx|prc|ps|psd|pya|pyc|pyo|pyv|qt|ra|rar|ras|raw|rdf|rgb|rip|rlc|rm|rmf|rmvb|ron|roq|rpm|rss|rtf|run|rz|s3m|s7z|safariextz|scpt|sea|sgi|shar|sil|sit|slk|smv|so|sub|svg|svgz|svi|swf|tar|tbz|tbz2|tcl|tga|tgz|thmx|tif|tiff|tk|tlz|topojson|torrent|ttc|ttf|txt|txz|udf|uvh|uvi|uvm|uvp|uvs|uvu|vcard|vcf|viv|vob|vtt|war|wav|wax|wbmp|wdp|weba|webapp|webm|webmanifest|webp|whl|wim|wm|wma|wml|wmlc|wmv|wmx|woff|woff2|wvx|xbm|xif|xla|xlam|xloc|xls|xlsb|xlsm|xlsx|xlt|xltm|xltx|xm|xmind|xpi|xpm|xsl|xwd|xz|yuv|z|zip|zipx)$ [NC]

    RewriteCond "%{HTTP_USER_AGENT}" "\.net crawler|360spider|50\.nu|8bo crawler bot|aboundex|accoona|adldxbot|ahrefsbot|altavista|appengine-google|applebot|archiver|arielisbot|ask jeeves|auskunftbot|baidumobaider|baiduspider|becomebot|bingbot|bingpreview|bitbot|bitlybot|blitzbot|blogbridge|boardreader|botseer|catchbot|catchpoint bot|charlotte|checklinks|cliqzbot|clumboot|coccocbot|converacrawler|crawl-e|crawlconvera|dataparksearch|daum|deusu|discordbot|dotbot|duckduckbot|elefent|embedly|evernote|exabot|facebookbot|facebookexternalhit|meta-external|fatbot|fdse robot|feed seeker bot|feedfetcher|femtosearchbot|findlinks|flamingo_searchengine|flipboard|followsite bot|furlbot|fyberspider|gaisbot|galaxybot|geniebot|genieo|gigablast|gigabot|girafabot|gomezagent|gonzo1|googlebot|google sketchup|adsbot-google|google-structured-data-testing-tool|google-extended|developers\.google\.com/\+/web/snippet|haosouspider|heritrix|holmes|hoowwwer|htdig|ia_archiver|idbot|infuzapp|innovazion crawler|instagram|internetarchive|iqdb|iskanie|istellabot|izsearch\.com|kaloogabot|kaz\.kz_bot|kd bot|konqueror|kraken|kurzor|larbin|leia|lesnikbot|linguee bot|linkaider|linkapediabot|linkedinbot|lite bot|llaut|lookseek|lycos|mail\.ru_bot|masidani_bot|masscan|mediapartners-google|metajobbot|mj12bot|mnogosearch|mogimogi|mojeekbot|motominerbot|mozdex|msiecrawler|msnbot|msrbot|netpursual|netresearch|netvibes|newsgator|ng-search|nicebot|nutchcvs|nuzzel|nymesis|objectssearch|odklbot|omgili|oovoo|oozbot|openfosbot|orangebot|orbiter|org_bot|outbrain|pagepeeker|pagesinventory|parsijoobot|paxleframework|peeplo screenshot bot|pinterest|plantynet_webrobot|plukkie|pompos|psbot|quora link preview|qwantify|read%20later|reaper|redcarpet|redditbot|retreiver|riddler|rival iq|rogerbot|saucenao|scooter|scrapy|scrubby|searchie|searchsight|seekbot|semanticdiscovery|seznambot|showyoubot|simplepie|simpy|sitelockspider|skypeuripreview|petalbot|slackbot|slack-imgproxy|slurp|snappy|sogou|solofield|speedyspider|speedy spider|sputnikbot|stackrambler|teeraidbot|teoma|theusefulbot|thumbshots\.ru|thumbshotsbot|tineye|tiktokspider|toweya\.com|toweyabot|tumblr|tweetedtimes|tweetmemebot|twitterbot|url2png|vagabondo|vebidoobot|viber|visionutils|vkshare|voilabot|vortex|votay bot|voyager|w3c_validator|wasalive\.bot|web-sniffer|websquash\.com|webthumb|whatsapp|whatweb|wire|wotbox|yacybot|yahoo|yandex|yeti|yisouspider|yodaobot|yooglifetchagent|yoozbot|yottaamonitor|yowedo|zao-crawler|zebot_www\.ze\.bz|zooshot|zyborgi|ai2bot|amazonbot|anthropic\.com|bard|bytespider|ccbot|chatgpt-user|claude-web|claudebot|cohere-ai|deepseek|diffbot|duckassistbot|gemini|gptbot|grok|mistralai|oai-searchbot|openai\.com|perplexity\.ai|perplexitybot|xai|youbot" [NC,OR]
    
    RewriteCond "%{QUERY_STRING}" "_escaped_fragment_" [NC]

    RewriteRule ^(.*)$ "https://render.ostr.io/render/%{REQUEST_SCHEME}://%{HTTP_HOST}/$1" [P,END]
  </IfModule>
</IfModule>
```

## 4) Validate and reload Apache

```bash
apachectl -t
systemctl reload apache2 || systemctl reload httpd
```

## 5) Testing checklist

Use `GET` requests (not `curl -I`/HEAD):

```bash
# Normal browser UA: should stay on origin response
curl -sS -A "Mozilla/5.0" "https://your-domain/" -o /tmp/human.html

# Bot UA: should go through prerender path
curl -sS -A "googlebot" "https://your-domain/" -o /tmp/bot.html

# Compare response bodies
wc -c /tmp/human.html /tmp/bot.html
diff -u /tmp/human.html /tmp/bot.html | head -n 80

# Static file: should bypass prerender
curl -i -A "googlebot" "https://your-domain/app.js"
```

Success criteria:

1. Bot traffic receives prerendered HTML.
2. Normal browser traffic remains unchanged.
3. Static assets are not proxied to prerender.

## 6) Common issues

- `Invalid command 'SSLProxyEngine'`:
  - `mod_ssl` is not loaded, or directive is placed in `.htaccess`.
- `Invalid command 'ProxyPreserveHost'`:
  - `mod_proxy` is not loaded.
- Bot requests return origin HTML:
  - rewrite rules are not effective (`AllowOverride`, module state, or condition mismatch).
- Bot requests return upstream `404`:
  - host mismatch to upstream; keep `ProxyPreserveHost Off`.
- No pages cached in ostr:
  - testing was done with `HEAD` instead of `GET`, invalid token format, or rewrite branch was not reached.
