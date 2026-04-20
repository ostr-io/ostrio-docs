import { next } from '@vercel/functions';

/**
 * Vercel Routing Middleware — bot traffic → ostr.io prerendering CDN.
 *
 * Drop this file at your project root. Vercel picks it up automatically.
 * Works with any framework (Astro, Next.js, SvelteKit, plain static).
 *
 * Human traffic passes through unchanged. Bot traffic is proxied to
 * ostr.io which returns a fully rendered snapshot. Graceful fallback
 * to origin if ostr.io is unavailable.
 *
 * Env vars (set in Vercel dashboard):
 *   OSTR_SERVICE_URL  — default: https://render.ostr.io
 *   OSTR_AUTH         — Basic <base64 user:password> from ostr.io dashboard
 *   ROOT_URL          — canonical origin (e.g. https://example.com)
 *                        required when preview URLs differ from registered domain
 *
 * Bot list sourced from veliovgroup/spiderable-middleware.
 */

const BOT_AGENTS = [
  // Search engines
  'googlebot', 'adsbot-google', 'apis-google', 'mediapartners-google',
  'google-safety', 'feedfetcher-google', 'google-site-verification',
  'google-inspectiontool', 'bingbot', 'yandexbot', 'baiduspider',
  'applebot', 'duckduckbot', 'seznambot', 'naver', 'ecosia',
  // Social
  'facebookexternalhit', 'facebookcatalog', 'facebookbot',
  'meta-externalagent', 'twitterbot', 'linkedinbot', 'whatsapp',
  'slackbot', 'pinterest', 'pinterestbot', 'tiktok', 'bytespider',
  'discordbot', 'telegrambot',
  // SEO tools
  'semrushbot', 'ahrefsbot', 'rogerbot', 'dotbot', 'chrome-lighthouse',
  // AI bots
  'gptbot', 'chatgpt', 'oai-searchbot', 'claudebot',
  'perplexitybot', 'amazonbot', 'anthropic-ai', 'ccbot',
  // Other
  'embedly', 'quora link preview', 'showyoubot', 'outbrain',
  'vkshare', 'w3c_validator', 'redditbot', 'flipboard',
  'tumblr', 'bitlybot', 'skypeuripreview', 'qwantify',
];

const BOT_RE = new RegExp(BOT_AGENTS.join('|'), 'i');

const STATIC_EXT = /\.(js|css|xml|png|jpg|jpeg|gif|pdf|txt|ico|rss|zip|mp3|mp4|webp|avif|svg|woff2?|ttf|eot|map|json|webmanifest)$/i;

export default async function middleware(request) {
  const url = new URL(request.url);

  // Only intercept GET/HEAD for HTML pages
  if (request.method !== 'GET' && request.method !== 'HEAD') return next();
  if (STATIC_EXT.test(url.pathname)) return next();
  if (url.pathname.includes('/.well-known/')) return next();

  const ua = (request.headers.get('user-agent') || '').toLowerCase();
  const isBot = BOT_RE.test(ua);
  const hasEscapedFragment = url.searchParams.has('_escaped_fragment_');

  if (!isBot && !hasEscapedFragment) return next();

  // Proxy bot request to ostr.io
  const serviceURL = process.env.OSTR_SERVICE_URL || 'https://render.ostr.io';
  const auth = process.env.OSTR_AUTH || '';

  // Use canonical origin — ostr.io only allows registered domains
  const canonicalOrigin = process.env.ROOT_URL || url.origin;
  let targetUrl = canonicalOrigin + url.pathname;
  if (url.search && url.search.length > 1) {
    const cleanParams = new URLSearchParams(url.searchParams);
    cleanParams.delete('_escaped_fragment_');
    const qs = cleanParams.toString();
    if (qs) targetUrl += '?' + qs;
  }

  const renderUrl = `${serviceURL}/?url=${encodeURIComponent(targetUrl)}&bot=${encodeURIComponent(ua)}`;

  try {
    const headers = new Headers(request.headers);
    headers.delete('Authorization');
    if (auth) headers.set('Authorization', auth);

    const response = await fetch(renderUrl, { headers, redirect: 'manual' });

    if (response.ok || response.status === 301 || response.status === 302) {
      return response;
    }

    console.warn(`[ostr-middleware] ostr.io returned ${response.status}, falling back to origin`);
    return next();
  } catch (err) {
    console.warn('[ostr-middleware] ostr.io fetch failed, falling back to origin:', err);
    return next();
  }
}

export const config = {
  // Skip framework internals and static assets
  matcher: ['/((?!_next/static|_astro|favicon\\.ico).*)'],
};
