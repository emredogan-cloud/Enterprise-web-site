/**
 * Next.js instrumentation hook (SUB-PR 4.5).
 *
 * Next.js calls `register()` once per runtime cold start. We use it to
 * dispatch to the right Sentry config file based on `NEXT_RUNTIME`:
 *   - "nodejs" → `sentry.server.config.ts`
 *   - "edge"   → `sentry.edge.config.ts`
 *
 * The client config (`sentry.client.config.ts`) is auto-loaded by the
 * Sentry webpack/turbopack plugin during build; nothing to do here for
 * the browser surface.
 *
 * `onRequestError` is the Next.js 15+ hook for capturing server-side
 * render errors. We forward to `Sentry.captureRequestError` which is a
 * no-op when Sentry isn't initialized (DSN missing).
 */

import * as Sentry from "@sentry/nextjs";

export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

export const onRequestError = Sentry.captureRequestError;
