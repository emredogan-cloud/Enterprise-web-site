/**
 * Paddle SDK client (Roadmap ADR-2 — Merchant of Record).
 *
 * Lazy + memoized — same pattern as `src/lib/db/index.ts` and
 * `src/lib/storage/index.ts`. The module imports cleanly even when
 * `PADDLE_API_KEY` is unset, so build / tsc / unprovisioned envs do not
 * crash; the first real call throws a clear, actionable error instead.
 *
 * Environment selection:
 *   PADDLE_ENVIRONMENT=production → live Paddle
 *   anything else (or unset)      → sandbox (safe default for dev / CI)
 */

import { Environment, Paddle } from "@paddle/paddle-node-sdk";

let _paddle: Paddle | undefined;

export function getPaddleClient(): Paddle {
  if (_paddle) return _paddle;

  const apiKey = process.env.PADDLE_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Paddle is not configured. Set PADDLE_API_KEY (server-side) — see .env.example.",
    );
  }

  const environment =
    process.env.PADDLE_ENVIRONMENT === "production"
      ? Environment.production
      : Environment.sandbox;

  _paddle = new Paddle(apiKey, { environment });
  return _paddle;
}

/** Cheap pre-flight: is Paddle configured enough for the checkout to even try? */
export function isPaddleConfigured(): boolean {
  return Boolean(process.env.PADDLE_API_KEY);
}
