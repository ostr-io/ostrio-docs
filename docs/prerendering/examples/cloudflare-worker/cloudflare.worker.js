// [IMPORTANT!]
// SET `OSTR_AUTH`` ENVIRONMENT VARIABLE
// TO TOKEN THAT STARTS WITH `Basic ...base64 encoded string...` FROM PRE-RENDERING PANEL
// OR HARD-CODE `BASIC_TOKEN` BELOW AS STRING
const BASIC_TOKEN = '';

// SET TO false TO DISABLE SUPPORT OF _escaped_fragment_ GET QUERY
// DEPRECATED BY GOOGLE: https://developers.google.com/search/blog/2015/10/deprecating-our-ajax-crawling-scheme
// BUT STILL SUPPORTED BY OTHER SEARCH ENGINES
const SUPPORT_ESCAPED_FRAGMENT = true;

// SET TO false TO DISABLE RENDERING FOR URLs WITH ?getquery=value
const PRERENDER_WITH_QUERY = true;

// ADD/CHANGE `IGNORED_PATHS_RE` RegExp TO MATCH AND
// IGNORE CERTAIN URLs THAT SHOULDN'T GET PRE-RENDERED WITHIN YOUR APP
// LIKE: /^\/wp-admin|\/wp-login\.php/
const IGNORED_PATHS_RE = /^\/(wp-admin\/|wp-login\.php|wp-cron\.php)/i;

// LIST OF EXTENSIONS TO IGNORE STATIC FILES
const IGNORE_EXTENSIONS = new Set(['3ds', '3g2', '3gp', '3gpp', '7z', 'a', 'aac', 'aaf', 'adp', 'ai', 'aif', 'aiff', 'alz', 'ape', 'apk', 'appcache', 'ar', 'arj', 'asf', 'asx', 'atom', 'au', 'avchd', 'avi', 'bak', 'bbaw', 'bh', 'bin', 'bk', 'bmp', 'btif', 'bz2', 'bzip2', 'cab', 'caf', 'cco', 'cgm', 'class', 'cmx', 'cpio', 'cr2', 'crt', 'crx', 'css', 'csv', 'cur', 'dat', 'deb', 'der', 'dex', 'djvu', 'dll', 'dmg', 'dng', 'doc', 'docm', 'docx', 'dot', 'dotm', 'dra', 'drc', 'DS_Store', 'dsk', 'dts', 'dtshd', 'dvb', 'dwg', 'dxf', 'ear', 'ecelp4800', 'ecelp7470', 'ecelp9600', 'egg', 'eol', 'eot', 'eps', 'epub', 'exe', 'f4a', 'f4b', 'f4p', 'f4v', 'fbs', 'fh', 'fla', 'flac', 'fli', 'flv', 'fpx', 'fst', 'fvt', 'g3', 'geojson', 'gif', 'graffle', 'gz', 'gzip', 'h261', 'h263', 'h264', 'hqx', 'htc', 'ico', 'ief', 'img', 'ipa', 'iso', 'jad', 'jar', 'jardiff', 'jng', 'jnlp', 'jpeg', 'jpg', 'jpgv', 'jpm', 'js', 'jxr', 'key', 'kml', 'kmz', 'ktx', 'less', 'lha', 'lvp', 'lz', 'lzh', 'lzma', 'lzo', 'm2v', 'm3u', 'm4a', 'm4p', 'm4v', 'map', 'manifest', 'mar', 'markdown', 'md', 'mdi', 'mdown', 'mdwn', 'mht', 'mid', 'midi', 'mj2', 'mka', 'mkd', 'mkdn', 'mkdown', 'mkv', 'mml', 'mmr', 'mng', 'mobi', 'mov', 'movie', 'mp2', 'mp3', 'mp4', 'mp4a', 'mpe', 'mpeg', 'mpg', 'mpga', 'mpv', 'msi', 'msm', 'msp', 'mxf', 'mxu', 'nef', 'npx', 'nsv', 'numbers', 'o', 'oex', 'oga', 'ogg', 'ogv', 'opus', 'otf', 'pages', 'pbm', 'pcx', 'pdb', 'pdf', 'pea', 'pem', 'pgm', 'pic', 'pl', 'pm', 'png', 'pnm', 'pot', 'potm', 'potx', 'ppa', 'ppam', 'ppm', 'pps', 'ppsm', 'ppsx', 'ppt', 'pptm', 'pptx', 'prc', 'ps', 'psd', 'pya', 'pyc', 'pyo', 'pyv', 'qt', 'ra', 'rar', 'ras', 'raw', 'rdf', 'rgb', 'rip', 'rlc', 'rm', 'rmf', 'rmvb', 'ron', 'roq', 'rpm', 'rss', 'rtf', 'run', 'rz', 's3m', 's7z', 'safariextz', 'scpt', 'sea', 'sgi', 'shar', 'sil', 'sit', 'slk', 'smv', 'so', 'sub', 'svg', 'svgz', 'svi', 'swf', 'tar', 'tbz', 'tbz2', 'tcl', 'tga', 'tgz', 'thmx', 'tif', 'tiff', 'tk', 'tlz', 'topojson', 'torrent', 'ttc', 'ttf', 'txt', 'txz', 'udf', 'uvh', 'uvi', 'uvm', 'uvp', 'uvs', 'uvu', 'vcard', 'vcf', 'viv', 'vob', 'vtt', 'war', 'wav', 'wax', 'wbmp', 'wdp', 'weba', 'webapp', 'webm', 'webmanifest', 'webp', 'whl', 'wim', 'wm', 'wma', 'wml', 'wmlc', 'wmv', 'wmx', 'woff', 'woff2', 'wvx', 'xbm', 'xif', 'xla', 'xlam', 'xloc', 'xls', 'xlsb', 'xlsm', 'xlsx', 'xlt', 'xltm', 'xltx', 'xm', 'xmind', 'xpi', 'xpm', 'xsl', 'xwd', 'xz', 'yuv', 'z', 'zip', 'zipx']);

