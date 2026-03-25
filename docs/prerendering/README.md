# Prerendering

Lightning-fast, technology-agnostic SEO for websites, web apps, online shops and blogs — powered by pre-rendering middleware. Optimize TTFB, LCP, INP and CLS metrics, accelerate indexation, improve rich search results, and deliver consistent link previews across social and chat platforms

## ToC

- [Reasons to use SEO Middleware](https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/README.md#why-pre-rendering-seo-middleware)
- [Terminology](https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/README.md#used-terms)
- [Integrations](https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/README.md#integrations)
  - [Cloud-level integrations](https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/README.md#cloud-level-integrations)
  - [Server-level integrations](https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/README.md#server-level-integrations)
  - [Application-level integrations](https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/README.md#application-level-integrations)
- [How to's and pre-rendering features](https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/README.md#how-tos-and-pre-rendering-features)
  - [Features](https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/README.md#features)
  - [Optimizations](https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/README.md#optimizations)
  - [Extra features](https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/README.md#extra-features)
  - [Integration Tests](https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/README.md#integration-tests)

## Why Pre-rendering SEO Middleware

Reasons to use SEO Middleware

- 🏎️ Expands Crawl Budget — Improves timings for dynamic and static pages via advanced CDN and caching;
- 🚀 Boosts Web Vitals and Lighthouse scores;
- 🎛️ Improves TTFB, LCP, INP, CLS, and other Web Vitals and LightHouse metrics positively enhancing overall SEO score;
- 🖥 Supports PWAs and SPAs;
- 📱 Supports mobile-like crawlers;
- ⚡️ Supports [AMP (Accelerated Mobile Pages)](https://www.ampproject.org);
- 🤝 AI agents, search engines, and social network crawlers love optimized pages that delivered in blazingly-fast manner;
- 🖼️ Consistent link previews in messaging apps, like iMessage, Messages, Facebook, Slack, Telegram, WhatsApp, Viber, VK, Twitter, and other apps;
- 👥 Image, title, and description previews for links posted at social networks, like Facebook, X/Twitter, Instagram, and other social networks.

## Used Terms

Common terms used across pre-rendering documentation

- "Pre-rendering" or "SEO middleware" - Thin micro-service that redirect bot's traffic to ostr.io "rendering endpoints";
- "Search Engine" - System that is designed to search for information on the World Wide Web. Like: Google, Yahoo, Bing, etc. [Wiki definition](https://en.wikipedia.org/wiki/Web_search_engine);
- "AI chat", "AI bot", or "AI agent" — Interface to LLM that can perform search around the web, like Chat GPT, Perplexity, Gemini, Grok, Claude and similar;
- "Crawler" - An Internet bot that systematically browses the World Wide Web. [Wiki definition](https://en.wikipedia.org/wiki/Web_crawler). A crawler is one of the internal parts of Search Engines, messengers, and social networks. Like: Facebook, Viber, WhatsApp, Skype, etc. Mainly used to fetch and show information (image, title, description) about shared link;
- "Spider" - Same as "Crawler";
- "Cache" and "Caching" - Page "rendering" is time and resource consuming operation. To provide best possible response time "prerendered" results will be saved for time defined as "Cache TTL";
- "Cache Freshness" or "Cache TTL" - Time in hours, during this period cache will remain fresh and will be served to all request;
- "Pre-rendering Engine" - Core of the pre-rendering SEO middleware;
- "(Pre)rendering Endpoint" - Address where located "Pre-rendering engine", we have 3 differently configured [rendering endpoints](https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/rendering-endpoints.md), to fit every case.

## Integrations

Pre-rendering SEO Middleware has various implementations and integration methods

### Cloud-level integrations

Pre-rendering operates as middleware and can be easily integrated via CloudFlare Workers, or enabled at the level of Netlify, Vercel, Supabase *without extra plugins* and *without changes in the existing codebase*.

- **Shopify** [CloudFlare Worker Integration](https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/shopify-seo-integration.md#seo-middleware-worker-for-shopify)
- General [CloudFlare Worker Integration](https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/cloudflare-worker.md)
- [Netlify Integration](https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/netlify-prerendering.md)

### Server-level integrations

Pre-rendering operates as middleware and can be easily integrated with CloudFlare Workers, Nginx, or Apache without extra plugins.

- [Nginx Integration](https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/nginx.md)
- [Apache Integration](https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/apache.md)

### Application-level integrations

Application specific integrations are available via NPM packages. For Meteor.js integration, we have published Atmosphere package.

- [Next.js Integration](https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/nextjs-prerendering.md)
- [Node.js Integration via NPM](https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/node-npm.md)
- [Meteor.js Integration via Atmosphere](https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/meteor-atmosphere.md)

## How to's and pre-rendering features

Learn how to use different features and settings within pre-rendering SEO middleware

### Features

- [Caching](https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/cache.md)
- [Cache purge](https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/cache-purge.md)
- [Strip JavaScript](https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/strip-javascript.md)
- [Custom Status Codes in Analytics](https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/prerendering-custom-status-codes.md)
- [ES5 & Legacy Websites Support](https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/es6-support.md)

> [!TIP]
> Pass `/sitemap.xml` to <kbd>Pre-Render</kbd> (*Pre-render a website*) in **Pre-rendering Panel** to instantly render whole website

### Optimizations

- [Return genuine status code](https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/genuine-status-code.md)
- [Client Optimization](https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/optimization.md)
- [Server Optimization](https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/rendering-endpoints.md)
- [Use Custom Rendering Endpoints](https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/rendering-endpoints.md)

### Extra features

- [Accelerated Mobile Pages (AMP) Integration](https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/amp-support.md)
- [Detect Pre-rendering engine requests during runtime](https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/detect-prerendering.md)
- [Detect Pre-rendering engine requests during runtime (*Meteor.js specific*)](https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/detect-prerendering-meteor.md)

### Integration tests

- Use `cURL` and `Authorization` header (*see nginx integration*): `curl -v -H "Authorization: Basic TOKEN" https://render-bypass.ostr.io/?url=https://your-website-domain.com`;
- Use `cURL` and authentication credentials (*see node.js integration*): `curl -v https://auth:string@render-bypass.ostr.io/?url=https://your-website-domain.com`;
- Use `test:test` credentials to test general integration (*to make sure web application server can reach pre-rendering service*);
- Use `Authorization: Basic dGVzdDp0ZXN0` header to test general integration (*to make sure web application server can reach pre-rendering service*);
