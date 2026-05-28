import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

/*
 * Clerk auth middleware (Roadmap §11 / ADR-8).
 *
 * Routing policy:
 *   - PUBLIC (default): everything not matched below — including
 *       /, /books(.*), /categories(.*), /authors(.*), /blog(.*), and
 *       /api/webhooks(.*) (the MoR + Clerk webhooks must stay public so
 *       server-to-server callers can hit them without a browser session).
 *   - PROTECTED: /account(.*), /read(.*), /admin(.*) — these require an
 *     authenticated Clerk session; unauthenticated requests are redirected
 *     to the sign-in page by `auth.protect()`.
 *
 * Public catalog routes stay statically renderable (SSG, per ADR-1): the
 * middleware only enriches request context and only enforces auth where we
 * explicitly call `auth.protect()`.
 */

const isProtectedRoute = createRouteMatcher([
  "/account(.*)",
  "/read(.*)",
  "/admin(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
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
