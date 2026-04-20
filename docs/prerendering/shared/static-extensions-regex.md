# Canonical Static-Asset Extension Regex

This file is the **single source of truth** for the static-asset extension regex. Every integration example skips requests whose URI ends in one of these extensions so that CSS, JS, images, fonts, archives, PDFs, and media files are served directly by Nginx, Apache, Caddy, the CDN, or the Cloudflare worker's `fetch` pass-through instead of hitting the pre-rendering engine.

> [!IMPORTANT]
> All integration examples must use this regex **byte-for-byte**. Never edit it inside an integration doc or example config in isolation. When adding or removing extensions, update **every** copy in a single change:
>
> 1. This file (canonical)
> 2. [`nginx.md`](../nginx.md) — `location ~* \.(...)$` block
> 3. [`apache.md`](../apache.md) — `RewriteCond %{REQUEST_URI}` blocks
> 4. [`caddy-prerendering.md`](../caddy-prerendering.md) — `@static_assets` matcher
> 5. Every `examples/**/*.conf`, `examples/**/*.htaccess`, `examples/**/*.caddyfile`, and `examples/**/*.worker.js`
>
> Run `git grep -l "DS_Store" -- 'docs/prerendering/**'` (*or any distinctive token from the regex*) to find every file that must be kept in sync.

## What it matches

The regex matches a file extension at the end of the request URI. Categories covered:

- **Images** — jpg, jpeg, png, gif, svg, svgz, webp, avif-via-webp-fallback, bmp, ico, tiff, etc.
- **Fonts** — woff, woff2, ttf, otf, eot
- **Styles & scripts** — css, js, mjs (via `js`), less, map, manifest
- **Documents** — pdf, doc(x), xls(x), ppt(x), key, pages, epub, txt, markdown/md
- **Archives & binaries** — zip, 7z, tar, gz, rar, dmg, exe, apk, ipa, msi, jar
- **Audio / video** — mp3, mp4, webm, mov, wav, ogg, flac, aac, m4a, m4v, mkv
- **Feeds & data** — atom, rss, xml-less (handled per-route instead), json-less
- **Developer / OS files** — DS_Store, bak, htc, appcache, webmanifest

## Canonical regex (do not edit in place — update sources above)

```regex
\.(?:3ds|3g2|3gp|3gpp|7z|a|aac|aaf|adp|ai|aif|aiff|alz|ape|apk|appcache|ar|arj|asf|asx|atom|au|avchd|avi|bak|bbaw|bh|bin|bk|bmp|btif|bz2|bzip2|cab|caf|cco|cgm|class|cmx|cpio|cr2|crt|crx|css|csv|cur|dat|deb|der|dex|djvu|dll|dmg|dng|doc|docm|docx|dot|dotm|dra|drc|DS_Store|dsk|dts|dtshd|dvb|dwg|dxf|ear|ecelp4800|ecelp7470|ecelp9600|egg|eol|eot|eps|epub|exe|f4a|f4b|f4p|f4v|fbs|fh|fla|flac|fli|flv|fpx|fst|fvt|g3|geojson|gif|graffle|gz|gzip|h261|h263|h264|hqx|htc|ico|ief|img|ipa|iso|jad|jar|jardiff|jng|jnlp|jpeg|jpg|jpgv|jpm|js|jxr|key|kml|kmz|ktx|less|lha|lvp|lz|lzh|lzma|lzo|m2v|m3u|m4a|m4p|m4v|map|manifest|mar|markdown|md|mdi|mdown|mdwn|mht|mid|midi|mj2|mka|mkd|mkdn|mkdown|mkv|mml|mmr|mng|mobi|mov|movie|mp2|mp3|mp4|mp4a|mpe|mpeg|mpg|mpga|mpv|msi|msm|msp|mxf|mxu|nef|npx|nsv|numbers|o|oex|oga|ogg|ogv|opus|otf|pages|pbm|pcx|pdb|pdf|pea|pem|pgm|pic|pl|pm|png|pnm|pot|potm|potx|ppa|ppam|ppm|pps|ppsm|ppsx|ppt|pptm|pptx|prc|ps|psd|pya|pyc|pyo|pyv|qt|ra|rar|ras|raw|rdf|rgb|rip|rlc|rm|rmf|rmvb|ron|roq|rpm|rss|rtf|run|rz|s3m|s7z|safariextz|scpt|sea|sgi|shar|sil|sit|slk|smv|so|sub|svg|svgz|svi|swf|tar|tbz|tbz2|tcl|tga|tgz|thmx|tif|tiff|tk|tlz|topojson|torrent|ttc|ttf|txt|txz|udf|uvh|uvi|uvm|uvp|uvs|uvu|vcard|vcf|viv|vob|vtt|war|wav|wax|wbmp|wdp|weba|webapp|webm|webmanifest|webp|whl|wim|wm|wma|wml|wmlc|wmv|wmx|woff|woff2|wvx|xbm|xif|xla|xlam|xloc|xls|xlsb|xlsm|xlsx|xlt|xltm|xltx|xm|xmind|xpi|xpm|xsl|xwd|xz|yuv|z|zip|zipx)$
```

## Per-server wrappers

- **Nginx** — `location ~* <PATTERN> { ... }` (case-insensitive via `~*`). Serve directly or `try_files $uri =404;`.
- **Apache** — `RewriteCond %{REQUEST_URI} !<PATTERN> [NC]` *before* the bot / fragment rules, so the proxy rule only fires on page requests.
- **Caddy** — `@static_assets path_regexp <PATTERN>` matcher, paired with `file_server` or direct response.
- **Cloudflare Worker** — `if (STATIC_ASSET_REGEX.test(url.pathname)) { return fetch(request); }` early-return before bot detection.

## Intentional exclusions

Some extensions are **deliberately left out** so they continue to hit the origin (and may be pre-rendered when appropriate):

- `html`, `htm` — primary page content; should reach pre-rendering for crawlers
- `xml` — `sitemap*.xml` and feeds are excluded via dedicated path rules, not extension rules
- `json` — JSON endpoints are excluded via `/api/` path rules, not extension rules
- No extension (clean URLs) — default case for pre-rendering

## Related

- [`AGENTS.md`](../../../AGENTS.md) — repository-wide editing rules that point here
- [Crawler User-Agent regex](crawler-ua-regex.md) — companion canonical source
- [Nginx integration](../nginx.md)
- [Apache integration](../apache.md)
- [Caddy integration](../caddy-prerendering.md)
