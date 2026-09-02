@AGENTS.md

## Workspace

Public `ostr-io/ostrio-docs` repo; part of `ostrio-workspace`. Agent `docs-writer` owns edits here. Root rules: `../RULES.md` §11 (no invented capabilities; crawler-UA and static-extension regexes bind byte-for-byte).

Link check (run from repo root): `cd /Users/drdimitru/Sites/ostrio-workspace/boris_git && grep -rhoE '\]\((\.\.?/)?[A-Za-z0-9_./-]+\.md' docs tutorials README.md SITEMAP.md | sed -E 's/^\]\(//' | sort -u | while read -r p; do [ -e "$p" ] || [ -e "docs/$p" ] || echo "unresolved: $p"; done`

Runs clean but over-reports: it doesn't resolve links relative to each source file's own directory (e.g. `docs/prerendering/nginx.md` linking `apache.md`), so most `unresolved:` hits there are false positives — verify by hand before treating one as broken.

Uncommitted: `HISTORY.md` has a pending local edit — leave as is.

- F-09: canonical `docs/prerendering/shared/crawler-ua-regex.md:27` has `zyborg` and zero `instagram` hits; every distributed copy (agent-skills templates, `examples/`) has drifted from it in at least one repo — treat any copy as unverified until reconciled in one cross-repo change.
