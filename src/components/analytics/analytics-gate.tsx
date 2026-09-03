"use client";

import { Analytics, type BeforeSendEvent } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { isInternalBrowser } from "@/lib/internal-traffic";

/**
 * Vercel Analytics + Speed Insights, behind the one filter Vercel supports.
 *
 * `beforeSend` returning `null` drops the event before it is sent — this is
 * the mechanism the Vercel documentation gives for ignoring routes and for a
 * per-user opt-out (`localStorage["va-disable"]`). There is no IP or account
 * exclusion in Vercel Web Analytics, and this component does not pretend
 * there is: a browser profile that has been marked internal (on
 * /account/settings) sends nothing; every other visitor is counted exactly
 * as before.
 *
 * Client component because `beforeSend` is a function and must not cross the
 * server/client boundary from the root layout.
 */
function beforeSend(event: BeforeSendEvent): BeforeSendEvent | null {
  return isInternalBrowser() ? null : event;
}

export function AnalyticsGate() {
  return (
    <>
      <Analytics beforeSend={beforeSend} />
      <SpeedInsights beforeSend={(data) => (isInternalBrowser() ? null : data)} />
    </>
  );
}
