// routes/_middleware.ts
//
// Fresh pre-rendering middleware. Drop into the `routes/` directory of an
// existing Fresh app. Fresh auto-registers any file named `_middleware.ts`
// for every route beneath its folder.
//
// Crawler requests short-circuit to https://render.ostr.io with OSTR_AUTH.
// Non-crawler requests fall through via `ctx.next()` to the normal Fresh
// route handler. Renderer errors fall through too (fail-open).
//
// Fresh docs: https://fresh.deno.dev/docs/concepts/middleware
//
// If you are deploying the Fresh app as a Supabase Edge Function, set:
//   supabase secrets set OSTR_AUTH='Basic <base64>' ROOT_URL='https://example.com'
//   supabase functions deploy <your-app> --no-verify-jwt
//
// Note: `ROOT_URL` for Fresh should be the *canonical* public URL of
// the site as registered in the ostr.io panel — the renderer rejects
// unregistered hosts (*.supabase.co, preview URLs, etc.).

import type { FreshContext } from '$fresh/server.ts';
import { decide, fetchRendered } from '../_shared/ostr.ts';

export async function handler(req: Request, ctx: FreshContext): Promise<Response> {
  const { shouldPrerender, renderTarget, ua } = decide(req);

  if (shouldPrerender) {
    const rendered = await fetchRendered(req, renderTarget, ua);
    if (rendered) return rendered;
  }

  return ctx.next();
}
