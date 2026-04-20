// supabase/functions/_shared/ostr.ts
//
// Shared pre-rendering helpers for Supabase Edge Functions.
// Import from every framework variant (deno.ts, hono.ts, oak.ts, fresh-middleware.ts)
// so the UA list, static-extension list, and render-endpoint behavior stay in sync.
//
// Canonical regex sources:
//   https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/shared/crawler-ua-regex.md
//   https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/shared/static-extensions-regex.md

// Comprehensive crawler, social-preview, and AI-fetcher User-Agent list.
const BOT_AGENTS = [
  '\\.net crawler', '360spider', '50\\.nu', '8bo crawler bot', 'aboundex', 'accoona',
  'adldxbot', 'adsbot-google', 'ahrefsbot', 'altavista', 'appengine-google', 'applebot',
  'archiver', 'arielisbot', 'ask jeeves', 'auskunftbot', 'baidumobaider', 'baiduspider',
  'becomebot', 'bingbot', 'bingpreview', 'bitbot', 'bitlybot', 'blitzbot', 'blogbridge',
  'boardreader', 'botseer', 'catchbot', 'catchpoint bot', 'charlotte', 'checklinks',
  'cliqzbot', 'clumboot', 'coccocbot', 'converacrawler', 'crawl-e', 'crawlconvera',
  'dataparksearch', 'daum', 'deusu', 'developers\\.google\\.com/\\+/web/snippet',
  'discordbot', 'dotbot', 'duckduckbot', 'elefent', 'embedly', 'evernote', 'exabot',
  'facebookbot', 'facebookexternalhit', 'fatbot', 'fdse robot', 'feed seeker bot',
  'feedfetcher', 'femtosearchbot', 'findlinks', 'flamingo_searchengine', 'flipboard',
  'followsite bot', 'furlbot', 'fyberspider', 'gaisbot', 'galaxybot', 'geniebot',
  'genieo', 'gigablast', 'gigabot', 'girafabot', 'gomezagent', 'gonzo1', 'google sketchup',
  'google-structured-data-testing-tool', 'googlebot', 'haosouspider', 'heritrix', 'holmes',
  'hoowwwer', 'htdig', 'ia_archiver', 'idbot', 'infuzapp', 'innovazion crawler',
  'instagram', 'internetarchive', 'iqdb', 'iskanie', 'istellabot', 'izsearch\\.com',
  'kaloogabot', 'kaz\\.kz_bot', 'kd bot', 'konqueror', 'kraken', 'kurzor', 'larbin',
  'leia', 'lesnikbot', 'linguee bot', 'linkaider', 'linkapediabot', 'linkedinbot',
  'lite bot', 'llaut', 'lookseek', 'lycos', 'mail\\.ru_bot', 'masidani_bot', 'masscan',
  'mediapartners-google', 'metajobbot', 'mj12bot', 'mnogosearch', 'mogimogi', 'mojeekbot',
  'motominerbot', 'mozdex', 'msiecrawler', 'msnbot', 'msrbot', 'netpursual', 'netresearch',
  'netvibes', 'newsgator', 'ng-search', 'nicebot', 'nutchcvs', 'nuzzel', 'nymesis',
  'objectssearch', 'odklbot', 'omgili', 'oovoo', 'oozbot', 'openfosbot', 'orangebot',
  'orbiter', 'org_bot', 'outbrain', 'pagepeeker', 'pagesinventory', 'parsijoobot',
  'paxleframework', 'peeplo screenshot bot', 'pinterest', 'plantynet_webrobot', 'plukkie',
  'pompos', 'psbot', 'quora link preview', 'qwantify', 'read%20later', 'reaper',
  'redcarpet', 'redditbot', 'retreiver', 'riddler', 'rival iq', 'rogerbot', 'saucenao',
  'scooter', 'scrapy', 'scrubby', 'searchie', 'searchsight', 'seekbot', 'semanticdiscovery',
  'seznambot', 'showyoubot', 'simplepie', 'simpy', 'sitelockspider', 'skypeuripreview',
  'petalbot', 'slackbot', 'slack-imgproxy', 'slurp', 'snappy', 'sogou', 'solofield',
  'speedyspider', 'speedy spider', 'sputnikbot', 'stackrambler', 'teeraidbot', 'teoma',
  'theusefulbot', 'thumbshots\\.ru', 'thumbshotsbot', 'tineye', 'tiktokspider',
  'toweya\\.com', 'toweyabot', 'tumblr', 'tweetedtimes', 'tweetmemebot', 'twitterbot',
  'url2png', 'vagabondo', 'vebidoobot', 'viber', 'visionutils', 'vkshare', 'voilabot',
  'vortex', 'votay bot', 'voyager', 'w3c_validator', 'wasalive\\.bot', 'web-sniffer',
  'websquash\\.com', 'webthumb', 'whatsapp', 'whatweb', 'wire', 'wotbox', 'yacybot',
  'yahoo', 'yandex', 'yeti', 'yisouspider', 'yodaobot', 'yooglifetchagent', 'yoozbot',
  'yottaamonitor', 'yowedo', 'zao-crawler', 'zebot_www\\.ze\\.bz', 'zooshot', 'zyborgi',
  // AI / LLM fetchers
  'ai2bot', 'amazonbot', 'anthropic\\.com', 'bard', 'bytespider', 'ccbot', 'chatgpt-user',
  'claude-web', 'claudebot', 'cohere-ai', 'deepseek', 'diffbot', 'duckassistbot', 'gemini',
  'google-extended', 'gptbot', 'grok', 'meta-external', 'mistralai', 'oai-searchbot',
  'openai\\.com', 'perplexity\\.ai', 'perplexitybot', 'xai', 'youbot',
];

