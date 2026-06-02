import { track } from "@vercel/analytics";

/**
 * Cookieless funnel instrumentation (WS-D) on Vercel Analytics custom events.
 *
 * Privacy-first by construction: Vercel Analytics sets no cookies and stores
 * no PII, so this needs no consent banner (KVKK/GDPR-friendly). Callers MUST
 * pass only NON-identifying props — slugs, ids, prices, currency, counts —
 * and NEVER emails, names, addresses, or raw search text.
 */
export type AnalyticsEvent =
  | "view_item"
  | "add_to_cart"
  | "begin_checkout"
  | "purchase"
  | "newsletter_signup"
  | "sample_read"
  | "search";

export type EventProps = Record<string, string | number | boolean | null>;

/**
 * Fire a typed, PII-free funnel event. Safe to call from anywhere: it no-ops
 * during SSR (Vercel's `track` is client-only) and never throws into a user
 * flow (analytics is best-effort).
 */
export function trackEvent(event: AnalyticsEvent, props?: EventProps): void {
  if (typeof window === "undefined") return;
  try {
    track(event, props);
  } catch {
    // Best-effort: analytics must never break the page.
  }
}
