// Node 16.20.2: `node --experimental-fetch scripts/check-worker-fallback.mjs`
// Runs every case against all four distinct Worker bodies (the ostrio mirror is asserted
// byte-identical to the managed body, so it is covered by the managed run).
// Sibling: scripts/check-worker-path-rules.mjs runs the path-rule vector through the managed body.
import assert from 'node:assert/strict';
import { createHash, webcrypto } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = new URL('../docs/prerendering/examples/cloudflare-worker/', import.meta.url);
const MANAGED = new URL('cloudflare.managed.worker.js', ROOT);
const EXAMPLE = new URL('cloudflare.worker.js', ROOT);
const LISTENER = new URL('cloudflare-listener.worker.js', ROOT);
// Sibling repositories, resolved relative to this script: both must be checked out next to
// `ostrio-docs` for this check to run.
const MIRROR = new URL('../../ostrio/private/cloudflare/ostrio-prerender.worker.js', import.meta.url);
const SKILL = new URL('../../ostrio-agent-skills/skills/ostrio-prerendering/templates/cloudflare.worker.js', import.meta.url);
const sha = (p) => createHash('sha256').update(readFileSync(p)).digest('hex');
assert.equal(sha(MANAGED), sha(MIRROR), 'managed body must be byte-identical to the ostrio mirror');

// Workers expose WebCrypto as the global `crypto`; Node 16 has it only as `crypto.webcrypto`
if (!globalThis.crypto) {
  globalThis.crypto = webcrypto;
}

// `boris_git` has no `package.json`, so importing a `.js` path directly loads it as CommonJS and
// `export default` throws. The same bytes are imported under an `.mjs` name.
const importBytes = async (source) => {
  const module = join(tmpdir(), `ostrio-worker-${sha(source).slice(0, 16)}.mjs`);
  writeFileSync(module, readFileSync(source));
  return import(pathToFileURL(module).href);
};

const loadModuleWorker = async (source) => (await importBytes(source)).default;

// The listener form registers `addEventListener('fetch', …)` and reads a global `OSTR_AUTH`
// binding; the shim captures the handler and adapts it to the module-worker `fetch(request)` shape.
const loadListenerWorker = async (source) => {
  let handler = null;
  globalThis.OSTR_AUTH = 'Basic x';
  globalThis.addEventListener = (type, fn) => { if (type === 'fetch') handler = fn; };
  await importBytes(source);
  assert.ok(handler, 'listener body did not register a fetch handler');
  return { fetch: (request) => new Promise((resolve, reject) => handler({ request, passThroughOnException() {}, respondWith: (p) => Promise.resolve(p).then(resolve, reject) })) };
};

const BODIES = [
  { name: 'cloudflare.managed.worker.js', load: () => loadModuleWorker(MANAGED) },
  { name: 'cloudflare.worker.js', load: () => loadModuleWorker(EXAMPLE) },
  { name: 'cloudflare-listener.worker.js', load: () => loadListenerWorker(LISTENER) },
  { name: 'ostrio-agent-skills/templates/cloudflare.worker.js', load: () => loadModuleWorker(SKILL) },
];

const GATEWAY_403 = 'Not permitted for this domain. Wrong domain. can not authorize this request; check auth creds [0010]';

