#!/usr/bin/env node
/**
 * Website product QA (Gate 11) and the weekly catalogue integrity check.
 *
 *   node scripts/catalog/validate-catalog.mjs [--env scripts/tmp/.env.production]
 *        [--origin https://valicepress.com] [--slug <slug>] [--skip-network] [--json]
 *
 * Checks, per published book in scripts/catalog/valice-catalog.mjs:
 *   1. the catalogue test suite's invariants (re-derived here cheaply): a
 *      kdp:"live" format has an ASIN; a direct ebook has a Paddle price id
 *      and a master key; a Select-enrolled book is not for direct sale
 *   2. cover webp exists under public/images/books/ and is ≥ 1200 px tall
 *   3. preview pages exist under public/images/previews/<slug>/
 *   4. every live ASIN's /dp/ page answers 200 (network)
 *   5. production page /books/<slug> answers 200, carries a canonical on the
 *      configured origin, and its JSON-LD parses; an Offer appears only when a
 *      direct price > 0 exists (network)
 *   6. /sitemap.xml lists every published book and every companion (network)
 *   7. Paddle: every direct price id exists and is active (needs PADDLE_API_KEY
 *      in --env; otherwise SKIPPED)
 *   8. R2: every direct master key exists (needs R2_* in --env; otherwise SKIPPED)
 * A check that cannot run is SKIPPED and listed — it never counts as passed.
 */

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { execFileSync } from "node:child_process";

import { Report, finish } from "../factory/lib/lint.mjs";
import { REPO_ROOT, parseArgs } from "../factory/lib/project.mjs";
import { BOOKS } from "./valice-catalog.mjs";

function loadEnvFile(path) {
  const env = {};
  if (!path || !existsSync(path)) return env;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
  }
  return env;
}

function imageHeight(path) {
  try {
    return Number(execFileSync("identify", ["-format", "%h", path], { encoding: "utf8" }).trim());
  } catch {
    return null;
  }
}

async function fetchStatus(url, init = {}) {
  try {
    const res = await fetch(url, { redirect: "manual", ...init });
    return { status: res.status, location: res.headers.get("location"), text: init.wantBody ? await res.text() : null };
  } catch (e) {
    return { status: 0, error: e.message };
  }
}

export function localChecks(book, report) {
  const slug = book.slug;
  for (const f of book.formats) {
    if (f.kdp === "live" && !f.amazonAsin) report.error("asin", `${f.format} is kdp:live without an ASIN`, slug);
    if (f.amazonAsin && f.kdp !== "live") report.error("asin", `${f.format} has an ASIN but kdp is ${f.kdp}`, slug);
    if (f.fulfillment === "direct" && f.availability === "available") {
      if (!book.paddlePriceId) report.error("paddle", "direct ebook without paddlePriceId", slug);
      if (!f.masterFileKey) report.error("master", "direct ebook without masterFileKey", slug);
      if (book.kdpSelect) report.error("select", "KDP Select-enrolled book flagged for direct sale", slug);
    }
  }
  const cover = join(REPO_ROOT, "public", "images", "books", `${slug}.webp`);
  if (!existsSync(cover)) report.error("cover", `missing public/images/books/${slug}.webp`, slug);
  else {
    const h = imageHeight(cover);
    if (h != null && h < 1200) report.warn("cover", `cover height ${h} px (< 1200)`, slug);
  }
  const previews = join(REPO_ROOT, "public", "images", "previews", slug);
  if (!existsSync(previews) || !readdirSync(previews).length) report.warn("previews", "no preview pages", slug);
}

