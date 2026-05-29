/**
 * Sentry — server runtime init (SUB-PR 4.5).
 *
 * Loaded by `instrumentation.ts` when `NEXT_RUNTIME === "nodejs"`. Runs
 * once per cold start of the Node serverless function (or once per long-
 * running server process during `npm run dev` / `next start`).
 *
 * `SENTRY_DSN` is the server-side DSN (separate from
 * `NEXT_PUBLIC_SENTRY_DSN` so the two halves can route to different
 * projects). When unset, init is skipped and all Sentry calls are
 * silent no-ops — build / unprovisioned-env workflows are unaffected.
 */

import * as Sentry from "@sentry/nextjs";

const dsn = process.env.SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: 0.1,
    sendDefaultPii: false,
    environment: process.env.NODE_ENV,
  });
}
