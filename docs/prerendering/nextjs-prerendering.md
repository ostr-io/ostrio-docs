# Next.js Integration

[ostr.io pre-rendering](https://ostr.io/info/prerendering) integration with Next.js apps.

<img width="1536" height="1024" alt="ostrio-prerendering-nextjs-support_web" src="https://github.com/user-attachments/assets/6b51b594-be82-4c0f-b66f-903dadd93063" />

## Integration options

- 👨‍💻 [Manually create `middleware.ts`](examples/next.js/middleware.ts) in the project root or `/src/` directory
- 📦 [Use the `seo-middleware-nextjs` NPM package](https://github.com/veliovgroup/seo-middleware-nextjs?tab=readme-ov-file#seo-middleware-for-nextjs)
- 👷‍♂️ [Via Nginx](nginx.md) — without changes in the codebase
- 🌤️ [Via Cloudflare](cloudflare-worker.md) — without changes in the codebase or server environment
- ✨ [Via Netlify](netlify-prerendering.md) — enable in the settings without changes in the codebase or server environment
- ▲ Via Vercel — *coming soon*
- 🥞 Via Supabase — *coming soon*

## References

- [Official Next.js middleware docs](https://nextjs.org/docs/app/getting-started/route-handlers-and-middleware#middleware)
