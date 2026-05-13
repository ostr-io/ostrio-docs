// Lambda@Edge origin-request function for ostr.io pre-rendering.
//
// Pair with cloudfront-viewer-request.js and attach this Lambda to the
// CloudFront origin-request event. The viewer-request function marks bot
// requests before cache lookup; this Lambda rewrites matching cache misses to
// render.ostr.io and leaves visitor requests on the configured origin.
//
// Lambda@Edge does not support custom environment variables. Recommended
// secret source: configure X-Ostr-Auth as a CloudFront origin custom header.
// This function reads it from request.origin.*.customHeaders and removes it
// before pass-through so the token is not sent to your origin.
//
// Canonical regex sources:
//   https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/shared/crawler-ua-regex.md
//   https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/shared/static-extensions-regex.md

'use strict';

const BASIC_TOKEN = '';
const SITE_PROTOCOL = 'https';
const RENDER_HOST = 'render.ostr.io';
const RENDER_PATH = '/';
const SUPPORT_ESCAPED_FRAGMENT = true;
const PRERENDER_WITH_QUERY = true;

const CRAWLER_UA_RE = /\.net crawler|360spider|50\.nu|8bo crawler bot|aboundex|accoona|adldxbot|ahrefsbot|altavista|appengine-google|applebot|archiver|arielisbot|ask jeeves|auskunftbot|baidumobaider|baiduspider|becomebot|bingbot|bingpreview|bitbot|bitlybot|blitzbot|blogbridge|boardreader|botseer|catchbot|catchpoint bot|charlotte|checklinks|cliqzbot|clumboot|coccocbot|converacrawler|crawl-e|crawlconvera|dataparksearch|daum|deusu|discordbot|dotbot|duckduckbot|elefent|embedly|evernote|exabot|facebookbot|facebookexternalhit|meta-external|fatbot|fdse robot|feed seeker bot|feedfetcher|femtosearchbot|findlinks|flamingo_searchengine|flipboard|followsite bot|furlbot|fyberspider|gaisbot|galaxybot|geniebot|genieo|gigablast|gigabot|girafabot|gomezagent|gonzo1|googlebot|google sketchup|adsbot-google|google-structured-data-testing-tool|google-extended|developers\.google\.com\/\+\/web\/snippet|haosouspider|heritrix|holmes|hoowwwer|htdig|ia_archiver|idbot|infuzapp|innovazion crawler|instagram|internetarchive|iqdb|iskanie|istellabot|izsearch\.com|kaloogabot|kaz\.kz_bot|kd bot|konqueror|kraken|kurzor|larbin|leia|lesnikbot|linguee bot|linkaider|linkapediabot|linkedinbot|lite bot|llaut|lookseek|lycos|mail\.ru_bot|masidani_bot|masscan|mediapartners-google|metajobbot|mj12bot|mnogosearch|mogimogi|mojeekbot|motominerbot|mozdex|msiecrawler|msnbot|msrbot|netpursual|netresearch|netvibes|newsgator|ng-search|nicebot|nutchcvs|nuzzel|nymesis|objectssearch|odklbot|omgili|oovoo|oozbot|openfosbot|orangebot|orbiter|org_bot|outbrain|pagepeeker|pagesinventory|parsijoobot|paxleframework|peeplo screenshot bot|pinterest|plantynet_webrobot|plukkie|pompos|psbot|quora link preview|qwantify|read%20later|reaper|redcarpet|redditbot|retreiver|riddler|rival iq|rogerbot|saucenao|scooter|scrapy|scrubby|searchie|searchsight|seekbot|semanticdiscovery|seznambot|showyoubot|simplepie|simpy|sitelockspider|skypeuripreview|petalbot|slackbot|slack-imgproxy|slurp|snappy|sogou|solofield|speedyspider|speedy spider|sputnikbot|stackrambler|teeraidbot|teoma|theusefulbot|thumbshots\.ru|thumbshotsbot|tineye|tiktokspider|toweya\.com|toweyabot|tumblr|tweetedtimes|tweetmemebot|twitterbot|url2png|vagabondo|vebidoobot|viber|visionutils|vkshare|voilabot|vortex|votay bot|voyager|w3c_validator|wasalive\.bot|web-sniffer|websquash\.com|webthumb|whatsapp|whatweb|wire|wotbox|yacybot|yahoo|yandex|yeti|yisouspider|yodaobot|yooglifetchagent|yoozbot|yottaamonitor|yowedo|zao-crawler|zebot_www\.ze\.bz|zooshot|zyborgi|ai2bot|amazonbot|anthropic\.com|bard|bytespider|ccbot|chatgpt-user|claude-web|claudebot|cohere-ai|deepseek|diffbot|duckassistbot|gemini|gptbot|grok|mistralai|oai-searchbot|openai\.com|perplexity\.ai|perplexitybot|xai|youbot/i;
const STATIC_ASSET_RE = /\.(?:3ds|3g2|3gp|3gpp|7z|a|aac|aaf|adp|ai|aif|aiff|alz|ape|apk|appcache|ar|arj|asf|asx|atom|au|avchd|avi|bak|bbaw|bh|bin|bk|bmp|btif|bz2|bzip2|cab|caf|cco|cgm|class|cmx|cpio|cr2|crt|crx|css|csv|cur|dat|deb|der|dex|djvu|dll|dmg|dng|doc|docm|docx|dot|dotm|dra|drc|DS_Store|dsk|dts|dtshd|dvb|dwg|dxf|ear|ecelp4800|ecelp7470|ecelp9600|egg|eol|eot|eps|epub|exe|f4a|f4b|f4p|f4v|fbs|fh|fla|flac|fli|flv|fpx|fst|fvt|g3|geojson|gif|graffle|gz|gzip|h261|h263|h264|hqx|htc|ico|ief|img|ipa|iso|jad|jar|jardiff|jng|jnlp|jpeg|jpg|jpgv|jpm|js|jxr|key|kml|kmz|ktx|less|lha|lvp|lz|lzh|lzma|lzo|m2v|m3u|m4a|m4p|m4v|map|manifest|mar|markdown|md|mdi|mdown|mdwn|mht|mid|midi|mj2|mka|mkd|mkdn|mkdown|mkv|mml|mmr|mng|mobi|mov|movie|mp2|mp3|mp4|mp4a|mpe|mpeg|mpg|mpga|mpv|msi|msm|msp|mxf|mxu|nef|npx|nsv|numbers|o|oex|oga|ogg|ogv|opus|otf|pages|pbm|pcx|pdb|pdf|pea|pem|pgm|pic|pl|pm|png|pnm|pot|potm|potx|ppa|ppam|ppm|pps|ppsm|ppsx|ppt|pptm|pptx|prc|ps|psd|pya|pyc|pyo|pyv|qt|ra|rar|ras|raw|rdf|rgb|rip|rlc|rm|rmf|rmvb|ron|roq|rpm|rss|rtf|run|rz|s3m|s7z|safariextz|scpt|sea|sgi|shar|sil|sit|slk|smv|so|sub|svg|svgz|svi|swf|tar|tbz|tbz2|tcl|tga|tgz|thmx|tif|tiff|tk|tlz|topojson|torrent|ttc|ttf|txt|txz|udf|uvh|uvi|uvm|uvp|uvs|uvu|vcard|vcf|viv|vob|vtt|war|wav|wax|wbmp|wdp|weba|webapp|webm|webmanifest|webp|whl|wim|wm|wma|wml|wmlc|wmv|wmx|woff|woff2|wvx|xbm|xif|xla|xlam|xloc|xls|xlsb|xlsm|xlsx|xlt|xltm|xltx|xm|xmind|xpi|xpm|xsl|xwd|xz|yuv|z|zip|zipx)$/i;