export async function networkChecks(book, origin, report) {
  const slug = book.slug;
  for (const f of book.formats) {
    if (f.amazonAsin) {
      const r = await fetchStatus(`https://www.amazon.com/dp/${f.amazonAsin}`, { headers: { "user-agent": "Mozilla/5.0" } });
      if (r.status !== 200) report.error("amazon", `${f.format} ASIN ${f.amazonAsin} → ${r.status}`, slug);
      await new Promise((r2) => setTimeout(r2, 800));
    }
  }
  const page = await fetchStatus(`${origin}/books/${slug}`, { wantBody: true });
  if (page.status !== 200) {
    report.error("page", `${origin}/books/${slug} → ${page.status}${page.location ? ` → ${page.location}` : ""}`, slug);
    return;
  }
  const canonical = (page.text.match(/<link rel="canonical" href="([^"]+)"/) ?? [])[1];
  if (!canonical || !canonical.startsWith(origin)) report.error("canonical", `canonical is ${canonical ?? "missing"}`, slug);
  const ld = [...page.text.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  if (!ld.length) report.error("json-ld", "no JSON-LD on the book page", slug);
  let hasOffer = false;
  for (const block of ld) {
    try {
      const parsed = JSON.parse(block);
      const text = JSON.stringify(parsed);
      if (text.includes('"Offer"')) hasOffer = true;
    } catch {
      report.error("json-ld", "JSON-LD does not parse", slug);
    }
  }
  const direct = book.formats.find((f) => f.fulfillment === "direct" && f.availability === "available" && (f.priceCents ?? 0) > 0);
  if (direct && !hasOffer) report.warn("json-ld", "direct price exists but no Offer in JSON-LD", slug);
  if (!direct && hasOffer) report.error("json-ld", "an Offer is emitted for a book with no direct price (would advertise $0)", slug);
  if (!report.errors.some((e) => e.where === slug)) report.pass("page", `${origin}/books/${slug} 200, canonical ok, JSON-LD parses`, slug);
}

async function sitemapCheck(origin, published, report) {
  const r = await fetchStatus(`${origin}/sitemap.xml`, { wantBody: true });
  if (r.status !== 200) return report.error("sitemap", `${origin}/sitemap.xml → ${r.status}`);
  const locs = [...r.text.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  for (const b of published) if (!locs.includes(`${origin}/books/${b.slug}`)) report.error("sitemap", `missing /books/${b.slug}`);
  for (const path of ["/ebooks", "/companion/hangul"]) if (!locs.includes(`${origin}${path}`)) report.warn("sitemap", `missing ${path} (deployed after the sitemap change?)`);
  if (!report.errors.some((e) => e.check === "sitemap")) report.pass("sitemap", `${locs.length} URLs`);
}

async function paddleCheck(env, published, report) {
  if (!env.PADDLE_API_KEY) return report.skipped("paddle", "no PADDLE_API_KEY in --env file");
  const base = env.PADDLE_ENVIRONMENT === "production" ? "https://api.paddle.com" : "https://sandbox-api.paddle.com";
  for (const b of published) {
    if (!b.paddlePriceId) continue;
    const r = await fetch(`${base}/prices/${b.paddlePriceId}`, { headers: { authorization: `Bearer ${env.PADDLE_API_KEY}` } });
    const j = await r.json().catch(() => ({}));
    const price = j.data;
    if (r.status !== 200 || !price) report.error("paddle", `price ${b.paddlePriceId} → ${r.status}`, b.slug);
    else {
      const amount = Number(price.unit_price?.amount);
      const expected = b.formats.find((f) => f.fulfillment === "direct")?.priceCents;
      if (price.status !== "active") report.error("paddle", `price ${b.paddlePriceId} is ${price.status}`, b.slug);
      else if (expected != null && amount !== expected) report.error("paddle", `Paddle charges ${amount} but the catalogue says ${expected}`, b.slug);
      else report.pass("paddle", `${b.paddlePriceId} active, ${amount} ${price.unit_price?.currency_code}`, b.slug);
    }
  }
}

async function r2Check(env, published, report) {
  if (!env.R2_ACCESS_KEY_ID || !env.R2_SECRET_ACCESS_KEY || !env.R2_ENDPOINT || !env.R2_BUCKET_MASTERS) return report.skipped("r2", "no R2_* credentials in --env file");
  const { S3Client, HeadObjectCommand } = await import("@aws-sdk/client-s3");
  const client = new S3Client({ region: "auto", endpoint: env.R2_ENDPOINT, credentials: { accessKeyId: env.R2_ACCESS_KEY_ID, secretAccessKey: env.R2_SECRET_ACCESS_KEY } });
  for (const b of published) {
    const key = b.formats.find((f) => f.fulfillment === "direct" && f.masterFileKey)?.masterFileKey;
    if (!key) continue;
    try {
      const head = await client.send(new HeadObjectCommand({ Bucket: env.R2_BUCKET_MASTERS, Key: key }));
      const mb = (head.ContentLength ?? 0) / 1048576;
      if (mb > 20) report.warn("r2", `${key} is ${mb.toFixed(1)} MB (> 20 MB — is this the print interior?)`, b.slug);
      else report.pass("r2", `${key} ${mb.toFixed(2)} MB`, b.slug);
    } catch (e) {
      report.error("r2", `${key}: ${e.name}`, b.slug);
    }
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const env = loadEnvFile(args.env ? resolve(args.env) : null);
  const origin = (args.origin ?? env.NEXT_PUBLIC_APP_URL ?? "https://valicepress.com").replace(/\/$/, "");
  const published = BOOKS.filter((b) => b.websiteStatus === "published" && (!args.slug || b.slug === args.slug));
  const report = new Report("validate-catalog", origin);
  for (const b of published) localChecks(b, report);
  if (args["skip-network"]) report.skipped("network", "--skip-network");
  else {
    for (const b of published) await networkChecks(b, origin, report);
    await sitemapCheck(origin, published, report);
    await paddleCheck(env, published, report);
    await r2Check(env, published, report);
  }
  finish(report, { out: join(REPO_ROOT, "docs", "execution", "validate-catalog.json"), json: Boolean(args.json) });
}

if (process.argv[1] && process.argv[1].endsWith("validate-catalog.mjs")) {
  main().catch((e) => {
    console.error(`validate-catalog: ${e.message}`);
    process.exit(1);
  });
}
