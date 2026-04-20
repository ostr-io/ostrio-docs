# Agent Instructions

Binding rules for agents editing this repository. Keep changes minimal, cite upstream when adding non-obvious config, and link to canonical sources instead of duplicating them.

## Contents

- [1. Canonical regexes](#1-canonical-regexes)
- [2. Example-config scope](#2-example-config-scope)
- [3. Documentation conventions](#3-documentation-conventions)
- [4. Adding a new integration](#4-adding-a-new-integration)

## 1. Canonical regexes

Two regexes are replicated byte-for-byte across every integration. Each has **one canonical source**; never inline either regex anywhere else.

| Regex | Canonical source | Used by |
| --- | --- | --- |
| Crawler `User-Agent` matcher | [`docs/prerendering/shared/crawler-ua-regex.md`](docs/prerendering/shared/crawler-ua-regex.md) | Nginx `map`, Apache `BrowserMatchNoCase`, Caddy `header_regexp`, Cloudflare Worker `RegExp`, application middleware |
| Static-asset extension matcher | [`docs/prerendering/shared/static-extensions-regex.md`](docs/prerendering/shared/static-extensions-regex.md) | Nginx `location ~*`, Apache `RewriteCond %{REQUEST_URI}`, Caddy `path_regexp`, Cloudflare Worker early return |

Rules:

- Copy each regex **byte-for-byte** from its canonical source.
- Never edit a regex inside an integration doc or example config in isolation.
- When adding or removing an entry, update the canonical source **and every copy** in a single change. Each shared file documents its full update-together contract.

To find every copy:

```shell
git grep -l "ahrefsbot" -- 'docs/prerendering/**'   # crawler UA regex
git grep -l "DS_Store" -- 'docs/prerendering/**'    # static-asset regex
```

## 2. Example-config scope

Configs under `docs/prerendering/examples/**` are **minimal, stack-specific** starting points.

Include:

- Proxy / rewrite rules and route exclusions specific to the stack — Laravel `try_files` front controller, WordPress `wp-content/*.php` deny, Node `node_modules` deny, Django `STATIC_ROOT` / `MEDIA_ROOT` pass-through.
- Upstream doc citations for non-obvious exclusions.

Do **not** add:

- Generic `$map` blocks, dotfile denies, dev-tooling secret denies (`.env`, `.git`, `.DS_Store`), generic PHP-exec denies, `location = /favicon.ico`, or similar "hardening" unless upstream framework docs recommend it.
- Security best-practices that belong at the platform or firewall layer.

Rationale: generic hardening invites copy-paste drift without improving pre-rendering correctness.

## 3. Documentation conventions

Applies to every file under `docs/prerendering/`.

### 3.1 Links and images

- Markdown-to-markdown cross-references **must be relative** (`README.md`, `../nginx.md`, `shared/crawler-ua-regex.md`). Never hardcode `https://github.com/ostr-io/ostrio-docs/...` URLs in prose or ToCs.
- Same-page anchors use `#slug` only — never a fully qualified `https://...#slug` URL.
- Config/worker files (`.conf`, `.htaccess`, `.caddyfile`, `.worker.js`, `.ts`, `.js`) **may** keep absolute GitHub URLs in comments since they are copied to servers outside the repo context.
- External links (Cloudflare, Shopify, Google, Vercel docs, NPM packages, GitHub repos, `ostr.io`) stay absolute.
- In-repo screenshots use relative paths (`./prerendering-cache.png`).

### 3.2 Terminology

- **"Pre-rendering"** (hyphenated) in prose and headings.
- **"prerendering"** (one word) only in identifiers — file stems, URL slugs, HTTP headers (`X-Prerender-Id`), code variables, regex groups.
- Product names: **Cloudflare**, **Nginx**, **Lighthouse**, **Next.js**, **Meteor.js**, **ostr.io**.
- Use "crawler" in prose; use "bot" only when quoting a server variable (`$is_webbot`) or an existing public API.

### 3.3 Page shape

Every doc — including short stubs — uses **Title → one-paragraph summary → main sections → Related**.

- `#` / `##` / `###` heading syntax only. No legacy `====` / `----` underline headings.
- Add a `## Contents` section with `#slug` anchors when the doc has more than ~3 top-level sections.
- The summary paragraph must stand on its own for AI retrieval and search landings.

### 3.4 Duplication

- **Do not** inline code examples for linked NPM / Atmosphere packages or other external resources. Describe the use case and link to the authoritative source (package README, upstream repo, or an in-repo `examples/<stack>/` folder).
- **Do not** duplicate shared building blocks (the two regexes, setup steps already covered by an `examples/<stack>/README.md`, etc.). Link to the canonical location instead.

## 4. Adding a new integration

1. Create `docs/prerendering/<stack>.md` following the [`nginx.md`](docs/prerendering/nginx.md) / [`apache.md`](docs/prerendering/apache.md) template (*How it works → Quick start → Shared building blocks → Minimal integration pattern → Choose example → Validation → Common issues*).
2. Add complete examples under `docs/prerendering/examples/<stack>/`.
3. Link the new doc from [`docs/prerendering/README.md`](docs/prerendering/README.md) under the correct tier (Cloud/Edge, Managed platform, Server-level, Application-level).
4. Reference [`shared/crawler-ua-regex.md`](docs/prerendering/shared/crawler-ua-regex.md) and [`shared/static-extensions-regex.md`](docs/prerendering/shared/static-extensions-regex.md) instead of inlining the regexes.
