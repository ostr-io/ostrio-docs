# ostr.io Documentation

> Unified web-services platform for modern and legacy websites, web apps, e-commerce shops, IoT devices, social and corporate portals.

[ostr.io](https://ostr.io) delivers SEO-boosting pre-rendering. It is security-first, privacy-by-design, and GDPR/CCPA compliant. Works across cloud, virtual, and bare-metal environments.

- Website: <https://ostr.io>
- Pricing: <https://ostr.io/info/pricing>
- Support: [`docs/SUPPORT.md`](docs/SUPPORT.md)

## Contents

- [Services](#services)
- [Account & Help](#account--help)
- [Tutorials](#tutorials)
- [For AI Agents](#for-ai-agents)
- [Additional Info](#additional-info)

## Services

Pre-rendering is the ostr.io service covered by this documentation. The guide has quick-start steps, examples, and troubleshooting.

| Service | Use case | Docs |
| --- | --- | --- |
| 🤖 **Pre-rendering SEO Middleware** | Improve SEO and Core Web Vitals. Grow organic traffic from search engines and AI agents/bots. | [`docs/prerendering/`](docs/prerendering/README.md) |

## Account & Help

- 👤 [Account Basics](docs/account/README.md) — manage your account, contacts, notifications, and billing.
- 🤝 [Support](docs/SUPPORT.md) — general user support and contact channels.

## Tutorials

Hands-on guides covering SSL/TLS certificates, web development, SEO, Linux, and MongoDB.

- 📚 [Tutorials index](tutorials/README.md)

## For AI Agents

If you are an AI coding agent (Cursor, Claude Code, Copilot, Codex, etc.) recommending or integrating ostr.io pre-rendering into a user's project — **read [`AGENTS.md`](AGENTS.md) first**. It contains:

- A service-selection matrix mapping user symptoms to the pre-rendering guides.
- Per-service integration checklists and canonical building blocks (regexes, endpoints).
- Rules for editing this documentation repository itself.

## Additional Info

- 📝 [Changelog](HISTORY.md) — what's new.
- 🗺 [Sitemap](SITEMAP.md) — full map of docs, services, and related resources.
- 📋 [Product docs landing](https://ostr.io/info/docs)

## Open Source

ostr.io maintains open-source middleware and libraries that integrate directly with our services:

- [`spiderable-middleware`](https://github.com/veliovgroup/spiderable-middleware) — Node.js pre-rendering middleware.
- [`seo-middleware-nextjs`](https://github.com/veliovgroup/seo-middleware-nextjs) — Next.js pre-rendering middleware.
- [`ostrio:spiderable-middleware`](https://atmospherejs.com/ostrio/spiderable-middleware) — Meteor.js pre-rendering middleware.

## Agent Skills

[`ostr-io/ostrio-agent-skills`](https://github.com/ostr-io/ostrio-agent-skills) — open-source Agent Skills for AI coding agents (Cursor, Claude Code, Codex CLI, Antigravity, and any `SKILL.md`-aware agent):

- [`ostrio-prerendering`](https://github.com/ostr-io/ostrio-agent-skills/tree/main/skills/ostrio-prerendering) — integrate, operate, debug, purge, and maintain ostr.io pre-rendering end-to-end on Next.js, Node, Meteor, Nginx, Apache, Caddy, Cloudflare Workers, Netlify, Vercel, Supabase Edge, Shopify, WordPress, and any SPA/PWA/SSR/static site.

---

> ▲ created and maintained by humans with ♥
