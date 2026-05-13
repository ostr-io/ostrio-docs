'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const mod = require('./lambda-edge-origin-request.js');
const { shouldPrerender, buildRenderTarget } = mod._private;
const handler = mod.handler;

function header(value) {
  return [{ key: value.key || 'X', value: String(value.value !== undefined ? value.value : value) }];
}

function makeRequest({ method = 'GET', uri = '/page', querystring = '', host = 'example.com', userAgent = 'Mozilla/5.0', internalDecision, internalUa, originAuth, includeAuthHeader = true } = {}) {
  const headers = {};
  if (host) headers.host = header({ key: 'Host', value: host });
  if (userAgent) headers['user-agent'] = header({ key: 'User-Agent', value: userAgent });
  if (internalDecision !== undefined) headers['x-ostr-prerender'] = header({ key: 'X-Ostr-Prerender', value: internalDecision });
  if (internalUa !== undefined) headers['x-ostr-user-agent'] = header({ key: 'X-Ostr-User-Agent', value: internalUa });

  const request = { method, uri, querystring, headers, origin: { custom: { customHeaders: {} } } };
  if (includeAuthHeader && originAuth !== undefined) {
    request.origin.custom.customHeaders['x-ostr-auth'] = header({ key: 'X-Ostr-Auth', value: originAuth });
  }
  return request;
}

function makeEvent(request) {
  return { Records: [{ cf: { request } }] };
}

test('shouldPrerender skips non-GET/HEAD methods', () => {
  assert.equal(shouldPrerender(makeRequest({ method: 'POST', userAgent: 'Googlebot/2.1' })), false);
  assert.equal(shouldPrerender(makeRequest({ method: 'PUT', userAgent: 'Googlebot/2.1' })), false);
});

test('shouldPrerender skips static-asset extensions', () => {
  assert.equal(shouldPrerender(makeRequest({ uri: '/app.css', userAgent: 'Googlebot/2.1' })), false);
  assert.equal(shouldPrerender(makeRequest({ uri: '/logo.PNG', userAgent: 'Googlebot/2.1' })), false);
});

test('shouldPrerender skips /.well-known/ paths', () => {
  assert.equal(shouldPrerender(makeRequest({ uri: '/.well-known/acme-challenge/foo', userAgent: 'Googlebot/2.1' })), false);
});

test('shouldPrerender skips ignored app paths (api, admin, robots, sitemap)', () => {
  assert.equal(shouldPrerender(makeRequest({ uri: '/api/users', userAgent: 'Googlebot/2.1' })), false);
  assert.equal(shouldPrerender(makeRequest({ uri: '/admin/', userAgent: 'Googlebot/2.1' })), false);
  assert.equal(shouldPrerender(makeRequest({ uri: '/robots.txt', userAgent: 'Googlebot/2.1' })), false);
  assert.equal(shouldPrerender(makeRequest({ uri: '/sitemap.xml', userAgent: 'Googlebot/2.1' })), false);
});

test('shouldPrerender skips ostr.io host (loop protection)', () => {
  assert.equal(shouldPrerender(makeRequest({ host: 'foo.ostr.io', userAgent: 'Googlebot/2.1' })), false);
  assert.equal(shouldPrerender(makeRequest({ host: 'ostr.io', userAgent: 'Googlebot/2.1' })), false);
});

test('shouldPrerender honors viewer-request decision header (0 = skip, 1 = route)', () => {
  assert.equal(shouldPrerender(makeRequest({ internalDecision: '0', userAgent: 'Googlebot/2.1' })), false);
  assert.equal(shouldPrerender(makeRequest({ internalDecision: '1', userAgent: 'Mozilla/5.0' })), true);
});

test('shouldPrerender falls back to UA regex when internal header is missing', () => {
  assert.equal(shouldPrerender(makeRequest({ userAgent: 'Mozilla/5.0' })), false);
  assert.equal(shouldPrerender(makeRequest({ userAgent: 'Googlebot/2.1' })), true);
  assert.equal(shouldPrerender(makeRequest({ userAgent: 'facebookexternalhit/1.1' })), true);
});

