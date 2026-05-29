import { serve } from "inngest/next";

import { processFulfillment } from "@/inngest/functions/watermark";
import { inngest } from "@/lib/inngest/client";

/*
 * Inngest endpoint — Inngest Cloud (or the local dev server) talks to
 * this route to (a) discover registered functions on GET and (b) invoke
 * them on POST. PUT is used by some self-host setups for registration.
 *
 * `runtime = "nodejs"` because the watermark function uses pdf-lib + a
 * Drizzle transaction over Neon's WebSocket pool — Edge would not work.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [processFulfillment],
});