export const BOT_AGENTS_RE = new RegExp(BOT_AGENTS.join('|'), 'i');

// Static-asset extensions served directly by the origin / CDN.
const IGNORE_EXTENSIONS = new Set([
  '3ds', '3g2', '3gp', '3gpp', '7z', 'a', 'aac', 'aaf', 'adp', 'ai', 'aif', 'aiff', 'alz',
  'ape', 'apk', 'appcache', 'ar', 'arj', 'asf', 'asx', 'atom', 'au', 'avchd', 'avi', 'bak',
  'bbaw', 'bh', 'bin', 'bk', 'bmp', 'btif', 'bz2', 'bzip2', 'cab', 'caf', 'cco', 'cgm',
  'class', 'cmx', 'cpio', 'cr2', 'crt', 'crx', 'css', 'csv', 'cur', 'dat', 'deb', 'der',
  'dex', 'djvu', 'dll', 'dmg', 'dng', 'doc', 'docm', 'docx', 'dot', 'dotm', 'dra', 'drc',
  'DS_Store', 'dsk', 'dts', 'dtshd', 'dvb', 'dwg', 'dxf', 'ear', 'ecelp4800', 'ecelp7470',
  'ecelp9600', 'egg', 'eol', 'eot', 'eps', 'epub', 'exe', 'f4a', 'f4b', 'f4p', 'f4v',
  'fbs', 'fh', 'fla', 'flac', 'fli', 'flv', 'fpx', 'fst', 'fvt', 'g3', 'geojson', 'gif',
  'graffle', 'gz', 'gzip', 'h261', 'h263', 'h264', 'hqx', 'htc', 'ico', 'ief', 'img',
  'ipa', 'iso', 'jad', 'jar', 'jardiff', 'jng', 'jnlp', 'jpeg', 'jpg', 'jpgv', 'jpm',
  'js', 'jxr', 'key', 'kml', 'kmz', 'ktx', 'less', 'lha', 'lvp', 'lz', 'lzh', 'lzma',
  'lzo', 'm2v', 'm3u', 'm4a', 'm4p', 'm4v', 'map', 'manifest', 'mar', 'markdown', 'md',
  'mdi', 'mdown', 'mdwn', 'mht', 'mid', 'midi', 'mj2', 'mka', 'mkd', 'mkdn', 'mkdown',
  'mkv', 'mml', 'mmr', 'mng', 'mobi', 'mov', 'movie', 'mp2', 'mp3', 'mp4', 'mp4a', 'mpe',
  'mpeg', 'mpg', 'mpga', 'mpv', 'msi', 'msm', 'msp', 'mxf', 'mxu', 'nef', 'npx', 'nsv',
  'numbers', 'o', 'oex', 'oga', 'ogg', 'ogv', 'opus', 'otf', 'pages', 'pbm', 'pcx', 'pdb',
  'pdf', 'pea', 'pem', 'pgm', 'pic', 'pl', 'pm', 'png', 'pnm', 'pot', 'potm', 'potx',
  'ppa', 'ppam', 'ppm', 'pps', 'ppsm', 'ppsx', 'ppt', 'pptm', 'pptx', 'prc', 'ps', 'psd',
  'pya', 'pyc', 'pyo', 'pyv', 'qt', 'ra', 'rar', 'ras', 'raw', 'rdf', 'rgb', 'rip', 'rlc',
  'rm', 'rmf', 'rmvb', 'ron', 'roq', 'rpm', 'rss', 'rtf', 'run', 'rz', 's3m', 's7z',
  'safariextz', 'scpt', 'sea', 'sgi', 'shar', 'sil', 'sit', 'slk', 'smv', 'so', 'sub',
  'svg', 'svgz', 'svi', 'swf', 'tar', 'tbz', 'tbz2', 'tcl', 'tga', 'tgz', 'thmx', 'tif',
  'tiff', 'tk', 'tlz', 'topojson', 'torrent', 'ttc', 'ttf', 'txt', 'txz', 'udf', 'uvh',
  'uvi', 'uvm', 'uvp', 'uvs', 'uvu', 'vcard', 'vcf', 'viv', 'vob', 'vtt', 'war', 'wav',
  'wax', 'wbmp', 'wdp', 'weba', 'webapp', 'webm', 'webmanifest', 'webp', 'whl', 'wim',
  'wm', 'wma', 'wml', 'wmlc', 'wmv', 'wmx', 'woff', 'woff2', 'wvx', 'xbm', 'xif', 'xla',
  'xlam', 'xloc', 'xls', 'xlsb', 'xlsm', 'xlsx', 'xlt', 'xltm', 'xltx', 'xm', 'xmind',
  'xpi', 'xpm', 'xsl', 'xwd', 'xz', 'yuv', 'z', 'zip', 'zipx',
]);

