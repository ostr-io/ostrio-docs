# Cloudflare Worker Integration

<img width="1536" height="1024" alt="ostrio-prerendering-cloudflare-support" src="https://github.com/user-attachments/assets/b775192e-1d6b-49c7-925c-a17e60d97304" />

Cloudflare Workers are a great alternative to server-specific proxies (Nginx, Apache, Caddy, HAProxy) and app-specific middleware (NPM, PHP, Node.js, Django, and others). Pre-rendering runs at the edge — your origin, host, and application code are untouched.

- [Pre-rendering overview](README.md)
- [Rendering endpoints](rendering-endpoints.md)
- [Step-by-step tutorial](examples/cloudflare-worker/coudflare-worker-guide.md)
- Canonical regex sources — [Crawler User-Agent](shared/crawler-ua-regex.md), [Static-asset extensions](shared/static-extensions-regex.md)

## Contents

- [When to use](#when-to-use)
- [Compatible hosted and no-code platforms](#compatible-hosted-and-no-code-platforms)
- [Worker examples](#worker-examples)
- [How to set it up](#how-to-set-it-up)
- [Related](#related)

## When to use

- You control DNS and can place a Worker in front of your domain.
- You want a single integration that spans multiple origins or stacks.
- Your origin is on a platform that does **not** allow proxy or server-side middleware customization (Shopify, Webflow, Framer, Squarespace, Wix, and similar).
- You want to add pre-rendering without touching codebase or server environment.

## Compatible hosted and no-code platforms

Because the Worker sits between Cloudflare DNS and the origin, pre-rendering can be layered on top of any hosted platform that allows a custom domain — even when you have **zero server or code access**. Known-working platforms:

### E-commerce platforms

- **Shopify** — full dedicated guide: [Cloudflare Worker for Shopify](shopify-seo-integration.md)
- **BigCommerce**
- **Squarespace Commerce**
- **Wix Stores**
- **Ecwid**
- **Big Cartel**
- **Volusion**
- **PrestaShop Cloud**

### Website builders and no-code platforms

- **Webflow** — hosted sites with a custom domain
- **Framer** — hosted sites (Framer Sites)
- **Squarespace**
- **Wix** (and **Wix Studio**)
- **Carrd**
- **Softr**
- **Bubble**
- **Dorik**
- **Tilda**
- **Readymag**
- **Strikingly**
- **Jimdo**
- **Webnode**
- **Durable**
- **Universe**
- **Zyro**
- **Wordpress.com** (Business plan or higher, with custom domain)

### Content / CMS platforms

- **Ghost(Pro)** — hosted Ghost blogs
- **Substack** with custom domain
- **Medium** with custom domain
- **Notion** published pages with a proxied domain (via Super, Potion, Feather, Popsy, etc.)
- **Contentful** / **Sanity** / **Prismic** previews served through a static host

### App / landing-page builders

- **Typedream**
- **Framer Landing**
- **MailerLite Sites**
- **ConvertKit Landing Pages**
- **Leadpages**
- **Unbounce**
- **Instapage**

### Self-hosted or managed stacks behind Cloudflare

- **WordPress** (Cloudflare-proxied, self-hosted, WP Engine, Kinsta, Pressable, SiteGround, Hostinger, etc.)
- **Ghost** (self-hosted behind Cloudflare)
- **Static-site hosts** proxied through Cloudflare — Netlify, Vercel, GitHub Pages, GitLab Pages, Cloudflare Pages, Render, Railway, Fly.io
- **Any origin** reachable over HTTPS with a Cloudflare-orange-cloud DNS record

> [!NOTE]
> The Worker does not require platform-specific cooperation. As long as you can:
> 1. Point the domain's nameservers to Cloudflare, **and**
> 2. Enable the orange-cloud proxy on the DNS record,
>
> pre-rendering can be added. The Worker intercepts bot traffic before it reaches the origin and returns a rendered snapshot.

## Worker examples

- [Step-by-step tutorial](examples/cloudflare-worker/coudflare-worker-guide.md) — walks through Cloudflare dashboard, Worker creation, `OSTR_AUTH` secret, and route binding.
- [Shopify-tailored Worker](shopify-seo-integration.md#seo-middleware-worker-for-shopify) — dedicated guide for Shopify stores.
- *Modern and recommended:* [ES Module Worker](examples/cloudflare-worker/cloudflare.worker.js)
- *Legacy:* [Event Listener Worker](examples/cloudflare-worker/cloudflare-listener.worker.js)

## How to set it up

1. Sign up / log in to [Cloudflare](https://dash.cloudflare.com/sign-up), add your domain, and switch nameservers.
2. Enable the orange-cloud proxy on the DNS record that serves your site.
3. Add and verify the domain in the [ostr.io pre-rendering panel](https://ostr.io/service/prerender); copy the `OSTR_AUTH` value (starts with `Basic ...`).
4. Create a new Worker in **Workers & Pages**, paste the worker code from [`examples/cloudflare-worker/cloudflare.worker.js`](examples/cloudflare-worker/cloudflare.worker.js).
5. Under **Settings → Variables and Secrets**, set `OSTR_AUTH` to the value from step 3.
6. Bind the Worker to a route like `https://example.com/*` (or `*example.com/*` for TLD + subdomains on PRO / BUSINESS plans).
7. Purge the Cloudflare cache once to regenerate snapshots.

See the full [step-by-step tutorial](examples/cloudflare-worker/coudflare-worker-guide.md) with screenshots.

## Related

- [Shopify via Cloudflare Worker](shopify-seo-integration.md) — Shopify-specific variant
- [Netlify integration](netlify-prerendering.md) — alternative for Netlify-hosted sites
- [Vercel integration](vercel-prerendering.md) — alternative for Vercel-hosted sites
- [Rendering endpoints](rendering-endpoints.md)
- [Detect pre-rendering engine requests at runtime](detect-prerendering.md)
