import { getSiteUrl } from "@/lib/site-url";

/**
 * Canonical-host redirect decision for the request pipeline.
 *
 * Why this exists (Phase 0, 2026-09-02): the old production alias
 * `enterprise-web-site.vercel.app` kept serving the whole catalogue with a
 * 200 after `valicepress.com` went live. Vercel does not mark a current
 * production alias `noindex`, so every book page existed twice for Google
 * and every printed reference to the old host would have kept working
 * silently. A `rel=canonical` is a hint; a permanent redirect is a rule.
 *
 * Scope is deliberately narrow:
 *   - Only `*.vercel.app` hosts are redirected. The `www` ↔ apex choice is
 *     made in Vercel's domain settings (www → apex, 308) so that this code
 *     can never form a redirect loop with the platform.
 *   - Only on the real production deployment (`VERCEL_ENV === "production"`).
 *     Preview deployments live on `*.vercel.app` by design and must keep
 *     serving themselves.
 *   - Only when a canonical origin is actually configured. If
 *     `NEXT_PUBLIC_APP_URL` is missing, redirecting would send visitors to
 *     `localhost`; in that case we do nothing.
 *
 * Pure function: takes the request URL and the environment, returns the
 * redirect target or `null`. Tested in `canonical-host.test.ts`.
 */
export function canonicalRedirectTarget(
  requestUrl: string | URL,
  env: {
    vercelEnv?: string | undefined;
    canonicalOrigin?: string | undefined;
  } = {
    vercelEnv: process.env.VERCEL_ENV,
    canonicalOrigin: getSiteUrl(),
  },
): string | null {
  if (env.vercelEnv !== "production") return null;
  if (!env.canonicalOrigin) return null;

  let canonical: URL;
  let request: URL;
  try {
    canonical = new URL(env.canonicalOrigin);
    request = typeof requestUrl === "string" ? new URL(requestUrl) : requestUrl;
  } catch {
    return null;
  }
  // A misconfigured origin (localhost, http) must never become a redirect.
  if (canonical.protocol !== "https:") return null;
  if (canonical.hostname === "localhost") return null;

  const host = request.hostname.toLowerCase();
  if (host === canonical.hostname.toLowerCase()) return null;
  if (!host.endsWith(".vercel.app")) return null;

  const target = new URL(request.pathname + request.search, canonical);
  return target.toString();
}
