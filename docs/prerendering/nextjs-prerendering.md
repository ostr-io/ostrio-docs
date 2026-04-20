# Next.js Integration

[ostr.io pre-rendering](https://ostr.io/info/prerendering) integration options for Next.js apps. Two first-class paths are supported in-app; several additional integrations route bot traffic without touching your Next.js code at all.

<img width="1536" height="1024" alt="ostrio-prerendering-nextjs-support_web" src="https://github.com/user-attachments/assets/6b51b594-be82-4c0f-b66f-903dadd93063" />

- [Pre-rendering overview](README.md)
- [Rendering endpoints](rendering-endpoints.md)
- [Complete Next.js middleware example](examples/next.js/middleware.ts)

## Contents

- [Pick an integration](#pick-an-integration)
- [Option 1 — Self-managed `middleware.ts`](#option-1--self-managed-middlewarets)
- [Option 2 — `seo-middleware-nextjs` NPM package](#option-2--seo-middleware-nextjs-npm-package)
- [Option 3 — Infrastructure-level (no code changes)](#option-3--infrastructure-level-no-code-changes)
- [Validation](#validation)

## Pick an integration

| Option | Where it runs | Code changes | Best for |
| --- | --- | --- | --- |
| [Self-managed `middleware.ts`](#option-1--self-managed-middlewarets) | Next.js middleware (edge) | Copy one file | Full control, no extra dependency |
| [`seo-middleware-nextjs` NPM package](#option-2--seo-middleware-nextjs-npm-package) | Next.js middleware (edge) | One-line import | Maintained bot list & fewer moving parts |
| [Vercel Routing Middleware](vercel-prerendering.md) | Vercel edge (before Next.js) | Copy one file | Deployed to Vercel, framework-agnostic |
| [Cloudflare Worker](cloudflare-worker.md) | Cloudflare edge | None | DNS on Cloudflare, zero app changes |
| [Netlify integration](netlify-prerendering.md) | Netlify edge | None | Deployed on Netlify Pro/Enterprise |
| [Nginx](nginx.md) / [Apache](apache.md) / [Caddy](caddy-prerendering.md) | Reverse proxy | None | Self-hosted Next.js behind a proxy |

## Option 1 — Self-managed `middleware.ts`

Copy [`examples/next.js/middleware.ts`](examples/next.js/middleware.ts) to the project root or `/src/` directory. The file is a complete, ready-to-deploy `middleware.ts` that detects bot traffic using the [canonical crawler regex](shared/crawler-ua-regex.md) and proxies matching requests to `https://render.ostr.io`.

Set the `OSTR_AUTH` environment variable (`Basic <base64 user:password>` from the [ostr.io pre-rendering panel](https://ostr.io/service/prerender)) in your deployment environment.

No extra npm dependency is required — the middleware uses only `NextRequest` / `NextResponse`.

## Option 2 — `seo-middleware-nextjs` NPM package

Maintained Next.js wrapper around [`spiderable-middleware`](https://github.com/veliovgroup/spiderable-middleware). One-line import into your `middleware.ts`; bot list, renderer routing, and configuration defaults are kept up to date upstream.

- 📦 [`seo-middleware-nextjs` on NPM](https://www.npmjs.com/package/seo-middleware-nextjs)
- 🐙 [`veliovgroup/seo-middleware-nextjs`](https://github.com/veliovgroup/seo-middleware-nextjs?tab=readme-ov-file#seo-middleware-for-nextjs) — installation, API, matcher configuration, and options

Pick this option when you want the bot-detection list and renderer upgrade path to be maintained by the `spiderable-middleware` family of packages rather than copy-pasting a file.

## Option 3 — Infrastructure-level (no code changes)

When you cannot modify `middleware.ts` — or you prefer to keep pre-rendering concerns out of the app — route bot traffic before Next.js ever sees it:

- 👷‍♂️ [Via Nginx](nginx.md) — reverse-proxy integration, works with `next start` or a Node server.
- 🌤️ [Via Cloudflare Worker](cloudflare-worker.md) — DNS/edge-level, works with any Next.js host.
- ✨ [Via Netlify](netlify-prerendering.md) — enable in Netlify site settings (Pro/Enterprise).
- ▲ [Via Vercel Routing Middleware](vercel-prerendering.md) — Vercel-edge middleware, works for any framework.
- 🥞 [Via Supabase Edge Functions](supabase-prerendering.md) — Deno-native middleware for apps served from Supabase (plain `Deno.serve`, Hono, Oak, Fresh).

## Validation

Bot request should return a pre-rendered snapshot with `X-Prerender-Id`:

```shell
curl -sI -A 'Googlebot/2.1' https://yourdomain.com/some-page
```

Regular browser request should pass through to Next.js:

```shell
curl -sI -A 'Mozilla/5.0' https://yourdomain.com/some-page
```

## References

- [Official Next.js middleware docs](https://nextjs.org/docs/app/getting-started/route-handlers-and-middleware#middleware)
- [`veliovgroup/seo-middleware-nextjs`](https://github.com/veliovgroup/seo-middleware-nextjs)
- [`veliovgroup/spiderable-middleware`](https://github.com/veliovgroup/spiderable-middleware) — Node.js middleware the package is built on
- [Detect pre-rendering engine requests at runtime](detect-prerendering.md)
