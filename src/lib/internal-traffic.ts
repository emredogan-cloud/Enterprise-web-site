/**
 * Internal-traffic marker — how the Founder's own browsing and the agent's
 * probes stay out of the commercial signal.
 *
 * WHAT VERCEL SUPPORTS, VERIFIED AGAINST THE DOCS ON 2026-09-03
 * Vercel Web Analytics offers no IP-based or account-based exclusion. The
 * one supported filtering mechanism is the `beforeSend` hook on the
 * `<Analytics>` component: return `null` and the event is never sent. The
 * documented "user opt-out" pattern is exactly that hook reading a
 * `va-disable` key from localStorage (vercel.com/docs/analytics/redacting-
 * sensitive-data). Speed Insights has the same hook. So the exclusion is
 * implemented where Vercel says it must be — in the browser, before the
 * beacon leaves — and never claimed to happen anywhere else.
 *
 * TWO MARKERS, ONE MEANING
 *   - `va-disable` in localStorage: what the Vercel-documented opt-out reads.
 *   - the `vp_internal=1` cookie: readable by the client hook AND by the
 *     server, so the first-party `/api/events` sink can drop the same
 *     visitor's funnel events. Both are set together by the toggle on
 *     /account/settings and both persist for a year in that browser profile.
 *
 * AGENT PROBES
 *   Scripts that call the site send the `x-valice-internal: 1` header;
 *   `/api/events` refuses to record an event that carries it. Page views from
 *   a script never reach Vercel Analytics at all — the beacon is client-side
 *   JavaScript that `fetch` does not run — so no server-side handling is
 *   needed for them, and none is claimed.
 *
 * WHAT IS DELIBERATELY NOT TOUCHED
 *   Server-side purchase telemetry written by the fulfillment worker stays
 *   exactly as it is. A paid order is a real order whoever placed it; the
 *   end-to-end test scripts delete their own rows afterwards.
 */

export const INTERNAL_COOKIE = "vp_internal";
export const INTERNAL_HEADER = "x-valice-internal";
/** The localStorage key Vercel's documented opt-out example reads. */
export const VA_DISABLE_KEY = "va-disable";
export const INTERNAL_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

/** Parse a Cookie header (or `document.cookie`) for the internal marker. */
export function hasInternalCookie(cookieHeader: string | null | undefined): boolean {
  if (!cookieHeader) return false;
  return cookieHeader
    .split(";")
    .map((c) => c.trim())
    .some((c) => c === `${INTERNAL_COOKIE}=1`);
}

/** True when a request should be treated as internal traffic. */
export function isInternalRequest(headers: {
  get(name: string): string | null;
}): boolean {
  if (headers.get(INTERNAL_HEADER) === "1") return true;
  return hasInternalCookie(headers.get("cookie"));
}

/** Browser-side check used by the analytics gate; never throws. */
export function isInternalBrowser(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (window.localStorage.getItem(VA_DISABLE_KEY)) return true;
  } catch {
    // localStorage can be unavailable (private mode, blocked storage).
  }
  try {
    return hasInternalCookie(document.cookie);
  } catch {
    return false;
  }
}
