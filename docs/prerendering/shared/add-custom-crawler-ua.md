# Add Your Own Crawler User-Agent

Extend the built-in list of recognized crawlers with your own custom user-agent substrings.

## Overview

When you integrate pre-rendering into your site, ostr.io automatically detects requests from search engines, social networks, AI/LLM crawlers, and other bots using a [canonical crawler user-agent regex](crawler-ua-regex.md). In some cases — for instance, if your company runs a private SEO audit tool or a custom spider — you may want to add your own patterns to the detection list.

Custom user-agent entries **extend** the built-in list, they never replace it. Both automatic crawlers and your custom entries are routed through pre-rendering.

## How It Works

Custom user-agent matching uses **substring matching, case-insensitive**:

- Entry: `mycompany-crawler` matches User-Agent `MyCompany-Crawler/1.0`, `Mozilla/5.0 MyCompany-Crawler`, etc.
- Entry: `seo-audit-bot` matches `SEO-Audit-Bot v2`, `my-seo-audit-bot`, etc.
- Entry: `openai` matches `OpenAI` (capital) and `openai` (lowercase) the same way.

No regex syntax is supported — entries are treated as plain text substrings, allowing no special characters. This keeps configuration simple and prevents accidental misconfiguration.

## Limits

- **Maximum 64 custom entries** per domain or per config file.
- **Maximum 128 characters per entry**, ASCII printable (letters, numbers, spaces, and common punctuation).
- Empty strings are ignored.

## Implementation

### Cloudflare Worker (Plan 3 OAuth Installs)

If you connected pre-rendering through ostr.io's one-click Cloudflare Worker setup (Plan 3), edit your custom crawler user-agents in the **ostr.io dashboard**. Navigate to your domain's pre-rendering settings, locate the "Custom crawler user-agents" field, and add your entries one per line or as a JSON array.

The Worker receives these entries via the `OSTR_EXTRA_BOT_UAS` binding and merges them with the canonical list on startup. No Worker code changes are needed.

### Manual Cloudflare Worker / Middleware Integrations

If you manage the Worker or middleware yourself, add custom crawlers to your configuration:

**Manual Cloudflare Worker** (edit `cloudflare.worker.js`):

```javascript
// Example: add custom substrings to the BOT_AGENTS array
const BOT_AGENTS = [
  // ... canonical entries from cloudflare.worker.js:39 ...
  'mycompany-crawler',
  'seo-audit-bot',
  'internal-monitoring-bot'
];
const BOT_AGENTS_RE = new RegExp(BOT_AGENTS.join('|'), 'i');
```

**Node.js `spiderable-middleware`**:

```javascript
const { Spiderable } = require('spiderable-middleware');

new Spiderable({
  botsUA: [
    // ... defaults from the canonical regex ...
    'mycompany-crawler',
    'seo-audit-bot',
    'internal-monitoring-bot'
  ]
});
```

**Meteor.js `ostrio:spiderable-middleware`**:

```javascript
new Spiderable({
  botsUA: [
    // ... defaults from the canonical regex ...
    'mycompany-crawler',
    'seo-audit-bot',
    'internal-monitoring-bot'
  ]
});
```

**nginx**:

```nginx
map $http_user_agent $is_crawler {
  default 0;
  ~*ahrefsbot|googlebot|mycompany-crawler|seo-audit-bot 1;
}
```

For a complete nginx example, see [`docs/prerendering/nginx.md`](../nginx.md).

**Apache**:

```apache
# In .htaccess or <VirtualHost>
BrowserMatch "ahrefsbot|googlebot|mycompany-crawler|seo-audit-bot" is_crawler
```

For a complete Apache example, see [`docs/prerendering/apache.md`](../apache.md).

### Next.js Middleware

If you use Next.js middleware, add your custom entries to the UA detection:

```typescript
// middleware.ts
const CUSTOM_BOT_UAS = ['mycompany-crawler', 'seo-audit-bot'];
const ALL_BOT_UAS = [...canonicalBotList, ...CUSTOM_BOT_UAS];
const BOT_AGENTS_RE = new RegExp(ALL_BOT_UAS.join('|'), 'i');

if (BOT_AGENTS_RE.test(userAgent)) {
  // Forward to pre-rendering
}
```

For a complete Next.js example, see [`docs/prerendering/nextjs-prerendering.md`](../nextjs-prerendering.md).

## Important Notes

**Custom UAs do not affect render quality or cache behavior.** Settings like `loadImages`, `stripJS`, and cache TTL are per-domain dashboard settings and cannot be varied per user-agent. If a custom bot needs a specific render configuration, configure it on the domain first, and all requests — both built-in crawlers and custom bots — will receive that behavior.

**The canonical list is always active.** Your custom entries are appended to, not replacing, the built-in crawler detection. If an entry conflicts with a built-in pattern (e.g., you add `googlebot` which is already canonical), both are checked but there is no duplication cost.

## Related

- [Canonical Crawler User-Agent Regex](crawler-ua-regex.md)
- [Per-Path Rules](../per-path-rules.md)
- [Cloudflare Worker Integration](../cloudflare-worker.md)
- [Nginx Integration](../nginx.md)
- [Apache Integration](../apache.md)
- [Next.js Integration](../nextjs-prerendering.md)