// LIST OF BOT AGENTS THAT WILL GET FORWARDED TO PRE-RENDERING
// Kept in sync byte-for-byte with the canonical regex:
// https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/shared/crawler-ua-regex.md
const BOT_AGENTS = ['\\.net crawler', '360spider', '50\\.nu', '8bo crawler bot', 'aboundex', 'accoona', 'adldxbot', 'ahrefsbot', 'altavista', 'appengine-google', 'applebot', 'archiver', 'arielisbot', 'ask jeeves', 'auskunftbot', 'baidumobaider', 'baiduspider', 'becomebot', 'bingbot', 'bingpreview', 'bitbot', 'bitlybot', 'blitzbot', 'blogbridge', 'boardreader', 'botseer', 'catchbot', 'catchpoint bot', 'charlotte', 'checklinks', 'cliqzbot', 'clumboot', 'coccocbot', 'converacrawler', 'crawl-e', 'crawlconvera', 'dataparksearch', 'daum', 'deusu', 'discordbot', 'dotbot', 'duckduckbot', 'elefent', 'embedly', 'evernote', 'exabot', 'facebookbot', 'facebookexternalhit', 'meta-external', 'fatbot', 'fdse robot', 'feed seeker bot', 'feedfetcher', 'femtosearchbot', 'findlinks', 'flamingo_searchengine', 'flipboard', 'followsite bot', 'furlbot', 'fyberspider', 'gaisbot', 'galaxybot', 'geniebot', 'genieo', 'gigablast', 'gigabot', 'girafabot', 'gomezagent', 'gonzo1', 'googlebot', 'google sketchup', 'adsbot-google', 'google-structured-data-testing-tool', 'google-extended', 'developers\\.google\\.com/\\+/web/snippet', 'haosouspider', 'heritrix', 'holmes', 'hoowwwer', 'htdig', 'ia_archiver', 'idbot', 'infuzapp', 'innovazion crawler', 'internetarchive', 'iqdb', 'iskanie', 'istellabot', 'izsearch\\.com', 'kaloogabot', 'kaz\\.kz_bot', 'kd bot', 'konqueror', 'kraken', 'kurzor', 'larbin', 'leia', 'lesnikbot', 'linguee bot', 'linkaider', 'linkapediabot', 'linkedinbot', 'lite bot', 'llaut', 'lookseek', 'lycos', 'mail\\.ru_bot', 'masidani_bot', 'masscan', 'mediapartners-google', 'metajobbot', 'mj12bot', 'mnogosearch', 'mogimogi', 'mojeekbot', 'motominerbot', 'mozdex', 'msiecrawler', 'msnbot', 'msrbot', 'netpursual', 'netresearch', 'netvibes', 'newsgator', 'ng-search', 'nicebot', 'nutchcvs', 'nuzzel', 'nymesis', 'objectssearch', 'odklbot', 'omgili', 'oovoo', 'oozbot', 'openfosbot', 'orangebot', 'orbiter', 'org_bot', 'outbrain', 'pagepeeker', 'pagesinventory', 'parsijoobot', 'paxleframework', 'peeplo screenshot bot', 'pinterest', 'plantynet_webrobot', 'plukkie', 'pompos', 'psbot', 'quora link preview', 'qwantify', 'read%20later', 'reaper', 'redcarpet', 'redditbot', 'retreiver', 'riddler', 'rival iq', 'rogerbot', 'saucenao', 'scooter', 'scrapy', 'scrubby', 'searchie', 'searchsight', 'seekbot', 'semanticdiscovery', 'seznambot', 'showyoubot', 'simplepie', 'simpy', 'sitelockspider', 'skypeuripreview', 'petalbot', 'slackbot', 'slack-imgproxy', 'slurp', 'snappy', 'sogou', 'solofield', 'speedyspider', 'speedy spider', 'sputnikbot', 'stackrambler', 'teeraidbot', 'teoma', 'theusefulbot', 'thumbshots\\.ru', 'thumbshotsbot', 'tineye', 'tiktokspider', 'toweya\\.com', 'toweyabot', 'tumblr', 'tweetedtimes', 'tweetmemebot', 'twitterbot', 'url2png', 'vagabondo', 'vebidoobot', 'viber', 'visionutils', 'vkshare', 'voilabot', 'vortex', 'votay bot', 'voyager', 'w3c_validator', 'wasalive\\.bot', 'web-sniffer', 'websquash\\.com', 'webthumb', 'whatsapp', 'whatweb', 'wire', 'wotbox', 'yacybot', 'yahoo', 'yandex', 'yeti', 'yisouspider', 'yodaobot', 'yooglifetchagent', 'yoozbot', 'yottaamonitor', 'yowedo', 'zao-crawler', 'zebot_www\\.ze\\.bz', 'zooshot', 'zyborg', 'ai2bot', 'amazonbot', 'anthropic\\.com', 'bard', 'bytespider', 'ccbot', 'chatgpt-user', 'claude-web', 'claudebot', 'cohere-ai', 'deepseek', 'diffbot', 'duckassistbot', 'gemini', 'gptbot', 'grok', 'mistralai', 'oai-searchbot', 'openai\\.com', 'perplexity\\.ai', 'perplexitybot', 'xai', 'youbot'];
const BOT_AGENTS_RE = new RegExp(BOT_AGENTS.join('|'), 'i');

