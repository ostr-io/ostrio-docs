import { next } from "@vercel/functions";

/**
 * Vercel Routing Middleware: sends crawler requests to the ostr.io
 * pre-rendering service.
 *
 * Copy this file to your project root, next to package.json. Vercel runs
 * it before the CDN cache, on the Node.js runtime by default. It also runs
 * on the Edge runtime: it uses only fetch, Headers, URL, AbortController
 * and btoa.
 *
 * Not for Next.js or Astro: Vercel Routing Middleware can't be used with
 * frameworks that build their own routing middleware. Next.js users: use
 * the seo-middleware-nextjs npm package in proxy.ts (Next.js 16+) or
 * middleware.ts.
 *
 * Humans pass through unchanged. Crawlers get the page rendered by ostr.io.
 * If ostr.io fails or times out, the request falls back to your origin.
 *
 * Env vars (set in the Vercel dashboard):
 *   OSTR_AUTH         "Basic xxx" from the ostr.io dashboard, or "user:pass"
 *   OSTR_SITE_ORIGIN  canonical origin (e.g. https://example.com), needed
 *                     when preview URLs differ from the registered domain,
 *                     ROOT_URL works as an alias
 *   OSTR_SERVICE_URL  default: https://render.ostr.io
 *   OSTR_TIMEOUT      renderer timeout in ms, default: 20000
 *
 * Docs: https://github.com/ostr-io/ostrio-docs
 */

const BOT_AGENTS = [
  // Canonical list, same entries and order as `botsUA` in spiderable-middleware:
  // https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/shared/crawler-ua-regex.md
  // Entries are regex fragments, escape . + ( and other special characters with \\
  "\\.net crawler", "360spider", "50\\.nu", "8bo crawler bot", "aboundex", "accoona", "adldxbot",
  "ahrefsbot", "altavista", "appengine-google", "applebot", "archiver", "arielisbot", "ask jeeves",
  "auskunftbot", "baidumobaider", "baiduspider", "becomebot", "bingbot", "bingpreview", "bitbot",
  "bitlybot", "blitzbot", "blogbridge", "boardreader", "botseer", "catchbot", "catchpoint bot",
  "charlotte", "checklinks", "cliqzbot", "clumboot", "coccocbot", "converacrawler", "crawl-e",
  "crawlconvera", "dataparksearch", "daum", "deusu", "discordbot", "dotbot", "duckduckbot",
  "elefent", "embedly", "evernote", "exabot", "facebookbot", "facebookexternalhit",
  "meta-external", "fatbot", "fdse robot", "feed seeker bot", "feedfetcher", "femtosearchbot",
  "findlinks", "flamingo_searchengine", "flipboard", "followsite bot", "furlbot", "fyberspider",
  "gaisbot", "galaxybot", "geniebot", "genieo", "gigablast", "gigabot", "girafabot", "gomezagent",
  "gonzo1", "googlebot", "google sketchup", "adsbot-google", "google-structured-data-testing-tool",
  "google-extended", "developers\\.google\\.com/\\+/web/snippet", "haosouspider", "heritrix",
  "holmes", "hoowwwer", "htdig", "ia_archiver", "idbot", "infuzapp", "innovazion crawler",
  "internetarchive", "iqdb", "iskanie", "istellabot", "izsearch\\.com", "kaloogabot",
  "kaz\\.kz_bot", "kd bot", "konqueror", "kraken", "kurzor", "larbin", "leia", "lesnikbot",
  "linguee bot", "linkaider", "linkapediabot", "linkedinbot", "lite bot", "llaut", "lookseek",
  "lycos", "mail\\.ru_bot", "masidani_bot", "masscan", "mediapartners-google", "metajobbot",
  "mj12bot", "mnogosearch", "mogimogi", "mojeekbot", "motominerbot", "mozdex", "msiecrawler",
  "msnbot", "msrbot", "netpursual", "netresearch", "netvibes", "newsgator", "ng-search", "nicebot",
  "nutchcvs", "nuzzel", "nymesis", "objectssearch", "odklbot", "omgili", "oovoo", "oozbot",
  "openfosbot", "orangebot", "orbiter", "org_bot", "outbrain", "pagepeeker", "pagesinventory",
  "parsijoobot", "paxleframework", "peeplo screenshot bot", "pinterest", "plantynet_webrobot",
  "plukkie", "pompos", "psbot", "quora link preview", "qwantify", "read%20later", "reaper",
  "redcarpet", "redditbot", "retreiver", "riddler", "rival iq", "rogerbot", "saucenao", "scooter",
  "scrapy", "scrubby", "searchie", "searchsight", "seekbot", "semanticdiscovery", "seznambot",
  "showyoubot", "simplepie", "simpy", "sitelockspider", "skypeuripreview", "petalbot", "slackbot",
  "slack-imgproxy", "slurp", "snappy", "sogou", "solofield", "speedyspider", "speedy spider",
  "sputnikbot", "stackrambler", "teeraidbot", "teoma", "theusefulbot", "thumbshots\\.ru",
  "thumbshotsbot", "tineye", "tiktokspider", "toweya\\.com", "toweyabot", "tumblr", "tweetedtimes",
  "tweetmemebot", "twitterbot", "url2png", "vagabondo", "vebidoobot", "viber", "visionutils",
  "vkshare", "voilabot", "vortex", "votay bot", "voyager", "w3c_validator", "wasalive\\.bot",
  "web-sniffer", "websquash\\.com", "webthumb", "whatsapp", "whatweb", "wire", "wotbox", "yacybot",
  "yahoo", "yandex", "yeti", "yisouspider", "yodaobot", "yooglifetchagent", "yoozbot",
  "yottaamonitor", "yowedo", "zao-crawler", "zebot_www\\.ze\\.bz", "zooshot", "zyborg", "ai2bot",
  "amazonbot", "anthropic\\.com", "bard", "bytespider", "ccbot", "chatgpt-user", "claude-web",
  "claudebot", "cohere-ai", "deepseek", "diffbot", "duckassistbot", "gemini", "gptbot", "grok",
  "mistralai", "oai-searchbot", "openai\\.com", "perplexity\\.ai", "perplexitybot", "xai",
  "youbot",
  // Crawlers this middleware matched before the sync that the canonical list lacks
  "apis-google", "google-safety", "google-site-verification", "google-inspectiontool",
  "facebookcatalog", "telegrambot", "semrushbot", "anthropic-ai",
  // Matched before the sync, kept so current deployments keep the same coverage
  "naver", "ecosia", "tiktok", "chatgpt", "chrome-lighthouse",
];

