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
- [Shared references](#shared-references)

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

| If you control… | Pick |
| --- | --- |
| DNS / CDN only (no server, no code access) | [Cloudflare Worker](cloudflare-worker.md) — works with Webflow, Framer, Squarespace, Wix, Ghost, Notion-proxied sites, and more |
| A Shopify store | [Cloudflare Worker for Shopify](shopify-seo-integration.md) |
| A Netlify deployment (PRO / ENTERPRISE) | [Netlify integration](netlify-prerendering.md) |
| A Vercel deployment | [Vercel Routing Middleware](vercel-prerendering.md) |
| A Supabase Edge Function serving HTML | [Supabase integration](supabase-prerendering.md) — Deno, Hono, Oak, Fresh |
| A reverse proxy | [Nginx](nginx.md), [Apache](apache.md), or [Caddy](caddy-prerendering.md) |
| Next.js application code | [Self-managed `middleware.ts`](nextjs-prerendering.md#option-1--self-managed-middlewarets) or [`seo-middleware-nextjs` NPM package](nextjs-prerendering.md#option-2--seo-middleware-nextjs-npm-package) |
| Any other Node.js app | [`spiderable-middleware` NPM package](node-npm.md) |
| A Meteor.js app | [`ostrio:spiderable-middleware` Atmosphere package](meteor-atmosphere.md) |

## Integrations

All ten supported integration paths.

### Cloud / Edge integrations

Operate at the CDN / worker layer — **no origin, server, or application changes required**. Ideal for hosted/no-code platforms where you cannot deploy middleware yourself.

- **General Cloudflare Worker** — [Cloudflare Worker integration](cloudflare-worker.md). Compatible with Webflow, Framer, Squarespace, Wix, Carrd, Bubble, Ghost(Pro), Substack, Notion-proxied sites, WordPress.com, BigCommerce, Wix Stores, and any origin reachable through Cloudflare's orange-cloud DNS.
- **Shopify** — [Cloudflare Worker for Shopify](shopify-seo-integration.md). Dedicated walkthrough for Shopify domains (including Shopify-managed domains that need to be transferred to Cloudflare first).

### Managed platform integrations

Enable at the hosting-platform level — no plugins, no codebase changes.

- [**Netlify**](netlify-prerendering.md) — enabled via Netlify Support on PRO / ENTERPRISE plans.
- [**Vercel**](vercel-prerendering.md) — drop-in Vercel Routing Middleware; one `middleware.js` file plus env vars.
- [**Supabase**](supabase-prerendering.md) — Deno-native middleware for [Supabase Edge Functions](https://supabase.com/docs/guides/functions). Complete examples for plain `Deno.serve`, Hono, Oak, and Fresh.

### Server-level integrations

Integrate with your reverse proxy — no plugins required.

- [**Nginx**](nginx.md) — `map $http_user_agent` + `@prerendering` internal location. Complete stack-specific examples for Node.js, Go, Django, Laravel, WordPress, PHP-FPM, and Phusion Passenger.
- [**Apache**](apache.md) — `mod_rewrite` + `mod_proxy`. Complete stack-specific `.htaccess` examples for WordPress, Drupal, Joomla, Magento, Moodle, Laravel, Zend/Laminas, and plain PHP.
- [**Caddy**](caddy-prerendering.md) — Caddyfile-based integration. Complete examples for Node.js/Next.js, PHP, Django, static sites, and other frameworks.

### Application-level integrations

Application-specific integrations via NPM / Atmosphere packages.

- [**Next.js — self-managed `middleware.ts`**](nextjs-prerendering.md#option-1--self-managed-middlewarets) — copy one file into the project, no extra dependency.
- [**Next.js — `seo-middleware-nextjs` NPM package**](nextjs-prerendering.md#option-2--seo-middleware-nextjs-npm-package) — maintained package, one-line import.
- [**Node.js — `spiderable-middleware` NPM package**](node-npm.md) — works with Express, Connect, Koa, Fastify (via adapter), vanilla `http`, and any Node middleware signature.
- [**Meteor.js — `ostrio:spiderable-middleware` Atmosphere package**](meteor-atmosphere.md) — plugs into `WebApp.connectHandlers`.

## Features and how-tos

Learn how to use different features and settings within pre-rendering SEO middleware.

### Features

- [Caching](cache.md)
- [Cache purge](cache-purge.md)
- [Strip JavaScript](strip-javascript.md)
- [Custom status codes in analytics](prerendering-custom-status-codes.md)
- [Legacy (ES5) support](es5-legacy-support.md)

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
- Use `test:test` credentials to verify general integration (*confirms that the web application server can reach the pre-rendering service*).
- Use the `Authorization: Basic dGVzdDp0ZXN0` header to verify general integration (*confirms that the web application server can reach the pre-rendering service*).

## Shared references

Canonical regex sources used by every integration:

- [Crawler User-Agent regex](shared/crawler-ua-regex.md)
- [Static-asset extensions regex](shared/static-extensions-regex.md)
