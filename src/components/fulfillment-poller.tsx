"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

const POLL_INTERVAL_MS = 4000;

/**
 * Headless fulfillment poller — when any per-book entitlement on the
 * current page is still `pending`, calls `router.refresh()` every 4
 * seconds so the Preparing → Ready transition surfaces without the user
 * manually reloading. Implements the §5 "calm, trustworthy moment".
 *
 * Stops as soon as the parent re-renders with `enabled={false}` (i.e.,
 * once all entitlements on the page are `ready`). The `enabled` flag is
 * computed server-side from the just-fetched data, so polling stops
 * exactly when there is nothing more to wait for.
 */
export function FulfillmentPoller({ enabled }: { enabled: boolean }) {
  const router = useRouter();
  useEffect(() => {
    if (!enabled) return;
    const interval = setInterval(() => {
      router.refresh();
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [enabled, router]);
  return null;
}
