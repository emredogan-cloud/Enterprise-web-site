/**
 * Structured logger (SUB-PR 4.5).
 *
 * Three-level API (`info` / `warn` / `error`) that:
 *   - Always writes to `console.*` with a consistent `[LEVEL]` prefix
 *     (Vercel ships these to its log drain regardless of any other
 *     observability wiring — they're the floor of our visibility).
 *   - Forwards `error()` calls to Sentry when a DSN is configured. An
 *     `Error` instance routes to `captureException` (preserves stack
 *     trace); anything else routes to `captureMessage` with the
 *     `'error'` level so it's still visible in the dashboard.
 *
 * Graceful degradation: when `SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN` are
 * unset, the Sentry SDK's `captureException` / `captureMessage` calls
 * are no-ops (the init in `sentry.*.config.ts` was skipped). The
 * console output still lands in Vercel's logs.
 *
 * Usage:
 *   logger.info("[fulfillment] order created", { orderId });
 *   logger.warn("[rate-limit] check failed; allowing request", { err });
 *   logger.error("[admin] updateBook failed", err, { input });
 *
 * Context objects are passed straight through to Sentry's `extra` field
 * (server-side) so they're queryable in the dashboard without parsing
 * the log string.
 */

import * as Sentry from "@sentry/nextjs";

function isSentryActive(): boolean {
  // Either side configured is enough — both halves call the same module
  // (server code reads SENTRY_DSN; client code reads NEXT_PUBLIC_SENTRY_DSN).
  return Boolean(
    process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,
  );
}

export type LogContext = Record<string, unknown>;

export const logger = {
  info(message: string, context?: LogContext): void {
    console.log(`[INFO] ${message}`, context ?? "");
  },

  warn(message: string, context?: LogContext): void {
    console.warn(`[WARN] ${message}`, context ?? "");
  },

  /**
   * Log an error and (when Sentry is configured) forward it to Sentry.
   *
   *   - If `error` is an Error instance: `Sentry.captureException(error)`
   *     preserves the stack trace.
   *   - Otherwise: `Sentry.captureMessage(message, { level: 'error' })`
   *     so the line still appears in the dashboard.
   *
   * `context` is included as Sentry `extra` so it's queryable separately
   * from the log line itself.
   */
  error(message: string, error?: unknown, context?: LogContext): void {
    console.error(`[ERROR] ${message}`, error ?? "", context ?? "");

    if (!isSentryActive()) return;

    if (error instanceof Error) {
      Sentry.captureException(error, {
        extra: { message, ...context },
      });
    } else {
      Sentry.captureMessage(message, {
        level: "error",
        extra: { error, ...context },
      });
    }
  },
};
