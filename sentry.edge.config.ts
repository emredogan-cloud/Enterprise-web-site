/**
 * Sentry — edge runtime init (SUB-PR 4.5).
 *
 * Loaded by `instrumentation.ts` when `NEXT_RUNTIME === "edge"`. Our
 * middleware (`src/proxy.ts`) and any route that opts into edge runtime
 * (none currently) are covered by this init.
 *
 * Same `SENTRY_DSN` gate as the server config — unset = silent no-op,
 * SDK methods are safe to call from edge contexts that may or may not
 * have Sentry available.
 */

import * as Sentry from "@sentry/nextjs";

const dsn = process.env.SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    // Edge runtime sees less traffic for us (only middleware); 10% sample
    // is still adequate without raising cardinality.
    tracesSampleRate: 0.1,
    sendDefaultPii: false,
    environment: process.env.NODE_ENV,
  });
}
