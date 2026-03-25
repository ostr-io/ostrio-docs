// /middleware.ts OR /src/middleware.ts
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// [IMPORTANT!]
// SET `PRERENDER_SERVICE_AUTH` OR `OSTR_AUTH` ENVIRONMENT VARIABLE
// TO TOKEN THAT STARTS WITH `Basic ...base64 encoded string...` FROM PRE-RENDERING PANEL
// OR HARD-CODE IT TO BELOW AS STRING
const AUTH_HEADER = process.env.PRERENDER_SERVICE_AUTH || process.env.SPIDERABLE_SERVICE_AUTH || process.env.OSTR_AUTH || '';

// SET TO false TO DISABLE SUPPORT OF _escaped_fragment_ GET QUERY
// DEPRECATED BY GOOGLE: https://developers.google.com/search/blog/2015/10/deprecating-our-ajax-crawling-scheme
// BUT STILL SUPPORTED BY OTHER SEARCH ENGINES
const SUPPORT_ESCAPED_FRAGMENT = true;

// LOGGER FACILITY (console BY DEFAULT)
const LOGGER = console;

// SET TO false TO DISABLE RENDERING FOR URLs WITH ?getquery=value
// SEE ALSO config.matcher
const PRERENDER_WITH_QUERY = true;

// ADD/CHANGE `IGNORED_PATHS_RE` RegExp TO MATCH AND
// IGNORE CERTAIN URLs THAT SHOULDN'T GET PRE-RENDERED WITHIN YOUR APP
// EXAMPLE: /^\/(admin\/|assets\/)/i
const IGNORED_PATHS_RE: RegExp | boolean = false;

// LIST OF EXTENSIONS TO IGNORE STATIC FILES
const IGNORE_EXTENSIONS = new Set(['3ds', '3g2', '3gp', '3gpp', '7z', 'a', 'aac', 'aaf', 'adp', 'ai', 'aif', 'aiff', 'alz', 'ape', 'apk', 'appcache', 'ar', 'arj', 'asf', 'asx', 'atom', 'au', 'avchd', 'avi', 'bak', 'bbaw', 'bh', 'bin', 'bk', 'bmp', 'btif', 'bz2', 'bzip2', 'cab', 'caf', 'cco', 'cgm', 'class', 'cmx', 'cpio', 'cr2', 'crt', 'crx', 'css', 'csv', 'cur', 'dat', 'deb', 'der', 'dex', 'djvu', 'dll', 'dmg', 'dng', 'doc', 'docm', 'docx', 'dot', 'dotm', 'dra', 'drc', 'DS_Store', 'dsk', 'dts', 'dtshd', 'dvb', 'dwg', 'dxf', 'ear', 'ecelp4800', 'ecelp7470', 'ecelp9600', 'egg', 'eol', 'eot', 'eps', 'epub', 'exe', 'f4a', 'f4b', 'f4p', 'f4v', 'fbs', 'fh', 'fla', 'flac', 'fli', 'flv', 'fpx', 'fst', 'fvt', 'g3', 'geojson', 'gif', 'graffle', 'gz', 'gzip', 'h261', 'h263', 'h264', 'hqx', 'htc', 'ico', 'ief', 'img', 'ipa', 'iso', 'jad', 'jar', 'jardiff', 'jng', 'jnlp', 'jpeg', 'jpg', 'jpgv', 'jpm', 'js', 'jxr', 'key', 'kml', 'kmz', 'ktx', 'less', 'lha', 'lvp', 'lz', 'lzh', 'lzma', 'lzo', 'm2v', 'm3u', 'm4a', 'm4p', 'm4v', 'map', 'manifest', 'mar', 'markdown', 'md', 'mdi', 'mdown', 'mdwn', 'mht', 'mid', 'midi', 'mj2', 'mka', 'mkd', 'mkdn', 'mkdown', 'mkv', 'mml', 'mmr', 'mng', 'mobi', 'mov', 'movie', 'mp2', 'mp3', 'mp4', 'mp4a', 'mpe', 'mpeg', 'mpg', 'mpga', 'mpv', 'msi', 'msm', 'msp', 'mxf', 'mxu', 'nef', 'npx', 'nsv', 'numbers', 'o', 'oex', 'oga', 'ogg', 'ogv', 'opus', 'otf', 'pages', 'pbm', 'pcx', 'pdb', 'pdf', 'pea', 'pem', 'pgm', 'pic', 'pl', 'pm', 'png', 'pnm', 'pot', 'potm', 'potx', 'ppa', 'ppam', 'ppm', 'pps', 'ppsm', 'ppsx', 'ppt', 'pptm', 'pptx', 'prc', 'ps', 'psd', 'pya', 'pyc', 'pyo', 'pyv', 'qt', 'ra', 'rar', 'ras', 'raw', 'rdf', 'rgb', 'rip', 'rlc', 'rm', 'rmf', 'rmvb', 'ron', 'roq', 'rpm', 'rss', 'rtf', 'run', 'rz', 's3m', 's7z', 'safariextz', 'scpt', 'sea', 'sgi', 'shar', 'sil', 'sit', 'slk', 'smv', 'so', 'sub', 'svg', 'svgz', 'svi', 'swf', 'tar', 'tbz', 'tbz2', 'tcl', 'tga', 'tgz', 'thmx', 'tif', 'tiff', 'tk', 'tlz', 'topojson', 'torrent', 'ttc', 'ttf', 'txt', 'txz', 'udf', 'uvh', 'uvi', 'uvm', 'uvp', 'uvs', 'uvu', 'vcard', 'vcf', 'viv', 'vob', 'vtt', 'war', 'wav', 'wax', 'wbmp', 'wdp', 'weba', 'webapp', 'webm', 'webmanifest', 'webp', 'whl', 'wim', 'wm', 'wma', 'wml', 'wmlc', 'wmv', 'wmx', 'woff', 'woff2', 'wvx', 'xbm', 'xif', 'xla', 'xlam', 'xloc', 'xls', 'xlsb', 'xlsm', 'xlsx', 'xlt', 'xltm', 'xltx', 'xm', 'xmind', 'xml', 'xpi', 'xpm', 'xsl', 'xwd', 'xz', 'yuv', 'z', 'zip', 'zipx']);