const BOT_RE = new RegExp(BOT_AGENTS.join("|"), "i");

// Static-asset extensions, same regex as `RE.staticExt` in spiderable-middleware:
// https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/shared/static-extensions-regex.md
// `xml` and `json` are left out on purpose, so sitemaps and JSON-LD stay prerenderable.
const STATIC_EXT = /\.(?:3ds|3g2|3gp|3gpp|7z|a|aac|aaf|adp|ai|aif|aiff|alz|ape|apk|appcache|ar|arj|asf|asx|atom|au|avchd|avi|bak|bbaw|bh|bin|bk|bmp|btif|bz2|bzip2|cab|caf|cco|cgm|class|cmx|cpio|cr2|crt|crx|css|csv|cur|dat|deb|der|dex|djvu|dll|dmg|dng|doc|docm|docx|dot|dotm|dra|drc|ds_store|dsk|dts|dtshd|dvb|dwg|dxf|ear|ecelp4800|ecelp7470|ecelp9600|egg|eol|eot|eps|epub|exe|f4a|f4b|f4p|f4v|fbs|fh|fla|flac|fli|flv|fpx|fst|fvt|g3|geojson|gif|graffle|gz|gzip|h261|h263|h264|hqx|htc|ico|ief|img|ipa|iso|jad|jar|jardiff|jng|jnlp|jpeg|jpg|jpgv|jpm|js|jxr|key|kml|kmz|ktx|less|lha|lvp|lz|lzh|lzma|lzo|m2v|m3u|m4a|m4p|m4v|map|manifest|mar|markdown|md|mdi|mdown|mdwn|mht|mid|midi|mj2|mka|mkd|mkdn|mkdown|mkv|mml|mmr|mng|mobi|mov|movie|mp2|mp3|mp4|mp4a|mpe|mpeg|mpg|mpga|mpv|msi|msm|msp|mxf|mxu|nef|npx|nsv|numbers|o|oex|oga|ogg|ogv|opus|otf|pages|pbm|pcx|pdb|pdf|pea|pem|pgm|pic|pl|pm|png|pnm|pot|potm|potx|ppa|ppam|ppm|pps|ppsm|ppsx|ppt|pptm|pptx|prc|ps|psd|pya|pyc|pyo|pyv|qt|ra|rar|ras|raw|rdf|rgb|rip|rlc|rm|rmf|rmvb|ron|roq|rpm|rss|rtf|run|rz|s3m|s7z|safariextz|scpt|sea|sgi|shar|sil|sit|slk|smv|so|sub|svg|svgz|svi|swf|tar|tbz|tbz2|tcl|tga|tgz|thmx|tif|tiff|tk|tlz|topojson|torrent|ttc|ttf|txt|txz|udf|uvh|uvi|uvm|uvp|uvs|uvu|vcard|vcf|viv|vob|vtt|war|wav|wax|wbmp|wdp|weba|webapp|webm|webmanifest|webp|whl|wim|wm|wma|wml|wmlc|wmv|wmx|woff|woff2|wvx|xbm|xif|xla|xlam|xloc|xls|xlsb|xlsm|xlsx|xlt|xltm|xltx|xm|xmind|xpi|xpm|xsl|xwd|xz|yuv|z|zip|zipx)$/i;

