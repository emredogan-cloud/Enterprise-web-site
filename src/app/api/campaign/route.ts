import { NextResponse } from "next/server";

import {
  CAMPAIGN_HEADLINE,
  CAMPAIGN_REASON,
  campaignEndMs,
  campaignStartMs,
  campaignState,
} from "@/lib/campaign";

/**
 * GET /api/campaign — the campaign clock, from the only clock that counts.
 *
 * The countdown cannot be driven by `Date.now()` in the browser. That is the
 * visitor's clock: it can be minutes out, it can be deliberately wrong, and it
 * is in their timezone rather than ours. A promotion whose end depends on the
 * device it is viewed on ends at as many different moments as there are
 * devices.
 *
 * So this returns the server's `now` alongside the window, and the client
 * computes `offset = serverNow - clientNow` once and applies it to every tick
 * afterwards. The visitor's clock is then only used to measure *elapsed* time,
 * which it is reliable at, and never to decide *what time it is*, which it is
 * not.
 *
 * Deliberately `no-store`. This is a clock; a cached clock is the wrong time.
 * It is also the reason a `/books` page sitting in a CDN cache from an hour
 * ago still shows the right state: the page is stale but this is not, and the
 * countdown component believes this one.
 */
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const now = Date.now();
  return NextResponse.json(
    {
      ok: true,
      serverNowMs: now,
      startsAtMs: campaignStartMs(),
      endsAtMs: campaignEndMs(),
      state: campaignState(now),
      headline: CAMPAIGN_HEADLINE,
      reason: CAMPAIGN_REASON,
    },
    {
      headers: {
        "cache-control": "no-store, no-cache, must-revalidate",
      },
    },
  );
}