// LIST OF BOT AGENTS THAT WILL GET FORWARDED TO PRE-RENDERING
const BOT_AGENTS = ['\\.net crawler', '360spider', '50\\.nu', '8bo crawler bot', 'aboundex', 'accoona', 'adldxbot', 'adsbot-google', 'ahrefsbot', 'altavista', 'appengine-google', 'applebot', 'archiver', 'arielisbot', 'ask jeeves', 'auskunftbot', 'baidumobaider', 'baiduspider', 'becomebot', 'bingbot', 'bingpreview', 'bitbot', 'bitlybot', 'blitzbot', 'blogbridge', 'boardreader', 'botseer', 'catchbot', 'catchpoint bot', 'charlotte', 'checklinks', 'cliqzbot', 'clumboot', 'coccocbot', 'converacrawler', 'crawl-e', 'crawlconvera', 'dataparksearch', 'daum', 'deusu', 'developers\\.google\\.com/+/web/snippet', 'discordbot', 'dotbot', 'duckduckbot', 'elefent', 'embedly', 'evernote', 'exabot', 'facebookbot', 'facebookexternalhit', 'fatbot', 'fdse robot', 'feed seeker bot', 'feedfetcher', 'femtosearchbot', 'findlinks', 'flamingo_searchengine', 'flipboard', 'followsite bot', 'furlbot', 'fyberspider', 'gaisbot', 'galaxybot', 'geniebot', 'genieo', 'gigablast', 'gigabot', 'girafabot', 'gomezagent', 'gonzo1', 'google sketchup', 'google-structured-data-testing-tool', 'googlebot', 'haosouspider', 'heritrix', 'holmes', 'hoowwwer', 'htdig', 'hubspot\\ crawler', 'ia_archiver', 'idbot', 'infuzapp', 'innovazion crawler', 'internetarchive', 'iqdb', 'iskanie', 'istellabot', 'izsearch\\.com', 'kaloogabot', 'kaz\\.kz_bot', 'kd bot', 'konqueror', 'kraken', 'kurzor', 'larbin', 'leia', 'lesnikbot', 'linguee bot', 'linkaider', 'linkapediabot', 'linkedinbot', 'lite bot', 'llaut', 'lookseek', 'lycos', 'mail\\.ru_bot', 'masidani_bot', 'masscan', 'mediapartners-google', 'metajobbot', 'mj12bot', 'mnogosearch', 'mogimogi', 'mojeekbot', 'motominerbot', 'mozdex', 'msiecrawler', 'msnbot', 'msrbot', 'netpursual', 'netresearch', 'netvibes', 'newsgator', 'ng-search', 'nicebot', 'nutchcvs', 'nuzzel', 'nymesis', 'objectssearch', 'odklbot', 'omgili', 'oovoo', 'oozbot', 'openfosbot', 'orangebot', 'orbiter', 'org_bot', 'outbrain', 'pagepeeker', 'pagesinventory', 'parsijoobot', 'paxleframework', 'peeplo screenshot bot', 'pinterest', 'plantynet_webrobot', 'plukkie', 'pompos', 'psbot', 'quora link preview', 'qwantify', 'read%20later', 'reaper', 'redcarpet', 'redditbot', 'retreiver', 'riddler', 'rival iq', 'rogerbot', 'saucenao', 'scooter', 'scrapy', 'screaming\\ frog\\ seo\\ spider', 'scrubby', 'searchie', 'searchsight', 'seekbot', 'semanticdiscovery', 'seznambot', 'showyoubot', 'simplepie', 'simpy', 'sitelockspider', 'skypeuripreview', 'petalbot', 'slack-imgproxy', 'slackbot', 'slurp', 'snappy', 'sogou', 'solofield', 'speedy spider', 'speedyspider', 'sebot\\-wa', 'sputnikbot', 'stackrambler', 'teeraidbot', 'teoma', 'theusefulbot', 'thumbshots\\.ru', 'thumbshotsbot', 'tineye', 'tiktokspider', 'toweya\\.com', 'toweyabot', 'tumblr', 'tweetedtimes', 'tweetmemebot', 'twitterbot', 'url2png', 'vagabondo', 'vebidoobot', 'viber', 'visionutils', 'vkshare', 'voilabot', 'vortex', 'votay bot', 'voyager', 'w3c_validator', 'wasalive\\.bot', 'web-sniffer', 'websquash\\.com', 'webthumb', 'whatsapp', 'whatweb', 'wire', 'wotbox', 'yacybot', 'yahoo', 'yandex', 'yeti', 'yisouspider', 'yodaobot', 'yooglifetchagent', 'yoozbot', 'yottaamonitor', 'yowedo', 'zao-crawler', 'zebot_www\\.ze\\.bz', 'zooshot', 'zyborg', 'ai2bot', 'amazonbot', 'anthropic\\.com', 'bard', 'bytespider', 'ccbot', 'chatgpt-user', 'claude-web', 'claudebot', 'cohere-ai', 'deepseek', 'diffbot', 'duckassistbot', 'gemini', 'google-extended', 'gptbot', 'grok', 'meta-external', 'mistralai', 'oai-searchbot', 'omgili', 'openai\\.com', 'perplexity\\.ai', 'perplexitybot', 'xai', 'youbot'];
const BOT_AGENTS_RE = new RegExp(BOT_AGENTS.join('|'), 'i');

