// supabase/functions/<your-app>/ostr-middleware.ts
//
// Hono pre-rendering middleware.
//
// Drop into any Hono app (Supabase Edge Function or Deno Deploy) with:
//   import { Hono } from 'jsr:@hono/hono';
//   import { ostrPrerender } from './ostr-middleware.ts';
//
//   const app = new Hono();
//   app.use('*', ostrPrerender);
//   // ... your routes ...
//   Deno.serve(app.fetch);
//
// Crawler requests short-circuit to https://render.ostr.io with OSTR_AUTH.
// Non-crawler requests fall through to the next handler. Renderer errors
// fall through too (fail-open).
//
// For a full reverse-proxy variant without any framework, see `deno.ts`.
// Hono docs: https://hono.dev/docs/guides/middleware

import type { Context, Next } from 'jsr:@hono/hono';
import { decide, fetchRendered } from '../_shared/ostr.ts';

export async function ostrPrerender(c: Context, next: Next): Promise<Response | void> {
  const { shouldPrerender, renderTarget, ua } = decide(c.req.raw);
  if (!shouldPrerender) {
    await next();
    return;
  }

  const rendered = await fetchRendered(c.req.raw, renderTarget, ua);
  if (rendered) return rendered;

  await next();
}
