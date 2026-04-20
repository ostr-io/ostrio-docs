# Pre-rendering

Lightning-fast, technology-agnostic SEO for websites, web apps, online shops and blogs — powered by pre-rendering middleware. Optimize TTFB, LCP, INP and CLS metrics, accelerate indexation, improve rich search results, and deliver consistent link previews across social and chat platforms.

## Contents

- [Why pre-rendering SEO middleware](#why-pre-rendering-seo-middleware)
- [Terminology](#terminology)
- [Which integration should I pick?](#which-integration-should-i-pick)
- [Integrations](#integrations)
  - [Cloud / Edge integrations](#cloud--edge-integrations)
  - [Managed platform integrations](#managed-platform-integrations)
  - [Server-level integrations](#server-level-integrations)
  - [Application-level integrations](#application-level-integrations)
- [Features and how-tos](#features-and-how-tos)
  - [Features](#features)
  - [Optimizations](#optimizations)
  - [Extras](#extras)
  - [Integration tests](#integration-tests)

## Why pre-rendering SEO middleware

- 🏎️ Expands crawl budget — improves timings for dynamic and static pages via advanced CDN and caching.
- 🚀 Boosts Web Vitals and Lighthouse scores.
- 🎛️ Improves TTFB, LCP, INP, CLS and other Web Vitals and Lighthouse metrics, positively enhancing overall SEO score.
- 🖥 Supports PWAs and SPAs.
- 📱 Supports mobile-like crawlers.
- ⚡️ Supports [AMP (Accelerated Mobile Pages)](https://www.ampproject.org).
- 🤝 AI agents, search engines, and social network crawlers love optimized pages delivered in a blazingly-fast manner.
- 🖼️ Consistent link previews in messaging apps — iMessage, Messages, Facebook Messenger, Slack, Telegram, WhatsApp, Viber, VK, Twitter/X, and others.
- 👥 Image, title, and description previews for links posted on social networks — Facebook, X/Twitter, Instagram, LinkedIn, and others.

## Terminology

Common terms used across the pre-rendering documentation:

- **Pre-rendering** / **SEO middleware** — thin micro-service that redirects bot traffic to ostr.io [rendering endpoints](rendering-endpoints.md).
- **Search engine** — system designed to search for information on the Web (Google, Yahoo, Bing, etc.). [Wikipedia](https://en.wikipedia.org/wiki/Web_search_engine).
- **AI chat / AI bot / AI agent** — interface to an LLM that can search the web (ChatGPT, Perplexity, Gemini, Grok, Claude and similar).
- **Crawler** — internet bot that systematically browses the Web. [Wikipedia](https://en.wikipedia.org/wiki/Web_crawler). Crawlers are an internal part of search engines, messengers, and social networks (Facebook, Viber, WhatsApp, Skype, etc.) and typically fetch image, title, and description information for shared links.
- **Spider** — same as crawler.
- **Cache / caching** — page rendering is a time- and resource-consuming operation. To provide the best possible response time, pre-rendered results are stored for the period defined as *Cache TTL*.
- **Cache freshness / Cache TTL** — time in hours during which cache remains fresh and is served to all matching requests.
- **Pre-rendering engine** — core of the pre-rendering SEO middleware.
- **(Pre)rendering endpoint** — address where the pre-rendering engine is located. We offer three differently-configured [rendering endpoints](rendering-endpoints.md) to fit every case.

## Which integration should I pick?

Pick based on where you can change configuration:

| If you control… | Use |
| --- | --- |
| DNS / CDN only | [Cloudflare Worker](cloudflare-worker.md), [Shopify via Cloudflare](shopify-seo-integration.md) |
| A managed host | [Netlify](netlify-prerendering.md) |
| A reverse proxy | [Nginx](nginx.md), [Apache](apache.md), [Caddy](caddy-prerendering.md) |
| Application code only | [Node.js (NPM)](node-npm.md), [Next.js](nextjs-prerendering.md), [Meteor.js](meteor-atmosphere.md) |

## Integrations

Pre-rendering SEO middleware has various implementations and integration methods.

### Cloud / Edge integrations

Operate at the CDN or worker layer — no origin changes required.

- **Shopify** — [Cloudflare Worker integration](shopify-seo-integration.md#seo-middleware-worker-for-shopify)
- General — [Cloudflare Worker integration](cloudflare-worker.md)

### Managed platform integrations

Enable at the hosting-platform level — no plugins or codebase changes.

- [Netlify integration](netlify-prerendering.md)
- Vercel — *coming soon*
- Supabase — *coming soon*

### Server-level integrations

Integrate with your reverse proxy — no plugins required.

- [Nginx integration](nginx.md)
- [Apache integration](apache.md)
- [Caddy integration](caddy-prerendering.md)

### Application-level integrations

Application-specific integrations via NPM / Atmosphere packages.

- [Next.js integration](nextjs-prerendering.md)
- [Node.js integration via NPM](node-npm.md)
- [Meteor.js integration via Atmosphere](meteor-atmosphere.md)

## Features and how-tos

Learn how to use different features and settings within pre-rendering SEO middleware.

### Features

- [Caching](cache.md)
- [Cache purge](cache-purge.md)
- [Strip JavaScript](strip-javascript.md)
- [Custom status codes in analytics](prerendering-custom-status-codes.md)
- [ES5 and legacy websites support](es6-support.md)

> [!TIP]
> Pass `/sitemap.xml` to <kbd>Pre-Render</kbd> (*Pre-render a website*) in the **Pre-rendering Panel** to instantly render the whole website.

### Optimizations

- [Return genuine status code](genuine-status-code.md)
- [Client optimization](optimization.md)
- [Server optimization](rendering-endpoints.md)
- [Use custom rendering endpoints](rendering-endpoints.md)

### Extras

- [Accelerated Mobile Pages (AMP) integration](amp-support.md)
- [Detect pre-rendering engine requests during runtime](detect-prerendering.md)
- [Detect pre-rendering engine requests during runtime — *Meteor.js*](detect-prerendering-meteor.md)

### Integration tests

- Use `cURL` with an `Authorization` header (*see Nginx integration*): `curl -v -H "Authorization: Basic TOKEN" https://render-bypass.ostr.io/?url=https://your-website-domain.com`
- Use `cURL` with authentication credentials (*see Node.js integration*): `curl -v https://auth:string@render-bypass.ostr.io/?url=https://your-website-domain.com`
- Use `test:test` credentials to verify general integration (*confirms that the web application server can reach the pre-rendering service*)
- Use the `Authorization: Basic dGVzdDp0ZXN0` header to verify general integration (*confirms that the web application server can reach the pre-rendering service*)

## Shared references

Canonical regex sources used by every integration:

- [Crawler User-Agent regex](shared/crawler-ua-regex.md)
- [Static-asset extensions regex](shared/static-extensions-regex.md)
