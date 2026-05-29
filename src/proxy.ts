import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

import { checkRateLimit } from "@/lib/rate-limit";

/*
 * Clerk auth middleware + global rate limiter (Roadmap §11 / ADR-8 +
 * SUB-PR 4.2).
 *
 * Routing policy:
 *   - PUBLIC (default): everything not matched below — including
 *       /, /books(.*), /categories(.*), /authors(.*), /blog(.*), and
 *       /api/webhooks(.*) (the MoR + Clerk webhooks must stay public so
 *       server-to-server callers can hit them without a browser session).
 *   - PROTECTED: /account(.*), /read(.*), /admin(.*), /order(.*) — these
 *     require an authenticated Clerk session; unauthenticated requests
 *     are redirected to the sign-in page by `auth.protect()`.
 *
 * Pipeline order (per request):
 *   1. Rate limit check (perimeter defense — runs before any auth work
 *      so an abusive client cannot exhaust Clerk's API budget).
 *   2. Auth gate for the protected matcher.
 *
 * Public catalog routes stay statically renderable (SSG, per ADR-1): the
 * middleware only enriches request context and only enforces auth where
 * we explicitly call `auth.protect()`. The rate limiter is read-mostly
 * (one Redis call per request) and does not block static asset serving
 * — those routes are excluded from the matcher below.
 */

const isProtectedRoute = createRouteMatcher([
  "/account(.*)",
  "/admin(.*)",
  "/order(.*)",
  "/read(.*)",
]);

function isClerkConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
      process.env.CLERK_SECRET_KEY,
  );
}

export default clerkMiddleware(async (auth, req) => {
  // ---- 1. Perimeter rate limit ------------------------------------------
  // `checkRateLimit` returns:
  //   - null            → allowed (Upstash absent OR within limit OR errored)
  //   - Response(429)   → rejected; return immediately and skip auth work
  // Graceful degradation lives inside `checkRateLimit`; this call site
  // never has to worry about Upstash being unconfigured.
  const rateLimitResponse = await checkRateLimit(req);
  if (rateLimitResponse) return rateLimitResponse;

  // ---- 2. Auth gate ------------------------------------------------------
  if (isProtectedRoute(req)) {
    // Defense: when Clerk env keys are missing (local dev before the first
    // `vercel env pull`, or a CI smoke run), do NOT enforce auth at the
    // edge — that would 500 the whole route before the page can render
    // its own graceful "unprovisioned" UI. The page-level guard takes over.
    if (!isClerkConfigured()) return;
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files (unless found in search params).
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes.
    "/(api|trpc)(.*)",
  ],
};
