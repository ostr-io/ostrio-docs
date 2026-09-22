// Node 16.20.2: `node --experimental-fetch scripts/check-worker-path-rules.mjs`
// The path-rule vector (design 2026-09-18 §10) through the MANAGED Worker body: for each row the
// Worker receives the PROJECTED list as its `OSTR_PATH_RULES` binding (the customer's rules plus, in
// "listed paths only" mode, a trailing `{match: '/*', render: false}` — exactly what ostrio pushes)
// and a Googlebot request for the row's path; `expected` is whether the gateway was called.
// The other three matcher copies run the same rows: ostrio guardrails (`pathRuleMatching`),
// `ostrio-server-spiderable/test/unit.mjs`, `ostrio-api/test/unit.mjs`. RULES.md §7.
import assert from 'node:assert/strict';
import { createHash, webcrypto } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const MANAGED = new URL('../docs/prerendering/examples/cloudflare-worker/cloudflare.managed.worker.js', import.meta.url);
const MIRROR = new URL('../../ostrio/private/cloudflare/ostrio-prerender.worker.js', import.meta.url);
const VECTOR = new URL('../../ostrio-server-spiderable/test/path-rules-vector.json', import.meta.url);
const sha = (p) => createHash('sha256').update(readFileSync(p)).digest('hex');
assert.equal(sha(MANAGED), sha(MIRROR), 'managed body must be byte-identical to the ostrio mirror');

if (!globalThis.crypto) {
  globalThis.crypto = webcrypto;
}

const importBytes = async (source) => {
  const module = join(tmpdir(), `ostrio-worker-${sha(source).slice(0, 16)}.mjs`);
  writeFileSync(module, readFileSync(source));
  return import(pathToFileURL(module).href);
};

const worker = (await importBytes(MANAGED)).default;
const vector = JSON.parse(readFileSync(VECTOR, 'utf8'));

const rulesOf = (row) => {
  const fill = [];
  for (let i = 0; i < (row.fill || 0); i++) fill.push({ match: `/fill-${i}/*` });
  return fill.concat(row.rules || []);
};
const projected = (row) => rulesOf(row).concat(row.mode === 'whitelist' ? [{ match: '/*', render: false }] : []);

let count = 0;
for (const row of vector.rows) {
  const calls = [];
  globalThis.fetch = async (input) => {
    const url = typeof input === 'string' ? input : input.url;
    calls.push(url);
    if (url.startsWith('https://render')) {
      return new Response('<html>rendered</html>', { status: 200, headers: { 'content-type': 'text/html', 'x-prerender-id': 'aBcDeFgHiJkLmNoP' } });
    }
    return new Response('<html>origin</html>', { status: 200, headers: { 'content-type': 'text/html' } });
  };
  const req = new Request(`https://example.com${row.path}`, { headers: { 'user-agent': 'Googlebot/2.1' } });
  await worker.fetch(req, { OSTR_AUTH: 'Basic x', OSTR_PATH_RULES: JSON.stringify(projected(row)) });
  const rendered = calls.some((url) => url.startsWith('https://render'));
  assert.equal(rendered, row.expected, `vector row ${row.id}: Worker ${rendered ? 'rendered' : 'passed through'}, vector expects ${row.expected}`);
  count++;
}
assert.ok(count >= 27, 'vector present');
console.log(`check-worker-path-rules: cloudflare.managed.worker.js ${count}/${count}`);
