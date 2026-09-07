// ostr.io MANAGED Cloudflare Worker — uploaded by ostr.io through the customer's OAuth
// grant as the script `ostrio-prerender` (roadmap plan 3). DO NOT EDIT IN THE CLOUDFLARE
// DASHBOARD: only an install re-uploads this body (`uploadWorker`); a UA-list or path-rule
// change is a settings PATCH that leaves the body alone, so a hand edit is not reverted —
// it survives until the recurring recheck hashes the deployed script, flags `script-changed`
// and marks the integration `drifted`. The customer-adjustable parts are the two bindings
// below.
//
// Bindings, set by ostr.io on upload (`imports/server/cloudflare/install.js`):
//   OSTR_AUTH            secret_text  `Basic <base64 prerenderId:password>` gateway auth
//   OSTR_EXTRA_BOT_UAS   plain_text   JSON array of extra lowercase UA substrings
//   OSTR_PATH_RULES      plain_text   JSON array of per-path rules, first match wins
//
// Derived from the published example
// (boris_git/docs/prerendering/examples/cloudflare-worker/cloudflare.worker.js); the
// crawler-UA list and the static-extension list below are carried BYTE-FOR-BYTE from it
// and from the canonical regex it tracks (`RULES.md` §11). Customer UA entries EXTEND that
// list, never replace it.

// Only used when the OSTR_AUTH binding is missing, which for a managed install never happens
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
    // @see https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/rendering-endpoints.md
    endpoints: {
      'render': 'https://render.ostr.io/?url=',
      'render-cache': 'https://render-cache.ostr.io/?url=',
      'render-bypass': 'https://render-bypass.ostr.io/?url=',
    },
    defaultEndpoint: 'render',
  },
  headers: {
    ua: 'User-Agent',
    auth: 'Authorization',
  }
};

const beginningSlashRe = /^\//;
const trailingSlashRe = /\/$/;
const regExpEscapeRe = /[.*+?^${}()|[\]\\]/g;

// Caps mirror the ostr.io-side validation (`cloudflare.methods.js`); they exist so a binding
// that somehow arrives oversized cannot build a pathological RegExp inside the isolate
const MAX_EXTRA_UAS = 64;
const MAX_UA_LENGTH = 128;
const MAX_PATH_RULES = 64;
const MAX_MATCH_LENGTH = 256;
const RULE_KEYS = new Set(['match', 'render', 'force', 'ignoreGetQuery', 'stripParams', 'endpoint']);

let warned = false;
const warnOnce = (message, error) => {
  if (warned) {
    return;
  }
  warned = true;
  console.warn('[ostr.io] [pre-rendering]', message, error);
};

const parseArrayBinding = (raw, label) => {
  if (typeof raw !== DICT.string || !raw.length) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (parseError) {
    // A bad customer edit must never disable the canonical behaviour
    warnOnce(`could not parse ${label}, ignoring it`, parseError);
    return [];
  }
};

/*
 * Customer UA substrings EXTEND the canonical alternation, they never replace it. Entries
 * are plain text, so they are RegExp-escaped before being appended — the canonical list is
 * already stored pre-escaped.
 */
const buildBotAgentsRe = (raw) => {
  const extra = parseArrayBinding(raw, 'OSTR_EXTRA_BOT_UAS');
  const escaped = [];

  for (let i = 0; i < extra.length && escaped.length < MAX_EXTRA_UAS; i++) {
    const entry = extra[i];
    if (typeof entry !== DICT.string) {
      continue;
    }
    const trimmed = entry.trim().toLowerCase().slice(0, MAX_UA_LENGTH);
    if (trimmed.length) {
      escaped.push(trimmed.replace(regExpEscapeRe, '\\$&'));
    }
  }

  if (!escaped.length) {
    return BOT_AGENTS_RE;
  }

  return new RegExp(BOT_AGENTS.concat(escaped).join('|'), 'i');
};

/*
 * `*` matches any run of characters; a rule is anchored at the start of the path. No regex
 * from customers — a glob cannot be catastrophic and cannot be a foot-gun.
 */
const compileGlob = (match) => {
  const escaped = match.slice(0, MAX_MATCH_LENGTH).replace(regExpEscapeRe, '\\$&').split('\\*').join('.*');
  return new RegExp(`^${escaped}`, 'i');
};