const ALLOWED_METHODS = new Set(['GET', 'HEAD']);
const WELLKNOWN_PATH = '/.well-known/';
const SERVICE_URL = Deno.env.get('OSTR_SERVICE_URL') ?? 'https://render.ostr.io';
const OSTR_AUTH = Deno.env.get('OSTR_AUTH') ?? '';

// Request headers forwarded to the renderer verbatim.
const KEEP_REQ_HEADERS = ['user-agent', 'accept-language'];

// Response headers stripped before returning the rendered snapshot to the client.
const IGNORE_RESP_HEADERS = new Set([
  'age', 'alt-svc', 'cache-status', 'cf-connecting-ip', 'cf-ipcountry',
  'cf-cache-status', 'cf-ray', 'cf-request-id', 'connection', 'content-encoding',
  'content-length', 'keep-alive', 'nel', 'report-to', 'server', 'set-cookie',
  'transfer-encoding', 'via', 'www-authenticate', 'x-powered-by',
]);

function hasStaticExtension(pathname: string): boolean {
  const lastDot = pathname.lastIndexOf('.');
  const lastSlash = pathname.lastIndexOf('/');
  if (lastDot <= lastSlash) return false;
  const ext = pathname.slice(lastDot + 1);
  return IGNORE_EXTENSIONS.has(ext);
}

export interface PrerenderDecision {
  shouldPrerender: boolean;
  renderTarget: string;
  ua: string;
}

/**
 * Decide whether a request should be routed to the ostr.io renderer.
 * Returns the canonical `renderTarget` URL (origin + path + filtered query)
 * that must be passed to the renderer when `shouldPrerender` is true.
 */
export function decide(req: Request, siteOrigin?: string): PrerenderDecision {
  const url = new URL(req.url);
  const origin = siteOrigin ?? Deno.env.get('ROOT_URL') ?? url.origin;

  // Filter _escaped_fragment_ out of the forwarded query string.
  const params = new URLSearchParams(url.searchParams);
  const hasEscapedFragment = params.has('_escaped_fragment_');
  params.delete('_escaped_fragment_');
  const qs = params.toString();
  const renderTarget = origin + url.pathname + (qs ? '?' + qs : '');

  const ua = (req.headers.get('user-agent') ?? '').toLowerCase();

  if (!ALLOWED_METHODS.has(req.method)) return { shouldPrerender: false, renderTarget, ua };
  if (url.pathname.includes(WELLKNOWN_PATH)) return { shouldPrerender: false, renderTarget, ua };
  if (hasStaticExtension(url.pathname)) return { shouldPrerender: false, renderTarget, ua };

  if (!BOT_AGENTS_RE.test(ua) && !hasEscapedFragment) {
    return { shouldPrerender: false, renderTarget, ua };
  }

  return { shouldPrerender: true, renderTarget, ua };
}

/**
 * Fetch a rendered snapshot for `renderTarget` from the ostr.io endpoint.
 * Returns `null` when the renderer responds with a non-2xx/3xx status
 * or throws — callers must fall back to origin (fail-open).
 */
export async function fetchRendered(
  req: Request,
  renderTarget: string,
  ua: string,
): Promise<Response | null> {
  if (!OSTR_AUTH) {
    console.warn('[ostr.io] OSTR_AUTH is not set; falling back to origin');
    return null;
  }

  const headers = new Headers();
  headers.set('authorization', OSTR_AUTH);
  for (const h of KEEP_REQ_HEADERS) {
    const v = req.headers.get(h);
    if (v) headers.set(h, v);
  }

  const url = `${SERVICE_URL}/?url=${encodeURIComponent(renderTarget)}&bot=${encodeURIComponent(ua)}`;

  try {
    const res = await fetch(url, { headers, redirect: 'manual', signal: AbortSignal.timeout(25000) });
    if (!res.ok && res.status !== 301 && res.status !== 302) {
      console.warn(`[ostr.io] renderer returned ${res.status}; falling back to origin`);
      return null;
    }

    const out = new Headers(res.headers);
    for (const h of IGNORE_RESP_HEADERS) out.delete(h);
    return new Response(res.body, { status: res.status, headers: out });
  } catch (err) {
    console.warn('[ostr.io] renderer fetch failed; falling back to origin:', err);
    return null;
  }
}

/**
 * Proxy the inbound request to the configured origin. Used by reverse-proxy
 * Edge Functions that sit in front of a separate origin. SSR-in-Edge-Function
 * apps (Fresh, app-mode Hono/Oak) call their own handler instead.
 */
export function proxyToOrigin(req: Request, siteOrigin?: string): Promise<Response> {
  const url = new URL(req.url);
  const origin = siteOrigin ?? Deno.env.get('ROOT_URL') ?? url.origin;
  const target = origin + url.pathname + url.search;
  return fetch(target, {
    method: req.method,
    headers: req.headers,
    body: req.body,
    redirect: 'manual',
  });
}
