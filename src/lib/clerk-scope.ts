/**
 * Decides whether a request has to pass through Clerk's `clerkMiddleware`.
 *
 * Background (2026-09-08, Search Console "Redirect error" on every URL):
 * production runs on a Clerk *development* instance (`pk_test` / `sk_test`).
 * On a development instance `clerkMiddleware` answers every cookieless
 * document request — Googlebot, Bingbot, link-preview bots, `curl`, and the
 * very first visit of a real reader — with a 307 to
 * `https://<slug>.clerk.accounts.dev/v1/client/handshake?…&__clerk_hs_reason=dev-browser-missing`.
 * Browsers complete that handshake and come back with a cookie; crawlers do
 * not follow it, so Google reported "Redirect error" for `/`, `/sitemap.xml`
 * and `/robots.txt` and the site had zero indexed pages.
 *
 * Only the routes listed in `CLERK_CONTEXT_PREFIXES` execute server-side
 * `auth()` / `currentUser()` (see the import sites of `@/lib/auth` and
 * `@clerk/nextjs/server`). Every other cookieless GET/HEAD request is served
 * without Clerk so it can never be bounced. Requests that already carry a
 * Clerk cookie, non-GET requests (Server Actions such as the review form on
 * `/books/[slug]`), and handshake return trips keep the previous behaviour.
 *
 * Moving production to a Clerk **production** instance (`pk_live`) removes
 * the handshake entirely; this helper stays correct and cheap afterwards.
 */

/** Route prefixes whose server code calls Clerk's `auth()` / `currentUser()`. */
export const CLERK_CONTEXT_PREFIXES = [
  "/account",
  "/admin",
  "/order",
  "/read",
  "/api",
  "/trpc",
] as const;

const CLERK_COOKIE_RE =
  /(?:^|;\s*)(?:__session|__client_uat|__clerk_db_jwt|__clerk_handshake|__refresh)/;

export interface ClerkScopeRequest {
  /** HTTP method, e.g. `"GET"`. */
  method: string;
  /** Path portion of the URL, e.g. `"/books/the-great-book-of-world-games"`. */
  pathname: string;
  /** Query string including the leading `?`, or `""`. */
  search?: string | null;
  /** Raw `Cookie` request header, or `null` when absent. */
  cookie?: string | null;
}

/** `true` when a path belongs to a route that needs Clerk's server context. */
export function routeNeedsClerkContext(pathname: string): boolean {
  return CLERK_CONTEXT_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/** `true` when the request already carries any Clerk-issued cookie. */
export function hasClerkCookies(cookieHeader: string | null | undefined): boolean {
  return Boolean(cookieHeader) && CLERK_COOKIE_RE.test(cookieHeader as string);
}

/** `true` when the URL is a Clerk handshake / dev-browser return trip. */
export function isClerkReturnTrip(search: string | null | undefined): boolean {
  return Boolean(search) && (search as string).includes("__clerk_");
}

/**
 * `true` when the request can be served without `clerkMiddleware`:
 * a cookieless GET/HEAD on a public route that is not a Clerk return trip.
 */
export function shouldBypassClerk(req: ClerkScopeRequest): boolean {
  if (req.method !== "GET" && req.method !== "HEAD") return false;
  if (routeNeedsClerkContext(req.pathname)) return false;
  if (isClerkReturnTrip(req.search)) return false;
  if (hasClerkCookies(req.cookie)) return false;
  return true;
}