const DICT = {
  escapedFragment: '_escaped_fragment_',
  wellknownPath: '/.well-known/',
  slash: '/',
  dot: '.',
  string: 'string',
  stringEmpty: '',
  manual: 'manual',
  allowedMethods: new Set(['GET', 'HEAD']),
  args: {
    bot: '&bot=',
  },
  service: {
    origin: 'ostr.io',
    originTld: '.ostr.io',
    testAuth: 'Basic dGVzdDp0ZXN0',
    renderBase: 'https://render.ostr.io/?url=', // @see https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/rendering-endpoints.md
  },
  headers: {
    ua: 'User-Agent',
    auth: 'Authorization',
  }
};

const beginningSlashRe = /^\//;
const trailingSlashRe = /\/$/;

const shouldPrerender = (request, url, userAgent) => {
  if (!DICT.allowedMethods.has(request.method)) {
    return false;
  }

  const pathName = url.pathname.toLowerCase();
  if (url.hostname === DICT.service.origin || url.hostname.endsWith(DICT.service.originTld) || pathName.includes(DICT.wellknownPath)) {
    return false;
  }

  const lastDot = pathName.lastIndexOf(DICT.dot);
  const lastSlash = pathName.lastIndexOf(DICT.slash);
  const extension = (lastDot > lastSlash) ? pathName.substring(lastDot + 1).toLowerCase() : DICT.stringEmpty;
  if (extension && IGNORE_EXTENSIONS.has(extension)) {
    return false;
  }

  if (IGNORED_PATHS_RE instanceof RegExp && IGNORED_PATHS_RE.test(pathName)) {
    return false;
  }

  const hasEscapedFragment = url.searchParams.has(DICT.escapedFragment);
  if (SUPPORT_ESCAPED_FRAGMENT && hasEscapedFragment) {
    return true;
  }

  if (!userAgent || !BOT_AGENTS_RE.test(userAgent)) {
    return false;
  }

  return true;
};