const OSTRIO_HOST_RE = /(?:^|\.)ostr\.io$/i;

// ostr.io hands out OSTR_AUTH as a ready "Basic xxx" value. A plain
// "user:pass" works too and gets base64-encoded here.
const BASIC_AUTH_RE = /^Basic\s+\S/i;
let authWarned = false;

function readAuth(serviceURL) {
  const value = (process.env.OSTR_AUTH || "").trim();
  if (!value) {
    // Self-hosted renderers may not need credentials, ostr.io always does
    if (!authWarned && OSTRIO_HOST_RE.test(new URL(serviceURL).hostname)) {
      authWarned = true;
      console.warn('[ostr-middleware] OSTR_AUTH is empty, ostr.io will reject requests. Set it to "Basic xxx" or "user:pass" from ostr.io');
    }
    return "";
  }
  return BASIC_AUTH_RE.test(value) ? value : "Basic " + btoa(value);
}

// Visitor request headers passed on to the renderer, everything else is dropped
const FORWARD_HEADERS = ["user-agent", "accept", "accept-language"];

// Renderer response headers that must not reach the crawler. Same list as
// `ignoredHeaders` in spiderable-middleware: hop-by-hop headers, headers
// that describe the renderer's own connection or cache, and cookies.
// fetch() already decompressed the body, so content-encoding and
// content-length would describe bytes that no longer exist.
const IGNORED_HEADERS = new Set(["age", "alt-svc", "cache-status", "cf-connecting-ip", "cf-ipcountry", "cf-cache-status", "cf-ray", "cf-request-id", "cnection", "cneonction", "connection", "content-encoding", "content-length", "date", "etag", "expect-ct", "expires", "keep-alive", "last-modified", "link", "nel", "nncoection", "pragma", "proxy-authenticate", "proxy-authorization", "proxy-connection", "server", "set-cookie", "status", "te", "trailer", "transfer-encoding", "report-to", "upgrade", "vary", "via", "www-authenticate", "x-accel-buffering", "x-accel-charset", "x-accel-expires", "x-accel-limit-rate", "x-accel-redirect", "x-ostrio-domain", "x-powered-by", "x-preprender-status", "x-prerender-status", "x-real-ip", "x-runtime"]);

function filterResponseHeaders(source) {
  const headers = new Headers();
  for (const [name, value] of source) {
    const key = name.toLowerCase();
    // x-middleware-* headers are Vercel routing instructions, never take them from upstream
    if (IGNORED_HEADERS.has(key) || key.startsWith("x-middleware-")) continue;
    headers.append(name, value);
  }
  return headers;
}

// Statuses that the Response constructor refuses to pair with a body
const NULL_BODY_STATUSES = new Set([101, 204, 205, 304]);

// The renderer's own error bodies are short text/plain messages that end
// in a four-digit reason code, for example "Unauthorized! [1001]"
const GATEWAY_ERROR_RE = /^(Bad request!|Unauthorized!|Not permitted for this domain\. Wrong domain\.|Internal server error!|Origin is unreachable!|Origin timed out!)[\s\S]*\[\d{4}\]$/;
const GATEWAY_ERROR_MAX_BYTES = 512;

// ostr.io forwards the status a page declares (`<meta name="response:status-code">`),
// so a 404, 410 or 5xx can be the real answer the crawler must see. Fall back
// to the origin only when ostr.io itself could not render the page. The rule
// matches the ostr.io Cloudflare Worker:
// - the response carries X-Prerender-Reason (an error ostr.io reports itself)
// - the body is the renderer's own short text/plain error message
// - a 5xx without X-Prerender-Id and X-Prerender-Cache: it came from the
//   infrastructure in front of the renderer, every rendered page has them
async function isRendererFailure(response) {
  const headers = response.headers;
  if (headers.get("x-prerender-reason")) return true;

  if (response.status >= 500 && !headers.get("x-prerender-id") && !headers.get("x-prerender-cache")) {
    return true;
  }

  if (response.status < 400) return false;
  const contentType = (headers.get("content-type") || "").toLowerCase();
  if (!contentType.startsWith("text/plain")) return false;
  const length = Number.parseInt(headers.get("content-length") || "0", 10);
  if (length > GATEWAY_ERROR_MAX_BYTES) return false;
  try {
    const text = (await response.clone().text()).trim();
    return text.length <= GATEWAY_ERROR_MAX_BYTES && GATEWAY_ERROR_RE.test(text);
  } catch {
    return false;
  }
}

