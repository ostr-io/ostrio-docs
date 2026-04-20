# Canonical Crawler User-Agent Regex

This is the **single source of truth** for the User-Agent regex used by every pre-rendering integration (Nginx, Apache, Caddy, Cloudflare Workers, Netlify configuration, application middleware).

> [!IMPORTANT]
> The canonical regex is defined in the repository-root [`AGENTS.md`](../../../AGENTS.md). All integration examples must use it **byte-for-byte**. When adding or removing crawlers, update:
>
> 1. [`AGENTS.md`](../../../AGENTS.md) (canonical)
> 2. This file
> 3. [`nginx.md`](../nginx.md) `map $http_user_agent $is_webbot` block
> 4. [`apache.md`](../apache.md) `RewriteCond %{HTTP_USER_AGENT}` block
> 5. [`caddy-prerendering.md`](../caddy-prerendering.md) matcher blocks
> 6. Every `examples/**/*.conf`, `examples/**/*.htaccess`, `examples/**/*.caddyfile` and `examples/**/*.worker.js`
>
> Run `git grep -l "ahrefsbot"` (*or any distinctive token from the regex*) to find every file that must be kept in sync.

## Coverage categories

The regex matches three classes of automated agents:

1. **Search-engine crawlers** — Googlebot, Bingbot, Yandex, Baidu, DuckDuckBot, Yahoo, Seznambot, etc.
2. **Social / messenger preview fetchers** — facebookexternalhit, Twitterbot, LinkedInBot, Slackbot, Discordbot, WhatsApp, Telegram, Skype, Viber, Pinterest, VKShare, Tumblr, etc.
3. **AI / LLM fetchers** — GPTBot, ChatGPT-User, ClaudeBot, anthropic.com, Gemini, Bard, Grok, Perplexity, Amazonbot, Bytespider, CCBot, DuckAssistBot, DeepSeek, Mistralai, xAI, YouBot, etc.

## Canonical regex (do not edit in place — update sources above)

```regex
\.net crawler|360spider|50\.nu|8bo crawler bot|aboundex|accoona|adldxbot|ahrefsbot|altavista|appengine-google|applebot|archiver|arielisbot|ask jeeves|auskunftbot|baidumobaider|baiduspider|becomebot|bingbot|bingpreview|bitbot|bitlybot|blitzbot|blogbridge|boardreader|botseer|catchbot|catchpoint bot|charlotte|checklinks|cliqzbot|clumboot|coccocbot|converacrawler|crawl-e|crawlconvera|dataparksearch|daum|deusu|discordbot|dotbot|duckduckbot|elefent|embedly|evernote|exabot|facebookbot|facebookexternalhit|meta-external|fatbot|fdse robot|feed seeker bot|feedfetcher|femtosearchbot|findlinks|flamingo_searchengine|flipboard|followsite bot|furlbot|fyberspider|gaisbot|galaxybot|geniebot|genieo|gigablast|gigabot|girafabot|gomezagent|gonzo1|googlebot|google sketchup|adsbot-google|google-structured-data-testing-tool|google-extended|developers\.google\.com/\+/web/snippet|haosouspider|heritrix|holmes|hoowwwer|htdig|ia_archiver|idbot|infuzapp|innovazion crawler|instagram|internetarchive|iqdb|iskanie|istellabot|izsearch\.com|kaloogabot|kaz\.kz_bot|kd bot|konqueror|kraken|kurzor|larbin|leia|lesnikbot|linguee bot|linkaider|linkapediabot|linkedinbot|lite bot|llaut|lookseek|lycos|mail\.ru_bot|masidani_bot|masscan|mediapartners-google|metajobbot|mj12bot|mnogosearch|mogimogi|mojeekbot|motominerbot|mozdex|msiecrawler|msnbot|msrbot|netpursual|netresearch|netvibes|newsgator|ng-search|nicebot|nutchcvs|nuzzel|nymesis|objectssearch|odklbot|omgili|oovoo|oozbot|openfosbot|orangebot|orbiter|org_bot|outbrain|pagepeeker|pagesinventory|parsijoobot|paxleframework|peeplo screenshot bot|pinterest|plantynet_webrobot|plukkie|pompos|psbot|quora link preview|qwantify|read%20later|reaper|redcarpet|redditbot|retreiver|riddler|rival iq|rogerbot|saucenao|scooter|scrapy|scrubby|searchie|searchsight|seekbot|semanticdiscovery|seznambot|showyoubot|simplepie|simpy|sitelockspider|skypeuripreview|petalbot|slackbot|slack-imgproxy|slurp|snappy|sogou|solofield|speedyspider|speedy spider|sputnikbot|stackrambler|teeraidbot|teoma|theusefulbot|thumbshots\.ru|thumbshotsbot|tineye|tiktokspider|toweya\.com|toweyabot|tumblr|tweetedtimes|tweetmemebot|twitterbot|url2png|vagabondo|vebidoobot|viber|visionutils|vkshare|voilabot|vortex|votay bot|voyager|w3c_validator|wasalive\.bot|web-sniffer|websquash\.com|webthumb|whatsapp|whatweb|wire|wotbox|yacybot|yahoo|yandex|yeti|yisouspider|yodaobot|yooglifetchagent|yoozbot|yottaamonitor|yowedo|zao-crawler|zebot_www\.ze\.bz|zooshot|zyborgi|ai2bot|amazonbot|anthropic\.com|bard|bytespider|ccbot|chatgpt-user|claude-web|claudebot|cohere-ai|deepseek|diffbot|duckassistbot|gemini|gptbot|grok|mistralai|oai-searchbot|openai\.com|perplexity\.ai|perplexitybot|xai|youbot
```

## Per-server wrappers

The canonical pattern above is **alternation only**. Each server requires its own case-insensitive wrapper:

- **Nginx** (`map $http_user_agent`): wrap in `"~*(PATTERN)" 1;`
- **Apache** (`RewriteCond %{HTTP_USER_AGENT}`): append `[NC]` flag, wrap in double quotes
- **Caddy** (`header_regexp`): use a `@is_bot` matcher with `(?i)(PATTERN)`
- **Cloudflare Worker** (JavaScript): `new RegExp('(PATTERN)', 'i').test(userAgent)`
- **Node.js middleware**: same as Cloudflare Worker, or delegate to the [`spiderable-middleware`](https://github.com/veliovgroup/spiderable-middleware) package

## Why so many user agents?

- **Search coverage.** The goal is index eligibility on every meaningful search engine, not just Google.
- **Social previews.** Every messenger and social network uses its own UA to fetch OG/Twitter tags. Missing one means broken link previews.
- **AI crawl budget.** AI fetchers now represent a meaningful share of crawl traffic; excluding them leaves answer-engine surfaces (ChatGPT, Perplexity, Claude answers, Gemini) without fresh content.

## Related

- [`AGENTS.md`](../../../AGENTS.md) — repository-wide canonical rule
- [Nginx integration](../nginx.md)
- [Apache integration](../apache.md)
- [Caddy integration](../caddy-prerendering.md)
- [Cloudflare Worker integration](../cloudflare-worker.md)