const cases = async (worker) => {
  let count = 0;
  const run = async (gatewayResponse, { throwOnGateway = false } = {}) => {
    count++;
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
    const { res } = await run(() => new Response(GATEWAY_403, { status: 403, headers: { 'content-type': 'text/plain; charset=UTF-8' } }));
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
  //     stamp is case (g)'s territory, so the fixture carries one — this case pins the regex negative.
  //     It is also the only case that takes the `clone()` read inside `isGatewayError`, so the body
  //     must still be readable by the crawler afterwards — a `Response` body can be consumed once.
  {
    const { res, calls } = await run(() => new Response('Internal server error!', { status: 500, headers: { 'content-type': 'text/plain', 'x-prerender-id': 'abcdef0123456789-orig' } }));
    assert.equal(res.status, 500);
    assert.equal(res.headers.get('x-prerender-reason'), null);
    assert.equal(await res.text(), 'Internal server error!', 'body must survive the clone() inspection');
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
  // (l) body arm on a non-403 status with the reason header absent (the live pre-03678ce gateway
  //     sends none): a 401 `Unauthorized! … [0012]` text/plain body falls back
  {
    const { res, calls } = await run(() => new Response('Unauthorized! can not authorize this request; check auth creds [0012]', { status: 401, headers: { 'content-type': 'text/plain; charset=UTF-8' } }));
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('x-prerender-reason'), 'worker-fallback-401');
    assert.equal(calls.length, 2, 'origin was fetched');
  }
  // (m) `Content-Length` is an optimisation, and a large declared body is rejected by size before
  //     any read: the gateway-shaped 403 body with `Content-Length: 9999` is NOT identified
  {
    const { res, calls } = await run(() => new Response(GATEWAY_403, { status: 403, headers: { 'content-type': 'text/plain; charset=UTF-8', 'content-length': '9999' } }));
    assert.equal(res.status, 403);
    assert.equal(res.headers.get('x-prerender-reason'), null);
    assert.equal(calls.length, 1, 'origin was not fetched');
  }
  return count;
};

/*
 * Health endpoint (W7.1) — the managed body only; the example and template bodies have no
 * `OSTR_VERIFY` binding. The fingerprint is pinned to a LITERAL, and ostrio guardrail (w) pins the
 * same literal against `hosts.js` `bindingsFingerprint`, so both runtimes are held to one constant
 * rather than to each other.
 */
const FINGERPRINT_WIRE = '{"OSTR_AUTH":true,"OSTR_VERIFY":true,"OSTR_EXTRA_BOT_UAS":"[]","OSTR_PATH_RULES":"[]"}';
const FINGERPRINT_VECTOR = 'c3570680fc714bc6';
const HEALTH_ENV = { OSTR_AUTH: 'x', OSTR_VERIFY: 's', OSTR_EXTRA_BOT_UAS: '[]', OSTR_PATH_RULES: '[]' };

const healthCases = async (worker, source) => {
  let count = 0;
  const template = (/const TEMPLATE_VERSION = '([^']+)'/.exec(source) || [])[1];
  assert.ok(template, 'managed body declares TEMPLATE_VERSION');
  assert.equal(createHash('sha256').update(FINGERPRINT_WIRE, 'utf8').digest('hex').slice(0, 16), FINGERPRINT_VECTOR, 'pinned fingerprint vector');

  const run = async ({ path = '/__ostrio-prerender/health', headers = {}, env = HEALTH_ENV } = {}) => {
    count++;
    const calls = [];
    globalThis.fetch = async (input) => {
      const url = typeof input === 'string' ? input : input.url;
      calls.push(url);
      if (url.startsWith('https://render')) {
        return new Response('<html>rendered</html>', { status: 200, headers: { 'content-type': 'text/html', 'x-prerender-id': 'aBcDeFgHiJkLmNoP' } });
      }
      return new Response('<html>origin</html>', { status: 200, headers: { 'content-type': 'text/html' } });
    };
    const res = await worker.fetch(new Request(`https://example.com${path}`, { headers }), env);
    return { res, calls };
  };

  // (n) the matching secret answers the JSON, from the Worker itself, never cached
  {
    const { res, calls } = await run({ headers: { 'x-ostrio-verify': 's' } });
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('content-type'), 'application/json');
    assert.equal(res.headers.get('cache-control'), 'no-store');
    assert.deepEqual(await res.json(), { template, bindings: FINGERPRINT_VECTOR });
    assert.equal(calls.length, 0, 'health answered without a subrequest');
  }
  // (o) a wrong secret of the same length falls through to the origin, no JSON
  {
    const { res, calls } = await run({ headers: { 'x-ostrio-verify': 't' } });
    assert.equal(await res.text(), '<html>origin</html>');
    assert.deepEqual(calls, ['https://example.com/__ostrio-prerender/health']);
  }
  // (p) no header, and a longer wrong one, fall through the same way
  for (const headers of [{}, { 'x-ostrio-verify': 'ss' }]) {
    const { res, calls } = await run({ headers });
    assert.equal(await res.text(), '<html>origin</html>');
    assert.equal(calls.length, 1);
  }
  // (q) with OSTR_VERIFY unbound, no header value can open the endpoint — not even an empty one
  for (const value of ['s', '', 'undefined']) {
    const { res, calls } = await run({ headers: { 'x-ostrio-verify': value }, env: { OSTR_AUTH: 'x' } });
    assert.equal(await res.text(), '<html>origin</html>');
    assert.equal(calls.length, 1);
  }
  // (r) without the secret the health path is an ordinary path: a crawler on it is pre-rendered
  {
    const { res, calls } = await run({ headers: { 'user-agent': 'Googlebot/2.1' } });
    assert.equal(await res.text(), '<html>rendered</html>');
    assert.ok(calls[0].startsWith('https://render.ostr.io/'), 'gateway called');
  }
  // (s) the secret on any other path changes nothing
  {
    const { res, calls } = await run({ path: '/page', headers: { 'x-ostrio-verify': 's' } });
    assert.equal(await res.text(), '<html>origin</html>');
    assert.equal(calls.length, 1);
  }
  // (t) the digest follows the bindings: a path-rule edit moves it
  {
    const { res } = await run({ headers: { 'x-ostrio-verify': 's' }, env: Object.assign({}, HEALTH_ENV, { OSTR_PATH_RULES: '[{"match":"/a"}]' }) });
    assert.notEqual((await res.json()).bindings, FINGERPRINT_VECTOR);
  }
  return count;
};

let total = 0;
for (const body of BODIES) {
  const worker = await body.load();
  const n = await cases(worker);
  console.log(`check-worker-fallback: ${body.name} ${n}/${n}`);
  total += n;
}
const fallbackCases = total / BODIES.length;
const health = await healthCases(await BODIES[0].load(), readFileSync(MANAGED, 'utf8'));
console.log(`check-worker-fallback: cloudflare.managed.worker.js health ${health}/${health}`);
total += health;
console.log(`check-worker-fallback: OK (${total} checks, ${BODIES.length} bodies × ${fallbackCases} fallback cases + ${health} health cases)`);