// Edge Functions must start responding within 25 s, so the default leaves
// room for the next() fallback after a timeout
const DEFAULT_TIMEOUT_MS = 20000;

function readTimeout() {
  const ms = Number.parseInt(process.env.OSTR_TIMEOUT || "", 10);
  return Number.isFinite(ms) && ms > 0 ? ms : DEFAULT_TIMEOUT_MS;
}

// One deadline covers both attempts. A network error before any response
// (a stale keep-alive socket, a DNS blip) gets one retry. A timeout does
// not: the time budget is already spent.
async function fetchRenderer(url, init, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    try {
      return await fetch(url, { ...init, signal: controller.signal });
    } catch (err) {
      if (controller.signal.aborted) throw err;
      return await fetch(url, { ...init, signal: controller.signal });
    }
  } finally {
    // The renderer answered (or failed), stop the clock so the body can stream
    clearTimeout(timer);
  }
}

export default async function middleware(request) {
  const url = new URL(request.url);

  // Only intercept GET/HEAD for HTML pages
  if (request.method !== "GET" && request.method !== "HEAD") return next();
  if (STATIC_EXT.test(url.pathname)) return next();
  // ACME challenges and other verification files must reach the app as is
  if (url.pathname.startsWith("/.well-known/")) return next();
  // A request for ostr.io itself would make the renderer call itself
  if (OSTRIO_HOST_RE.test(url.hostname)) return next();

  // BOT_RE is case-insensitive, keep the UA as sent so ostr.io sees the real value
  const ua = request.headers.get("user-agent") || "";
  const isBot = BOT_RE.test(ua);
  const hasEscapedFragment = url.searchParams.has("_escaped_fragment_");

  if (!isBot && !hasEscapedFragment) return next();

  // Proxy bot request to ostr.io
  const serviceURL = process.env.OSTR_SERVICE_URL || "https://render.ostr.io";

  // Use canonical origin — ostr.io only allows registered domains
  const canonicalOrigin = process.env.OSTR_SITE_ORIGIN || process.env.ROOT_URL || url.origin;
  let targetPath = url.pathname;
  const cleanParams = new URLSearchParams(url.searchParams);
  if (hasEscapedFragment) {
    // Legacy AJAX crawling: /page?_escaped_fragment_=/section renders /page/section
    const fragment = cleanParams.get("_escaped_fragment_");
    cleanParams.delete("_escaped_fragment_");
    if (fragment) {
      targetPath = targetPath.replace(/\/$/, "") + "/" + fragment.replace(/^\//, "");
    }
  }
  let targetUrl = canonicalOrigin + targetPath;
  const qs = cleanParams.toString();
  if (qs) targetUrl += "?" + qs;

  const renderUrl = `${serviceURL}/?url=${encodeURIComponent(targetUrl)}&bot=${encodeURIComponent(ua)}`;

  try {
    // Send only what the renderer needs. Cookies, x-forwarded-* and
    // x-vercel-* headers belong to the visitor and stay on Vercel.
    const headers = new Headers();
    for (const name of FORWARD_HEADERS) {
      const value = request.headers.get(name);
      if (value) headers.set(name, value);
    }
    const auth = readAuth(serviceURL);
    if (auth) headers.set("Authorization", auth);

    const response = await fetchRenderer(renderUrl, { method: request.method, headers, redirect: "manual" }, readTimeout());

    if (await isRendererFailure(response)) {
      console.warn(`[ostr-middleware] ostr.io returned ${response.status}, falling back to origin`);
      if (response.status === 401 || response.status === 403) {
        console.warn("[ostr-middleware] ostr.io rejected the credentials, check OSTR_AUTH");
      }
      return next();
    }

    // The rendered page's status reaches the crawler as is: 200, a 3xx with
    // its Location, or a genuine 404/410/5xx the page declared
    const noBody = request.method === "HEAD" || NULL_BODY_STATUSES.has(response.status);
    return new Response(noBody ? null : response.body, {
      status: response.status,
      headers: filterResponseHeaders(response.headers),
    });
  } catch (err) {
    console.warn("[ostr-middleware] ostr.io fetch failed, falling back to origin:", err);
    return next();
  }
}

export const config = {
  // Skip framework internals and static assets
  matcher: ["/((?!_next/static|_astro|favicon\\.ico).*)"],
};