test('shouldPrerender triggers on _escaped_fragment_ query param regardless of UA', () => {
  assert.equal(shouldPrerender(makeRequest({ querystring: '_escaped_fragment_=', userAgent: 'Mozilla/5.0' })), true);
});

test('shouldPrerender returns false on missing Host header', () => {
  assert.equal(shouldPrerender(makeRequest({ host: '', userAgent: 'Googlebot/2.1' })), false);
});

test('shouldPrerender does not throw on malformed Host header', () => {
  assert.doesNotThrow(() => shouldPrerender(makeRequest({ host: 'example.com:notaport:::', userAgent: 'Googlebot/2.1' })));
});

test('buildRenderTarget reconstructs https origin + path', () => {
  assert.equal(buildRenderTarget(makeRequest({ uri: '/page' })), 'https://example.com/page');
});

test('buildRenderTarget preserves remaining query string', () => {
  assert.equal(buildRenderTarget(makeRequest({ uri: '/page', querystring: 'a=1&b=2' })), 'https://example.com/page?a=1&b=2');
});

test('buildRenderTarget appends _escaped_fragment_ value as a path segment and strips it from query', () => {
  const target = buildRenderTarget(makeRequest({ uri: '/page/', querystring: '_escaped_fragment_=key=value&keep=yes' }));
  assert.equal(target, 'https://example.com/page/key=value?keep=yes');
});

test('buildRenderTarget drops trailing slash from base path when fragment is empty', () => {
  const target = buildRenderTarget(makeRequest({ uri: '/page/', querystring: '_escaped_fragment_=' }));
  assert.equal(target, 'https://example.com/page');
});

test('handler returns request unchanged for non-bot traffic', async () => {
  const request = makeRequest({ userAgent: 'Mozilla/5.0', originAuth: 'Basic dGVzdDp0ZXN0' });
  const result = await handler(makeEvent(request));
  assert.equal(result, request);
  assert.equal(result.uri, '/page');
  assert.equal(result.origin.custom.domainName, undefined);
  assert.equal(result.headers['x-ostr-prerender'], undefined);
});

test('handler routes crawler traffic to render.ostr.io and strips internal headers', async () => {
  const request = makeRequest({
    userAgent: 'Googlebot/2.1',
    internalDecision: '1',
    internalUa: 'Googlebot/2.1',
    originAuth: 'Basic dGVzdDp0ZXN0',
  });
  const result = await handler(makeEvent(request));
  assert.equal(result.uri, '/');
  assert.match(result.querystring, /^url=https%3A%2F%2Fexample\.com%2Fpage&bot=Googlebot%2F2\.1$/);
  assert.equal(result.origin.custom.domainName, 'render.ostr.io');
  assert.equal(result.headers['x-ostr-prerender'], undefined);
  assert.equal(result.headers['x-ostr-user-agent'], undefined);
  assert.equal(result.headers.host[0].value, 'render.ostr.io');
  assert.equal(result.headers.authorization[0].value, 'Basic dGVzdDp0ZXN0');
});

test('handler falls back to origin when X-Ostr-Auth is missing', async () => {
  const request = makeRequest({
    userAgent: 'Googlebot/2.1',
    internalDecision: '1',
    includeAuthHeader: false,
  });
  const result = await handler(makeEvent(request));
  assert.equal(result.uri, '/page');
  assert.equal(result.origin.custom.domainName, undefined);
});

test('handler bounds the UA written to the renderer querystring', async () => {
  const longUa = 'A'.repeat(5000);
  const request = makeRequest({
    userAgent: longUa,
    internalDecision: '1',
    internalUa: longUa,
    originAuth: 'Basic dGVzdDp0ZXN0',
  });
  const result = await handler(makeEvent(request));
  const botValue = new URLSearchParams(result.querystring).get('bot');
  assert.equal(botValue.length, 1024);
});

test('handler does not throw on malformed Host; falls back to origin', async () => {
  const request = makeRequest({
    host: ':::not a host:::',
    userAgent: 'Googlebot/2.1',
    internalDecision: '1',
    originAuth: 'Basic dGVzdDp0ZXN0',
  });
  const result = await handler(makeEvent(request));
  assert.equal(result.origin.custom.domainName, undefined);
});
