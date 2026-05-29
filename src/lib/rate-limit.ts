/**
 * Global rate-limit helper (Roadmap §11 — abuse mitigation, SUB-PR 4.2).
 *
 * Wraps `@upstash/ratelimit` + `@upstash/redis` behind a function that
 * the middleware (`src/proxy.ts`) calls once per request. The whole
 * surface is built around two non-negotiable invariants:
 *
 *   1. **Never fail-closed.** If Upstash is missing, mis-configured, or
 *      temporarily unreachable, the rate limiter MUST allow the request
 *      through. We refuse to take the site down because the perimeter
 *      defense itself is unavailable.
 *
 *   2. **One log per process.** The "rate limiting is disabled" warning
 *      is emitted exactly once per process via the module-level
 *      memoization sentinel (`undefined` = unchecked; `null` = checked,
 *      intentionally disabled). Per-request log spam would obscure real
 *      operational signal.
 *
 * The IP-resolution chain (`x-forwarded-for` → `x-real-ip` → "anonymous")
 * matches the current Vercel runtime: `NextRequest.ip` was deprecated
 * in Next.js 15, and Vercel-fronted requests always carry the client
 * IP in the `x-forwarded-for` first hop.
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import type { NextRequest } from "next/server";

// ---------------------------------------------------------------------------
// Policy — 100 req per 10s sliding window, per IP. Brief's spec.
// ---------------------------------------------------------------------------
const WINDOW_LIMIT = 100;
const WINDOW_DURATION = "10 s" as const;
const KEY_PREFIX = "bookstore-rl";

// ---------------------------------------------------------------------------
// Memoized Ratelimit instance.
//   undefined → never resolved (lazy)
//   null      → resolved + intentionally disabled (env missing)
//   instance  → ready
// ---------------------------------------------------------------------------
let _ratelimit: Ratelimit | null | undefined;

function getRatelimit(): Ratelimit | null {
  if (_ratelimit !== undefined) return _ratelimit;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    // Single, one-shot operational warning — not per request.
    console.warn(
      "[rate-limit] UPSTASH_REDIS_REST_URL and/or UPSTASH_REDIS_REST_TOKEN are not set. " +
        "Rate limiting is DISABLED for this process; every request will pass through.",
    );
    _ratelimit = null;
    return null;
  }

  const redis = new Redis({ url, token });
  _ratelimit = new Ratelimit({
    redis,
    // Sliding window gives smoother enforcement than fixed-window — a
    // request burst at the boundary of one window doesn't double-charge
    // the next.
    limiter: Ratelimit.slidingWindow(WINDOW_LIMIT, WINDOW_DURATION),
    // Analytics writes a small companion record to Upstash so the
    // Upstash console shows the limit-decision history. Negligible cost.
    analytics: true,
    prefix: KEY_PREFIX,
  });
  return _ratelimit;
}

/**
 * Best-effort client-IP extraction.
 *
 * `NextRequest.ip` was deprecated in Next.js 15+; the header chain below
 * is the supported path on Vercel and all common reverse proxies. When
 * nothing usable is present (rare; usually local cURL without proxy),
 * we fall back to a constant identifier so the request is still bounded
 * by *some* rate-limit bucket (rather than bypassing rate limit entirely
 * via a missing key).
 */
function getClientIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "anonymous";
}

/**
 * Per-request rate-limit check. Returns:
 *   - `null` when the request is allowed (let the middleware continue)
 *   - `Response(429)` when the request must be rejected
 *
 * Two graceful-degradation paths:
 *   - Upstash not configured (`getRatelimit() === null`) → return `null`
 *   - Upstash check throws (network blip, Redis unreachable) → log + return `null`
 *
 * Neither path crashes the request; the worst case is "perimeter defense
 * is temporarily unavailable" — exactly the behavior we want.
 */
export async function checkRateLimit(
  req: NextRequest,
): Promise<Response | null> {
  const ratelimit = getRatelimit();
  if (!ratelimit) return null;

  const identifier = getClientIp(req);

  try {
    const { success, limit, remaining, reset } =
      await ratelimit.limit(identifier);

    if (success) return null;

    // 429 with the canonical rate-limit headers + Retry-After. Clients,
    // crawlers, and load balancers all respect these.
    const retryAfter = Math.max(0, Math.ceil((reset - Date.now()) / 1000));
    return new Response("Too many requests. Please slow down.", {
      status: 429,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-RateLimit-Limit": String(limit),
        "X-RateLimit-Remaining": String(remaining),
        "X-RateLimit-Reset": String(reset),
        "Retry-After": String(retryAfter),
      },
    });
  } catch (err) {
    // Redis transport error or any unexpected throw. Fail OPEN.
    console.warn(
      "[rate-limit] check failed; allowing request:",
      err instanceof Error ? err.message : err,
    );
    return null;
  }
}
