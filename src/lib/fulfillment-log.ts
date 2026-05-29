import { promises as fs } from "node:fs";
import { join } from "node:path";

const LOG_DIR = "logs";
const LOG_FILE = "fulfillments.json";

/**
 * Append a fulfillment audit entry.
 *
 * Always logs to the console (works in every runtime, including Vercel
 * Functions — the line shows up in Vercel's runtime logs). Best-effort
 * file append for local dev — silently no-ops on read-only / ephemeral
 * filesystems, so this never blocks the webhook from returning 200.
 *
 * **SUB-PR 1.5 PLACEHOLDER.** SUB-PR 1.6 wires the real watermark queue
 * (Inngest / Vercel Queues); this log will then become the audit trail
 * for "transaction received → worker enqueued" so we can diagnose lost
 * jobs without losing the existing observability hook.
 */
export async function appendFulfillmentLogEntry(entry: unknown): Promise<void> {
  console.log("[fulfillment]", JSON.stringify(entry));

  try {
    const dir = join(process.cwd(), LOG_DIR);
    await fs.mkdir(dir, { recursive: true });
    await fs.appendFile(join(dir, LOG_FILE), JSON.stringify(entry) + "\n", "utf8");
  } catch {
    // Filesystem unavailable or read-only (Vercel function): silently skip.
    // The console.log above already captured the event for observability.
  }
}
