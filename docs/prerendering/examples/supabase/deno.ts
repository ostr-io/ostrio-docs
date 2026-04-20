// supabase/functions/ostr-prerender/index.ts
//
// Plain Deno.serve reverse-proxy Edge Function.
//
// Crawler requests → proxied to https://render.ostr.io with OSTR_AUTH.
// Visitor requests → proxied to OSTR_SITE_ORIGIN untouched.
// Renderer error / OSTR_AUTH missing → fail-open to origin.
//
// Deploy:
//   supabase secrets set OSTR_AUTH='Basic <base64>' OSTR_SITE_ORIGIN='https://example.com'
//   supabase functions deploy ostr-prerender --no-verify-jwt
//
// See ../supabase-prerendering.md for domain-routing options.

import { decide, fetchRendered, proxyToOrigin } from '../_shared/ostr.ts';

Deno.serve(async (req: Request) => {
  const { shouldPrerender, renderTarget, ua } = decide(req);

  if (shouldPrerender) {
    const rendered = await fetchRendered(req, renderTarget, ua);
    if (rendered) return rendered;
  }

  return proxyToOrigin(req);
});
