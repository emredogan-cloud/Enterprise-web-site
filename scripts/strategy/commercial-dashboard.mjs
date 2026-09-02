/**
 * The one page that answers "did anything sell, and did anyone look?"
 *
 * Every number here is read from a system of record at the moment you run it:
 * orders and entitlements from Neon, transactions from the live Paddle
 * account, the funnel from `analytics_events`, and Amazon reviews and sales
 * ranks from the most recent `data/market/amazon-*.json` snapshot. Nothing is
 * modelled, and the PROJECTED block at the end is printed separately and
 * labelled, because a projection that sits in the same table as a measurement
 * eventually gets read as one.
 *
 *   node scripts/strategy/commercial-dashboard.mjs --env scripts/tmp/.env.production
 *   node scripts/strategy/commercial-dashboard.mjs --env <file> --json
 */
import { readFileSync, readdirSync } from "node:fs";
import { neon } from "@neondatabase/serverless";
import { BOOKS } from "../catalog/valice-catalog.mjs";

const flag = process.argv.indexOf("--env");
const envFile = flag !== -1 ? process.argv[flag + 1] : ".env.local";
const asJson = process.argv.includes("--json");
const env = {};
for (const line of readFileSync(envFile, "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/);
  if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
}
const sql = neon(env.DATABASE_URL);
const usd = (c) => `$${((c ?? 0) / 100).toFixed(2)}`;
const out = { takenAt: new Date().toISOString() };

// ── ACTUAL ────────────────────────────────────────────────────────────────
const [{ db }] = await sql`select current_database() as db`;
out.database = db;

const orders = await sql`select status, count(*)::int n, coalesce(sum(total_cents),0)::int cents from orders group by 1`;
const entitlements = await sql`select status, count(*)::int n from entitlements group by 1`;
const users = (await sql`select count(*)::int n from users`)[0].n;
const jobs = await sql`select status, count(*)::int n from watermark_jobs group by 1`;
const events = await sql`select event, count(*)::int n, max(created_at) last from analytics_events group by 1 order by 1`;
const eventsBySlug = await sql`select book_slug, event, count(*)::int n from analytics_events where book_slug is not null group by 1,2 order by 1,2`;
const sources = await sql`select source, count(*)::int n from analytics_events where source is not null group by 1`;

out.orders = orders;
out.entitlements = entitlements;
out.users = users;
out.watermarkJobs = jobs;
out.events = events;

// Paddle — the merchant of record's own count, which is the only one that
// matters if the database and Paddle ever disagree.
let paddleTx = null;
if (env.PADDLE_API_KEY) {
  const base = env.PADDLE_API_KEY.startsWith("pdl_live_")
    ? "https://api.paddle.com"
    : "https://sandbox-api.paddle.com";
  const res = await fetch(`${base}/transactions?per_page=100`, {
    headers: { Authorization: `Bearer ${env.PADDLE_API_KEY}` },
  });
  const j = await res.json().catch(() => null);
  paddleTx = res.ok ? (j.data ?? []) : { error: `${res.status}` };
}
out.paddleTransactions = Array.isArray(paddleTx) ? paddleTx.length : paddleTx;

// Amazon — from the newest snapshot on disk, with its own timestamp, so a
// stale figure is visibly stale rather than quietly wrong.
let market = null;
try {
  const files = readdirSync("data/market").filter((f) => f.startsWith("amazon-")).sort();
  if (files.length) market = JSON.parse(readFileSync(`data/market/${files.at(-1)}`, "utf8"));
} catch { /* no snapshot yet */ }
out.marketSnapshot = market?.takenAt ?? null;

if (asJson) {
  console.log(JSON.stringify(out, null, 2));
  process.exit(0);
}

const line = (k, v) => console.log(`  ${String(k).padEnd(34)} ${v}`);
console.log(`\nVALICE PRESS — COMMERCIAL DASHBOARD   ${out.takenAt}`);
console.log(`database ${db} · env ${envFile}\n`);

console.log("═══ ACTUAL — measured, not modelled ═══════════════════════════");
console.log("\nMoney");
line("paid orders", orders.filter((o) => o.status === "paid").reduce((n, o) => n + o.n, 0));
line("orders, all statuses", orders.length ? orders.map((o) => `${o.status}:${o.n}`).join("  ") : "0");
line("revenue", usd(orders.reduce((n, o) => n + o.cents, 0)));
line("Paddle transactions (live account)", Array.isArray(paddleTx) ? paddleTx.length : String(paddleTx ?? "not checked"));
line("contribution", usd(orders.filter((o) => o.status === "paid").reduce((n, o) => n + o.cents, 0) * 0.9));

console.log("\nFulfillment");
line("entitlements", entitlements.length ? entitlements.map((e) => `${e.status}:${e.n}`).join("  ") : "0");
line("watermark jobs", jobs.length ? jobs.map((j) => `${j.status}:${j.n}`).join("  ") : "0");
line("registered users", users);

console.log("\nFunnel (first-party analytics_events)");
if (!events.length) line("(no events recorded)", "");
for (const e of events) line(e.event, `${String(e.n).padStart(5)}   last ${e.last.toISOString().slice(0, 16)}Z`);
if (sources.length) line("by source", sources.map((s) => `${s.source}:${s.n}`).join("  "));
for (const r of eventsBySlug) line(`  ${r.book_slug} · ${r.event}`, r.n);

console.log("\nAmazon (snapshot " + (out.marketSnapshot ?? "none taken") + ")");
if (market) {
  for (const r of market.results) {
    if (r.error) { line(`${r.slug} · ${r.format}`, `ERROR ${r.error}`); continue; }
    const rank = r.live?.ranks?.[0] ? `#${r.live.ranks[0].rank} ${r.live.ranks[0].category}` : "no sales rank";
    line(`${r.slug} · ${r.format}`, `${(r.live?.reviewCount ?? 0)} reviews · ${rank}`);
  }
} else {
  line("(run scripts/market/verify-amazon.mjs --out)", "");
}

console.log("\nCatalogue state");
for (const b of BOOKS) {
  const live = b.formats.filter((f) => f.availability === "available");
  const soon = b.formats.filter((f) => f.availability === "coming_soon");
  line(b.slug, `${b.websiteStatus.padEnd(9)} live:${live.map((f) => f.format).join(",") || "—"}  soon:${soon.map((f) => f.format).join(",") || "—"}`);
}

console.log("\n═══ PROJECTED — arithmetic over prices, NOT a forecast ════════");
console.log("  Contribution per unit at the current list prices. Multiply by units");
console.log("  you actually sell; this table says nothing about how many that is.\n");
const NET = {
  direct: (c) => Math.round(c * 0.95 - 50),
  amazon_print: (c, printCost) => Math.round(c * 0.6 - printCost),
};
for (const b of BOOKS) {
  for (const f of b.formats) {
    if (!f.priceCents || f.availability !== "available") continue;
    const net = f.fulfillment === "direct" ? NET.direct(f.priceCents) : null;
    line(
      `${b.slug} · ${f.format}`,
      net === null
        ? `${usd(f.priceCents)} list — Amazon print royalty depends on page count; see price-engine.mjs`
        : `${usd(f.priceCents)} list → ${usd(net)} net (${Math.round((net / f.priceCents) * 100)}%)`,
    );
  }
}
console.log("");
