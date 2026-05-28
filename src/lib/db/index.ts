/**
 * Database client — Neon serverless + Drizzle (Roadmap ADR § §10).
 *
 * We use the WebSocket-backed `neon-serverless` driver (rather than the
 * HTTP-only one) because the fulfillment pipeline in SUB-PR 1.5/1.6 must
 * upsert Order + OrderItem + Entitlement atomically inside a transaction
 * — and Drizzle's HTTP-driver path does not yet support transactions.
 *
 * Node 22+ ships native `WebSocket`, so no `ws` polyfill is required for
 * Node ≥ 24 (our target). If this ever runs on an older Node runtime, add:
 *
 *   import ws from "ws";
 *   import { neonConfig } from "@neondatabase/serverless";
 *   neonConfig.webSocketConstructor = ws;
 *
 * Pool creation is lazy at the driver level: an empty connection string
 * does NOT throw here, so the build step (which never queries) succeeds
 * even before `DATABASE_URL` is provisioned. The first real query against
 * an unset URL will fail loudly — which is the correct behavior.
 */

import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";

import * as schema from "./schema";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL ?? "",
});

export const db = drizzle(pool, { schema });
export type DB = typeof db;

export { schema };