// A STATUS OUTSIDE 2xx/3xx IS NOT BY ITSELF A REASON TO FALL BACK TO YOUR ORIGIN:
// ostr.io FORWARDS A PAGE'S OWN `<meta name="response:status-code">` VERBATIM, SO A RENDERED
// 404/410/451/5xx IS THE GENUINE ANSWER THE CRAWLER MUST SEE. FALL BACK ONLY WHEN THE RESPONSE
// IS ostr.io's OWN: IT CARRIES `X-Prerender-Reason`, OR ITS BODY IS THE SERVICE'S text/plain
// ERROR SHAPE ENDING IN A BRACKETED FOUR-DIGIT REASON CODE
const GATEWAY_ERROR_RE = /^(Bad request!|Unauthorized!|Not permitted for this domain\. Wrong domain\.|Internal server error!|Origin is unreachable!|Origin timed out!)[\s\S]*\[\d{4}\]$/;
const GATEWAY_ERROR_MAX_BYTES = 512;

const isGatewayError = async (response) => {
  if (response.headers.get('X-Prerender-Reason')) {
    return true;
  }

  const contentType = (response.headers.get('Content-Type') || '').toLowerCase();
  if (!contentType.startsWith('text/plain')) {
    return false;
  }

  const length = parseInt(response.headers.get('Content-Length') || '0', 10);
  if (length > GATEWAY_ERROR_MAX_BYTES) {
    return false;
  }

  try {
    const text = (await response.clone().text()).trim();
    return text.length <= GATEWAY_ERROR_MAX_BYTES && GATEWAY_ERROR_RE.test(text);
  } catch (readError) {
    return false;
  }
};

const withFallbackMarker = async (request, marker) => {
  const originResponse = await fetch(request);
  const responseWithHeader = new Response(originResponse.body, {
    status: originResponse.status,
    statusText: originResponse.statusText,
    headers: new Headers(originResponse.headers)
  });
  responseWithHeader.headers.set('X-Prerender-Reason', marker);
  return responseWithHeader;
};

export default {
  async fetch(request, env) {
    const AUTH_HEADER = env.OSTR_AUTH || BASIC_TOKEN || DICT.service.testAuth;
    const url = new URL(request.url);
    const userAgent = (request.headers.get(DICT.headers.ua) || DICT.stringEmpty).toLowerCase();
    const hasEscapedFragment = url.searchParams.has(DICT.escapedFragment);

    if (!shouldPrerender(request, url, userAgent)) {
      return fetch(request);
    }

    const headers = new Headers(request.headers);
    headers.delete(DICT.headers.auth);
    headers.set(DICT.headers.auth, AUTH_HEADER);

    let fetchUrl = url.origin;
    if (SUPPORT_ESCAPED_FRAGMENT && hasEscapedFragment) {
      const escapedFragment = url.searchParams.get(DICT.escapedFragment);
      url.searchParams.delete(DICT.escapedFragment);

      if (escapedFragment.length) {
        fetchUrl += `${url.pathname.replace(trailingSlashRe, DICT.stringEmpty)}${DICT.slash}${escapedFragment.replace(beginningSlashRe, DICT.stringEmpty)}`;
      } else {
        fetchUrl += url.pathname.replace(trailingSlashRe, DICT.stringEmpty);
      }
    } else {
      fetchUrl += url.pathname;
    }

    if (PRERENDER_WITH_QUERY && typeof url.search === DICT.string && url.search.length > 1) {
      fetchUrl += url.search;
    }

    try {
      const response = await fetch(new Request(`${DICT.service.renderBase}${encodeURIComponent(fetchUrl)}${DICT.args.bot}${encodeURIComponent(userAgent)}`, {
        headers: headers,
        redirect: DICT.manual,
      }));

      // 3xx redirects intentionally pass through
      if (response.status >= 200 && response.status < 400) {
        return response;
      }

      if (await isGatewayError(response)) {
        console.warn('[CloudFlare Worker] [pre-rendering] [fetch] Gateway error', response.status, ', falling back to origin');
        return withFallbackMarker(request, `worker-fallback-${response.status}`);
      }

      // A rendered page with a genuine non-2xx status: the crawler gets exactly what was rendered
      return response;
    } catch (fetchError) {
      console.warn('[CloudFlare Worker] [pre-rendering] [fetch] REDIRECT TO ostr.io FAILED WITH fetchError:', fetchError);
      return withFallbackMarker(request, 'worker-fallback-error');
    }
  }
};