const DICT = {
  escapedFragment: '_escaped_fragment_',
  wellknownPath: '/.well-known/',
  slash: '/',
  dot: '.',
  empty: '',
  allowedMethods: new Set(['GET', 'HEAD']),
  args: { bot: '&bot=' },
  service: {
    origin: 'ostr.io',
    originTld: '.ostr.io',
    renderBase: 'https://render.ostr.io/?url=', // @see https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/rendering-endpoints.md
  },
  headers: {
    ua: 'user-agent',
    auth: 'authorization',
    host: 'host',
  },
  keepReqHeaders: ['user-agent', 'accept-language'],
  ignoreRespHeaders: ['age', 'alt-svc', 'cache-status', 'cf-connecting-ip', 'cf-ipcountry', 'cf-cache-status', 'cf-ray', 'cf-request-id', 'cnection', 'cneonction', 'connection', 'content-encoding', 'content-length', 'date', 'etag', 'expect-ct', 'expires', 'keep-alive', 'last-modified', 'link', 'nel', 'nncoection', 'pragma', 'server', 'set-cookie', 'status', 'transfer-encoding', 'report-to', 'vary', 'via', 'www-authenticate', 'x-accel-buffering', 'x-accel-charset', 'x-accel-expires', 'x-accel-limit-rate', 'x-accel-redirect', 'x-ostrio-domain', 'x-powered-by', 'x-preprender-status', 'x-prerender-status', 'x-real-ip', 'x-runtime'],
};

