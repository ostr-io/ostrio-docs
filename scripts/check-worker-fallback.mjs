// Node 16.20.2: `node --experimental-fetch scripts/check-worker-fallback.mjs`
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = new URL('../docs/prerendering/examples/cloudflare-worker/', import.meta.url);
const MANAGED = new URL('cloudflare.managed.worker.js', ROOT);
const MIRROR = '/Users/drdimitru/Sites/ostrio-workspace/ostrio/private/cloudflare/ostrio-prerender.worker.js';
const sha = (p) => createHash('sha256').update(readFileSync(p)).digest('hex');
assert.equal(sha(MANAGED), sha(MIRROR), 'managed body must be byte-identical to the ostrio mirror');

// `boris_git` has no `package.json`, so importing the `.js` path directly loads it as
// CommonJS and `export default` throws. The same bytes are imported under an `.mjs` name.
const MODULE = join(tmpdir(), `ostrio-worker-${sha(MANAGED).slice(0, 16)}.mjs`);
writeFileSync(MODULE, readFileSync(MANAGED));
const worker = (await import(pathToFileURL(MODULE).href)).default;

const run = async (gatewayResponse, { throwOnGateway = false } = {}) => {
  const calls = [];
  globalThis.fetch = async (input) => {
    const url = typeof input === 'string' ? input : input.url;
    calls.push(url);
    if (url.startsWith('https://render')) {
      if (throwOnGateway) throw new Error('boom');
      return gatewayResponse();
    }
    return new Response('<html>origin</html>', { status: 200, headers: { 'content-type': 'text/html' } });
  };
  const req = new Request('https://example.com/page', { headers: { 'user-agent': 'Googlebot/2.1' } });
  const res = await worker.fetch(req, { OSTR_AUTH: 'Basic x' });
  return { res, calls };
};

// (a) a rendered 404 passes through untouched
{
  const { res, calls } = await run(() => new Response('<html>not found</html>', { status: 404, headers: { 'content-type': 'text/html; charset=utf-8', 'x-custom': '1' } }));
  assert.equal(res.status, 404);
  assert.equal(await res.text(), '<html>not found</html>');
  assert.equal(res.headers.get('x-prerender-reason'), null);
  assert.equal(res.headers.get('x-custom'), '1');
  assert.equal(calls.length, 1, 'origin was not fetched');
}
// (b) the gateway's own 403 body falls back with the marker
{
  const { res } = await run(() => new Response('Not permitted for this domain. Wrong domain. can not authorize this request; check auth creds [0010]', { status: 403, headers: { 'content-type': 'text/plain; charset=UTF-8' } }));
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('x-prerender-reason'), 'worker-fallback-403');
}
// (c) a reason header on a 401 falls back
{
  const { res } = await run(() => new Response('', { status: 401, headers: { 'x-prerender-reason': 'unauthorized' } }));
  assert.equal(res.headers.get('x-prerender-reason'), 'worker-fallback-401');
}
// (d) a text/plain 500 the gateway relayed from the CUSTOMER's origin (no [NNNN] suffix) passes
//     through. The gateway stamps `X-Prerender-Id` on everything it relays; a 5xx WITHOUT that
//     stamp is case (g)'s territory, so the fixture carries one — this case pins the regex negative
{
  const { res, calls } = await run(() => new Response('Internal server error!', { status: 500, headers: { 'content-type': 'text/plain', 'x-prerender-id': 'abcdef0123456789-orig' } }));
  assert.equal(res.status, 500);
  assert.equal(res.headers.get('x-prerender-reason'), null);
  assert.equal(calls.length, 1, 'origin was not fetched');
}
// (e) network failure keeps worker-fallback-error
{
  const { res } = await run(null, { throwOnGateway: true });
  assert.equal(res.headers.get('x-prerender-reason'), 'worker-fallback-error');
}
// (f) 3xx untouched
{
  const { res } = await run(() => new Response(null, { status: 301, headers: { location: 'https://example.com/x' } }));
  assert.equal(res.status, 301);
}
// (g) the edge proxy's own 503 while the gateway is down (text/html, no X-Prerender-* at all)
//     falls back to the origin with the marker — the pre-C-1 outage behaviour, restored
{
  const { res, calls } = await run(() => new Response('<html><body><h1>503 Service Unavailable</h1>No server is available to handle this request.</body></html>', { status: 503, headers: { 'content-type': 'text/html' } }));
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('x-prerender-reason'), 'worker-fallback-503');
  assert.equal(calls.length, 2, 'origin was fetched');
}
// (h) a RENDERED 503 (renderer 5xx rewritten to 503; carries X-Prerender-Id + X-Prerender-Cache)
//     passes through untouched — the third arm must not undo C-1 for a genuine rendered 5xx
{
  const { res, calls } = await run(() => new Response('<html>down</html>', { status: 503, headers: { 'content-type': 'text/html; charset=utf-8', 'x-prerender-id': 'aBcDeFgHiJkLmNoP', 'x-prerender-cache': 'MISS' } }));
  assert.equal(res.status, 503);
  assert.equal(await res.text(), '<html>down</html>');
  assert.equal(res.headers.get('x-prerender-reason'), null);
  assert.equal(calls.length, 1, 'origin was not fetched');
}
// (i) a Cloudflare 52x error page on the ostr.io zone (cf-ray + server: cloudflare, no
//     X-Prerender-*) falls back — cf-ray alone proves nothing, every gateway answer carries one too
{
  const { res, calls } = await run(() => new Response('<!DOCTYPE html><html><title>Bad gateway | render.ostr.io | Cloudflare</title></html>', { status: 502, headers: { 'content-type': 'text/html; charset=UTF-8', 'cf-ray': '8c0ffee0deadbeef-AMS', 'server': 'cloudflare' } }));
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('x-prerender-reason'), 'worker-fallback-502');
  assert.equal(calls.length, 2, 'origin was fetched');
}
// (j) either gateway header alone is proof: a 503 carrying only X-Prerender-Cache passes through
{
  const { res, calls } = await run(() => new Response('<html>down</html>', { status: 503, headers: { 'content-type': 'text/html', 'x-prerender-cache': 'HIT' } }));
  assert.equal(res.status, 503);
  assert.equal(res.headers.get('x-prerender-reason'), null);
  assert.equal(calls.length, 1, 'origin was not fetched');
}
// (k) DOCUMENTED RESIDUAL, pinned so a change is deliberate: a 4xx emitted in front of the gateway
//     (a Cloudflare challenge on the ostr.io zone, no X-Prerender-*) still passes through, because
//     covering 4xx would fall back on a rendered 404/410/451 whenever X-Prerender-Id is absent.
//     Closing this needs the gateway→Worker header hop measured first (01-contract.md, RULES.md §7)
{
  const { res, calls } = await run(() => new Response('<!DOCTYPE html><html>Just a moment...</html>', { status: 403, headers: { 'content-type': 'text/html; charset=UTF-8', 'cf-mitigated': 'challenge', 'cf-ray': '8c0ffee0deadbeef-AMS', 'server': 'cloudflare' } }));
  assert.equal(res.status, 403);
  assert.equal(res.headers.get('x-prerender-reason'), null);
  assert.equal(calls.length, 1, 'origin was not fetched');
}
console.log('check-worker-fallback: OK');
