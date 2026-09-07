# Add Your Own Crawler User-Agent

Extend the built-in list of recognized crawlers with your own custom user-agent substrings.

## Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Limits](#limits)
- [Implementation](#implementation)
- [Important Notes](#important-notes)

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

- **Maximum 64 custom entries** per domain.
- **Maximum 128 characters per entry**, ASCII printable (letters, numbers, spaces, and common punctuation).
- **Empty strings**: The ostr.io dashboard and API reject empty entries with an `empty-entry` validation error. If parsing a legacy or manually-edited value, empty strings are ignored defensively.

## Implementation

### Cloudflare Worker (Plan 3 OAuth Installs)

If you connected pre-rendering through ostr.io's one-click Cloudflare Worker setup (Plan 3), edit your custom crawler user-agents in the **ostr.io dashboard**. Navigate to your domain's pre-rendering settings, locate the "Custom crawler user-agents" field, and add your entries one per submission into the chip list.

The Worker receives these entries via the `OSTR_EXTRA_BOT_UAS` binding and merges them with the canonical list on startup. No Worker code changes are needed.

### Manual Cloudflare Worker

If you manage the Worker yourself, add custom substrings to the `BOT_AGENTS` array. See the [manual Cloudflare Worker example](../examples/cloudflare-worker/cloudflare.worker.js) for the current bot-agent initialization and add your custom entries as plain-text substrings.

### Node.js and Meteor.js Middleware

Both the [`spiderable-middleware`](https://github.com/veliovgroup/spiderable-middleware) (Node.js) and [`ostrio:spiderable-middleware`](https://atmospherejs.com/ostrio/spiderable-middleware) (Meteor.js) packages accept a `botsUA` option to extend the bot list. Pass an array of custom substrings to merge with the canonical regex. See the package documentation for setup and configuration.

### Server-Level Integration (Nginx, Apache)

For per-path or per-request routing in Nginx, Apache, or other reverse proxies, follow the canonical integration guides:

- **[Nginx Integration](../nginx.md)** — the guide includes how to extend the bot-detection `map` directive with custom entries.
- **[Apache Integration](../apache.md)** — use `BrowserMatch` or `BrowserMatchNoCase` directives to add custom UA patterns.

### Next.js Middleware

Use the [`seo-middleware-nextjs`](https://github.com/veliovgroup/seo-middleware-nextjs) package for a maintained Next.js integration. The `botAgents` option accepts an array of custom substrings to merge with the built-in list. See the [package documentation](https://github.com/veliovgroup/seo-middleware-nextjs?tab=readme-ov-file#seo-middleware-for-nextjs) for setup and options.

Alternatively, implement the detection yourself in a self-managed `middleware.ts` — see [`docs/prerendering/nextjs-prerendering.md`](../nextjs-prerendering.md) for examples.

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