const ALLOWED_METHODS = new Set(['GET', 'HEAD']);
const ESCAPED_FRAGMENT = '_escaped_fragment_';
const INTERNAL_PRERENDER_HEADER = 'x-ostr-prerender';
const INTERNAL_UA_HEADER = 'x-ostr-user-agent';
const ORIGIN_AUTH_HEADER = 'x-ostr-auth';
const WELL_KNOWN_PATH = '/.well-known/';
const IGNORED_PATHS_RE = /^\/(?:api(?:\/|$)|admin(?:\/|$)|auth(?:\/|$)|login(?:\/|$)|logout(?:\/|$)|healthz?(?:\/|$)|status(?:\/|$)|robots\.txt$|sitemap(?:[_-]index)?\.xml$)/i;

const BEGINNING_SLASH_RE = /^\//;
const TRAILING_SLASH_RE = /\/$/;
const OSTR_ORIGIN = 'ostr.io';
const OSTR_ORIGIN_TLD = '.ostr.io';

function getHeader(headers, name) {
  const value = headers && headers[name.toLowerCase()];
  if (!Array.isArray(value) || !value.length) return '';
  return typeof value[0].value === 'string' ? value[0].value : '';
}

function setHeader(headers, name, key, value) {
  headers[name.toLowerCase()] = [{ key, value }];
}

function deleteHeader(headers, name) {
  delete headers[name.toLowerCase()];
}

function getOriginConfig(request) {
  if (!request.origin) return null;
  return request.origin.custom || request.origin.s3 || null;
}

function getOriginCustomHeader(request, name) {
  const originConfig = getOriginConfig(request);
  if (!originConfig || !originConfig.customHeaders) return '';
  return getHeader(originConfig.customHeaders, name);
}