const buildPathRules = (raw) => {
  const parsed = parseArrayBinding(raw, 'OSTR_PATH_RULES');
  const rules = [];

  for (let i = 0; i < parsed.length && rules.length < MAX_PATH_RULES; i++) {
    const rule = parsed[i];
    if (!rule || typeof rule !== 'object' || typeof rule.match !== DICT.string || !rule.match.length) {
      continue;
    }

    const keys = Object.keys(rule);
    for (let k = 0; k < keys.length; k++) {
      if (!RULE_KEYS.has(keys[k])) {
        warnOnce(`unknown OSTR_PATH_RULES key "${keys[k]}", ignoring it`);
      }
    }

    let re;
    try {
      re = compileGlob(rule.match);
    } catch (globError) {
      warnOnce(`could not compile OSTR_PATH_RULES match "${rule.match}"`, globError);
      continue;
    }

    rules.push({
      re,
      render: rule.render,
      force: rule.force === true,
      ignoreGetQuery: rule.ignoreGetQuery,
      stripParams: Array.isArray(rule.stripParams) ? rule.stripParams : null,
      endpoint: DICT.service.endpoints[rule.endpoint] ? rule.endpoint : null,
    });
  }

  return rules;
};

// First match wins. Compiled once per isolate per binding value, not per request.
const matchRule = (rules, pathName) => {
  for (let i = 0; i < rules.length; i++) {
    if (rules[i].re.test(pathName)) {
      return rules[i];
    }
  }
  return null;
};

/*
 * Workers module format hands `env` to the handler, not to module scope, so the two
 * bindings are compiled on the isolate's FIRST request and reused for every request after
 * it — the per-request cost stays the one `RegExp.test` it has always been.
 */
let cachedUasSource = null;
let cachedBotAgentsRe = BOT_AGENTS_RE;
let cachedRulesSource = null;
let cachedPathRules = [];

const botAgentsReFor = (raw) => {
  if (raw !== cachedUasSource) {
    cachedUasSource = raw;
    cachedBotAgentsRe = buildBotAgentsRe(raw);
  }
  return cachedBotAgentsRe;
};

const pathRulesFor = (raw) => {
  if (raw !== cachedRulesSource) {
    cachedRulesSource = raw;
    cachedPathRules = buildPathRules(raw);
  }
  return cachedPathRules;
};

const stripParams = (url, patterns) => {
  if (!patterns || !patterns.length) {
    return;
  }

  const names = [];
  for (const name of url.searchParams.keys()) {
    names.push(name);
  }

  for (let i = 0; i < names.length; i++) {
    const name = names[i].toLowerCase();
    for (let j = 0; j < patterns.length; j++) {
      const pattern = `${patterns[j]}`.toLowerCase();
      const matched = pattern.endsWith('*') ? name.startsWith(pattern.slice(0, -1)) : name === pattern;
      if (matched) {
        url.searchParams.delete(names[i]);
        break;
      }
    }
  }
};

const shouldPrerender = (request, url, userAgent, botAgentsRe, rule) => {
  if (!DICT.allowedMethods.has(request.method)) {
    return false;
  }

  const pathName = url.pathname.toLowerCase();
  if (url.hostname === DICT.service.origin || url.hostname.endsWith(DICT.service.originTld) || pathName.includes(DICT.wellknownPath)) {
    return false;
  }

  // An explicit `render: false` wins over everything below it, including `force`
  if (rule && rule.render === false) {
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

  // `force: true` pre-renders this path for a human UA too
  if (rule && rule.force) {
    return true;
  }

  if (!userAgent || !botAgentsRe.test(userAgent)) {
    return false;
  }

  return true;
};

export default {
  async fetch(request, env) {
    const AUTH_HEADER = env.OSTR_AUTH || BASIC_TOKEN || DICT.service.testAuth;
    const url = new URL(request.url);
    const userAgent = (request.headers.get(DICT.headers.ua) || DICT.stringEmpty).toLowerCase();
    const hasEscapedFragment = url.searchParams.has(DICT.escapedFragment);
    const botAgentsRe = botAgentsReFor(env.OSTR_EXTRA_BOT_UAS);
    const rule = matchRule(pathRulesFor(env.OSTR_PATH_RULES), url.pathname.toLowerCase());

    if (!shouldPrerender(request, url, userAgent, botAgentsRe, rule)) {
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

    if (rule && rule.stripParams) {
      stripParams(url, rule.stripParams);
    }

    const withQuery = (rule && typeof rule.ignoreGetQuery === 'boolean') ? !rule.ignoreGetQuery : PRERENDER_WITH_QUERY;
    if (withQuery && typeof url.search === DICT.string && url.search.length > 1) {
      fetchUrl += url.search;
    }

    const renderBase = DICT.service.endpoints[(rule && rule.endpoint) || DICT.service.defaultEndpoint];

    try {
      return fetch(new Request(`${renderBase}${encodeURIComponent(fetchUrl)}${DICT.args.bot}${encodeURIComponent(userAgent)}`, {
        headers: headers,
        redirect: DICT.manual,
      }));
    } catch (fetchError) {
      console.warn('[CloudFlare Worker] [pre-rendering] [fetch] REDIRECT TO ostr.io FIALED WITH fetchError:', fetchError);
      return fetch(request);
    }
  }
};
