import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextFetchEvent, NextRequest } from "next/server";

import { canonicalRedirectTarget } from "@/lib/canonical-host";
import { shouldBypassClerk } from "@/lib/clerk-scope";
import { printedAddressRedirect } from "@/lib/printed-address";
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
 *   0. Canonical-host + printed-address redirects.
 *   1. Rate limit check (perimeter defense — runs before any auth work
 *      so an abusive client cannot exhaust Clerk's API budget).
 *   2. Crawler-safe bypass: a cookieless GET/HEAD on a public route is
 *      served WITHOUT `clerkMiddleware` (see `src/lib/clerk-scope.ts`).
 *      On a Clerk development instance the middleware otherwise answers
 *      such requests with a 307 to the Clerk handshake, which Googlebot /
 *      Bingbot never complete — Search Console showed "Redirect error" on
 *      `/`, `/sitemap.xml` and `/robots.txt` and zero indexed pages.
 *   3. Clerk context + auth gate for everything else.
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

const withClerk = clerkMiddleware(async (auth, req) => {
  // ---- 3. Auth gate ------------------------------------------------------
  if (isProtectedRoute(req)) {
    // Defense: when Clerk env keys are missing (local dev before the first
    // `vercel env pull`, or a CI smoke run), do NOT enforce auth at the
    // edge — that would 500 the whole route before the page can render
    // its own graceful "unprovisioned" UI. The page-level guard takes over.
    if (!isClerkConfigured()) return;
    await auth.protect();
  }
});

export default async function proxy(req: NextRequest, event: NextFetchEvent) {
  // ---- 0. Canonical host --------------------------------------------------
  // The retired `*.vercel.app` production aliases still answer 200 and are
  // indexable. Send them permanently to the canonical origin (path + query
  // preserved). Only fires on the production deployment and only for
  // `.vercel.app` hosts — see `src/lib/canonical-host.ts` for the loop guard.
  const canonicalTarget = canonicalRedirectTarget(req.url);
  if (canonicalTarget) return NextResponse.redirect(canonicalTarget, 308);

  // ---- 0b. Printed addresses, typed with the wrong case -------------------
  // Every companion address is printed inside a physical book and typed by
  // hand; two of those books are set in a face whose lowercase glyphs are
  // small caps, so a reader copying what they see types the path in capitals.
  // Paths are case-sensitive in Next.js and a 404 there costs far more than a
  // redirect. Narrow by design — only printed paths, see printed-address.ts.
  const printedTarget = printedAddressRedirect(req.url);
  if (printedTarget) return NextResponse.redirect(printedTarget, 308);

  // ---- 1. Perimeter rate limit ------------------------------------------
  // `checkRateLimit` returns:
  //   - null            → allowed (Upstash absent OR within limit OR errored)
  //   - Response(429)   → rejected; return immediately and skip auth work
  // Graceful degradation lives inside `checkRateLimit`; this call site
  // never has to worry about Upstash being unconfigured.
  const rateLimitResponse = await checkRateLimit(req);
  if (rateLimitResponse) return rateLimitResponse;

  // ---- 2. Crawler-safe bypass --------------------------------------------
  // No public page calls `auth()`/`currentUser()` on the server, so a
  // cookieless GET/HEAD on a public route gains nothing from Clerk and must
  // never be redirected to the Clerk handshake (crawlers, link previews,
  // first-time readers). Signed-in visitors, Server Actions, API routes and
  // the protected matcher still go through `clerkMiddleware` below.
  if (
    shouldBypassClerk({
      method: req.method,
      pathname: req.nextUrl.pathname,
      search: req.nextUrl.search,
      cookie: req.headers.get("cookie"),
    })
  ) {
    return NextResponse.next();
  }

  return withClerk(req, event);
}

export const config = {
  matcher: [
    // Skip Next.js internals and static files (unless found in search params).
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes.
    "/(api|trpc)(.*)",
  ],
};