function deleteOriginCustomHeader(request, name) {
  if (!request.origin) return;
  if (request.origin.custom && request.origin.custom.customHeaders) {
    delete request.origin.custom.customHeaders[name.toLowerCase()];
  }
  if (request.origin.s3 && request.origin.s3.customHeaders) {
    delete request.origin.s3.customHeaders[name.toLowerCase()];
  }
}

function cleanupInternalHeaders(request) {
  deleteHeader(request.headers, INTERNAL_PRERENDER_HEADER);
  deleteHeader(request.headers, INTERNAL_UA_HEADER);
  deleteHeader(request.headers, ORIGIN_AUTH_HEADER);
  deleteOriginCustomHeader(request, ORIGIN_AUTH_HEADER);
}

function hasStaticExtension(pathname) {
  return STATIC_ASSET_RE.test(pathname || '');
}

function getRequestUrl(request) {
  const host = getHeader(request.headers, 'host');
  if (!host) return null;
  return new URL(`${SITE_PROTOCOL}://${host}${request.uri || '/'}${request.querystring ? `?${request.querystring}` : ''}`);
}

function buildRenderTarget(request) {
  const url = getRequestUrl(request);
  if (!url) return '';

  const params = new URLSearchParams(url.searchParams);
  const hasEscapedFragment = params.has(ESCAPED_FRAGMENT);
  const escapedFragment = params.get(ESCAPED_FRAGMENT) || '';
  params.delete(ESCAPED_FRAGMENT);

  let pathname = url.pathname;
  if (SUPPORT_ESCAPED_FRAGMENT && hasEscapedFragment) {
    pathname = pathname.replace(TRAILING_SLASH_RE, '');
    if (escapedFragment.length) {
      pathname += `/${escapedFragment.replace(BEGINNING_SLASH_RE, '')}`;
    }
    if (!pathname) pathname = '/';
  }

  const query = params.toString();
  return `${url.origin}${pathname}${PRERENDER_WITH_QUERY && query ? `?${query}` : ''}`;
}

function shouldPrerender(request) {
  if (!ALLOWED_METHODS.has(request.method)) return false;

  const url = getRequestUrl(request);
  if (!url) return false;
  if (url.hostname === OSTR_ORIGIN || url.hostname.endsWith(OSTR_ORIGIN_TLD)) return false;
  if (url.pathname.indexOf(WELL_KNOWN_PATH) !== -1) return false;
  if (hasStaticExtension(url.pathname)) return false;
  if (IGNORED_PATHS_RE.test(url.pathname)) return false;

  const explicitDecision = getHeader(request.headers, INTERNAL_PRERENDER_HEADER);
  if (explicitDecision === '1') return true;
  if (explicitDecision === '0') return false;

  const userAgent = (getHeader(request.headers, INTERNAL_UA_HEADER) || getHeader(request.headers, 'user-agent')).toLowerCase();
  return url.searchParams.has(ESCAPED_FRAGMENT) || CRAWLER_UA_RE.test(userAgent);
}

function routeToRenderer(request, targetUrl, userAgent, auth) {
  request.uri = RENDER_PATH;
  request.querystring = `url=${encodeURIComponent(targetUrl)}&bot=${encodeURIComponent(userAgent)}`;
  request.origin = {
    custom: {
      customHeaders: {},
      domainName: RENDER_HOST,
      keepaliveTimeout: 5,
      path: '',
      port: 443,
      protocol: 'https',
      readTimeout: 30,
      responseCompletionTimeout: 30,
      sslProtocols: ['TLSv1.2'],
    },
  };

  setHeader(request.headers, 'host', 'Host', RENDER_HOST);
  setHeader(request.headers, 'authorization', 'Authorization', auth);
  if (userAgent) setHeader(request.headers, 'user-agent', 'User-Agent', userAgent);
  cleanupInternalHeaders(request);
  return request;
}

async function handler(event) {
  const request = event.Records[0].cf.request;
  const auth = getOriginCustomHeader(request, ORIGIN_AUTH_HEADER) || BASIC_TOKEN;
  const userAgent = getHeader(request.headers, INTERNAL_UA_HEADER) || getHeader(request.headers, 'user-agent');

  if (!shouldPrerender(request)) {
    cleanupInternalHeaders(request);
    return request;
  }

  if (!auth) {
    console.warn('[ostr.io] Missing X-Ostr-Auth origin custom header; passing request to origin.');
    cleanupInternalHeaders(request);
    return request;
  }

  return routeToRenderer(request, buildRenderTarget(request), userAgent, auth);
}

exports.handler = handler;
exports._private = {
  buildRenderTarget,
  shouldPrerender,
};
