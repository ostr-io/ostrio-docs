// supabase/functions/<your-app>/ostr-middleware.ts
//
// Oak pre-rendering middleware.
//
// Drop into any Oak app (Supabase Edge Function or Deno Deploy) with:
//   import { Application } from 'jsr:@oak/oak';
//   import { ostrPrerender } from './ostr-middleware.ts';
//
//   const app = new Application();
//   app.use(ostrPrerender);
//   // ... your routes ...
//   Deno.serve(async (req) => (await app.handle(req)) ?? new Response(null, { status: 404 }));
//
// Crawler requests short-circuit to https://render.ostr.io with OSTR_AUTH.
// Non-crawler requests fall through via `next()`. Renderer errors fall
// through too (fail-open).
//
// For a full reverse-proxy variant without any framework, see `deno.ts`.
// Oak docs: https://jsr.io/@oak/oak

import type { Context } from 'jsr:@oak/oak';
import { decide, fetchRendered } from '../_shared/ostr.ts';

export async function ostrPrerender(
  ctx: Context,
  next: () => Promise<unknown>,
): Promise<void> {
  // Build a standard Request for the shared helpers. Body is not needed —
  // decide() only inspects method, URL, and headers; non-GET/HEAD requests
  // are skipped by the method guard inside decide().
  const req = new Request(ctx.request.url.toString(), {
    method: ctx.request.method,
    headers: ctx.request.headers,
  });

  const { shouldPrerender, renderTarget, ua } = decide(req);
  if (!shouldPrerender) {
    await next();
    return;
  }

  const rendered = await fetchRendered(req, renderTarget, ua);
  if (!rendered) {
    await next();
    return;
  }

  ctx.response.status = rendered.status;
  for (const [k, v] of rendered.headers) ctx.response.headers.set(k, v);
  ctx.response.body = rendered.body;
}
