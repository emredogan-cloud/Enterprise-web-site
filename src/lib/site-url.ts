/**
 * Canonical site-origin resolution — the SINGLE source of truth for every
 * absolute URL the app emits (canonical, OpenGraph, JSON-LD, robots, sitemap,
 * transactional email).
 *
 * Why this module exists (WS-A / risk R1): the origin used to be read ad-hoc
 * in `layout.tsx`, `seo.ts`, and `email.ts`, several with
 * `?? "http://localhost:3000"`. `??` does NOT catch an EMPTY string, so an
 * empty `NEXT_PUBLIC_APP_URL` produced `new URL("")` → a 500 on every page,
 * or silently emitted `localhost` canonicals sitewide. Centralizing +
 * validating here removes that whole failure class:
 *   - `getSiteUrl()` never throws and falls back gracefully (empty-safe);
 *   - `assertSiteUrlConfigured()` turns a real *production* misconfig into a
 *     loud, immediate failure instead of a silent SEO outage.
 */

const DEV_FALLBACK_ORIGIN = "http://localhost:3000";

/**
 * Normalize a candidate to a bare `protocol//host` (no path, no trailing
 * slash). Returns `null` for empty / whitespace-only / non-absolute /
 * non-http(s) / unparseable input — so an EMPTY string falls THROUGH to the
 * next candidate (the empty-string trap fix; `??` would have kept `""`).
 */
function normalizeOrigin(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    return `${url.protocol}//${url.host}`;
  } catch {
    return null;
  }
}

/** The Vercel system alias for the stable production origin, as a URL. */
function vercelProductionOrigin(): string | null {
  const host = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  return host ? `https://${host}` : null;
}

/**
 * Resolve the canonical origin. Order:
 *   1. `NEXT_PUBLIC_APP_URL`            — operator-set, authoritative
 *   2. `VERCEL_PROJECT_PRODUCTION_URL`  — stable prod alias (self-healing:
 *      a forgotten env still yields the real prod origin, never `localhost`)
 *   3. `http://localhost:3000`          — dev/build last resort
 *
 * NEVER throws — URL emission must not crash build / dev / unprovisioned envs.
 */
export function getSiteUrl(): string {
  return (
    normalizeOrigin(process.env.NEXT_PUBLIC_APP_URL) ??
    normalizeOrigin(vercelProductionOrigin()) ??
    DEV_FALLBACK_ORIGIN
  );
}

/**
 * Loud guard against misconfiguration. Throws ONLY on a real Vercel
 * *production* runtime when neither `NEXT_PUBLIC_APP_URL` nor
 * `VERCEL_PROJECT_PRODUCTION_URL` resolves — converting a silent
 * sitewide-canonical outage into an immediate, visible failure. Elsewhere
 * (dev / preview / offline build / tests) it is a no-op aside from a one-line
 * dev warning, so nothing is ever blocked locally.
 *
 * Wired into `instrumentation.ts#register()` so it runs at server/runtime
 * init (including Vercel's production build data-collection).
 */
export function assertSiteUrlConfigured(): void {
  const resolvedFromEnv =
    normalizeOrigin(process.env.NEXT_PUBLIC_APP_URL) ??
    normalizeOrigin(vercelProductionOrigin());

  if (process.env.VERCEL_ENV === "production" && !resolvedFromEnv) {
    throw new Error(
      "[site-url] FATAL: running on Vercel production but neither " +
        "NEXT_PUBLIC_APP_URL nor VERCEL_PROJECT_PRODUCTION_URL resolves to a " +
        "valid absolute URL. Every canonical / OG / JSON-LD / sitemap URL " +
        "would be wrong. Set NEXT_PUBLIC_APP_URL to the production origin.",
    );
  }

  if (!resolvedFromEnv && process.env.NODE_ENV !== "test") {
    console.warn(
      "[site-url] NEXT_PUBLIC_APP_URL is unset/invalid; falling back to " +
        `${DEV_FALLBACK_ORIGIN}. Absolute URLs will use localhost.`,
    );
  }
}