const beginningSlashRe = /^\//;
const trailingSlashRe = /\/$/;

if (!AUTH_HEADER) {
  throw new Error('pre-rendering middleware requires AUTH TOKEN! Hard-coded or set via PRERENDER_SERVICE_URL or OSTR_AUTH environment variable');
}

export const config = {
  matcher: '/((?!api|_next/static|_next/image|_next/webpack-hmr|\\.well-known|favicon.ico).*)'
};

function checkStatic(path: string): boolean {
  const lastDot = path.lastIndexOf(DICT.dot);
  const lastSlash = path.lastIndexOf(DICT.slash);
  const ext = lastDot > lastSlash ? path.slice(lastDot + 1) : DICT.empty;
  if (ext && IGNORE_EXTENSIONS.has(ext)) {
    return true;
  }
  return false;
}

function shouldPrerender(req: NextRequest, url: URL, ua: string): boolean {
  if (!DICT.allowedMethods.has(req.method)) {
    return false;
  }

  const path = url.pathname.toLowerCase();
  if (url.hostname === DICT.service.origin || url.hostname.endsWith(DICT.service.originTld) || path.includes(DICT.wellknownPath)) {
    return false;
  }

  if (checkStatic(path)) {
    return false;
  }

  if (IGNORED_PATHS_RE instanceof RegExp && IGNORED_PATHS_RE.test(path)) {
    return false;
  }

  if (!ua || !BOT_AGENTS_RE.test(ua)) {
    return false;
  }
  return true;
}

async function sendRequest(url: URL, headers: Headers, attempt: number|undefined = 1): Promise<Response|null> {
  const signal = AbortSignal.timeout(25000);

  try {
    const res = await fetch(url, {
      headers,
      signal,
    });

    return res;
  } catch (requestError) {
    const nextAttempt = attempt + 1;
    if (nextAttempt <= 2) {
      LOGGER.info('[ostr.io] [middleware] [sendRequest] RETRY REQUEST');
      return await sendRequest(url, headers, nextAttempt);
    }
    LOGGER.warn('[ostr.io] [middleware] [sendRequest] CAUGHT ERROR; ', requestError?.cause ?? requestError);
  }

  return null;
}

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const escapedFragment = url.searchParams.get(DICT.escapedFragment);
  const ua = (req.headers.get(DICT.headers.ua) || DICT.empty).toLowerCase();

  if (!shouldPrerender(req, url, ua) && typeof escapedFragment !== 'string') {
    return NextResponse.next();
  }

  let fetchUrl = `${url.origin}`;
  if (SUPPORT_ESCAPED_FRAGMENT && typeof escapedFragment === 'string') {
    url.searchParams.delete(DICT.escapedFragment);

    if (escapedFragment.length) {
      fetchUrl += `${url.pathname.replace(trailingSlashRe, DICT.empty)}${DICT.slash}${escapedFragment.replace(beginningSlashRe, DICT.empty)}`;
    } else {
      fetchUrl += url.pathname.replace(trailingSlashRe, DICT.empty);
    }

    if (checkStatic(fetchUrl.toLowerCase())) {
      return NextResponse.next();
    }
  } else {
    fetchUrl += url.pathname;
  }

  if (PRERENDER_WITH_QUERY && url.search && url.search.length > 1) {
    fetchUrl += url.search;
  }

  const headers = new Headers();
  headers.set(DICT.headers.auth, AUTH_HEADER);

  for (const h of DICT.keepReqHeaders) {
    if (req.headers.has(h)) {
      headers.set(h, req.headers.get(h));
    }
  }

  const renderUrl = new URL(`${DICT.service.renderBase}${encodeURIComponent(fetchUrl)}${DICT.args.bot}${encodeURIComponent(ua)}`);

  try {
    const res = await sendRequest(renderUrl, headers);

    if (res) {
      const outHeaders = new Headers(res.headers);
      for (const h of DICT.ignoreRespHeaders) {
        outHeaders.delete(h);
      }

      return new NextResponse(res.body, {
        status: res.status,
        headers: outHeaders,
      });
    }

    return NextResponse.next();
  } catch (fetchError) {
    LOGGER.warn('[ostr.io] [middleware] CAUGHT ERROR; FALLBACK TO NextResponse.next()', fetchError?.cause ?? fetchError);
    return NextResponse.next();
  }
}
