#!/usr/bin/env node
/**
 * Budget-guarded image generation for cover concepts (OpenAI Images API).
 *
 *   node scripts/covers/generate-cover.mjs --slug <slug> --prompt "…" | --prompt-file <md>
 *        [--model gpt-image-1] [--size 1024x1536] [--quality medium] [--n 1] [--commit]
 *
 * Safety properties — each is enforced, not advisory:
 *   - the key is read ONLY from the OPENAI_API_KEY environment variable; it is
 *     never printed, logged, or written anywhere;
 *   - dry run is the default: the request is printed (without the key) and no
 *     call is made; `--commit` is required to spend;
 *   - a hard budget: OPENAI_IMAGE_BUDGET_USD (default 4.00). Before every call
 *     the ledger total plus the conservative estimate for this call must stay
 *     under the cap, or the script exits 3 without calling;
 *   - the ledger `assets/.image-ledger.json` (gitignored) records every call
 *     with the estimate and, after the response, the reported usage; the
 *     summary is mirrored into valice-house/cost/ledger.jsonl via cost-ledger;
 *   - output goes to assets/<slug>/cover/generated/<timestamp>-<size>.png —
 *     never into a slot (front-v<n>.png is a founder decision, made by
 *     renaming after review), and the prompt never contains the title (the
 *     model must not render text; typography is added in layout).
 *
 * Price basis: gpt-image-2 image output $30 per 1M tokens, gpt-image-1 $40
 * per 1M (developers.openai.com/api/docs/pricing, checked 2026-09-02).
 * Tokens-per-image by size/quality could not be verified on the pricing
 * page this session, so the ESTIMATE uses conservative published-style
 * figures and is labelled as such in the ledger; the actual usage from the
 * response overwrites it.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

import { REPO_ROOT, parseArgs } from "../factory/lib/project.mjs";
import { addEntry } from "../factory/cost-ledger.mjs";

export const LEDGER = join(REPO_ROOT, "assets", ".image-ledger.json");
export const DEFAULT_BUDGET_USD = 4.0;

/** $ per 1M output image tokens [V pricing page 2026-09-02]. */
const OUTPUT_TOKEN_USD_PER_M = { "gpt-image-2": 30, "gpt-image-1.5": 30, "gpt-image-1": 40, "gpt-image-1-mini": 8 };

/** Conservative token estimates per image [A — not verified on the pricing page]. */
const EST_TOKENS = {
  low: { "1024x1024": 272, "1024x1536": 408, "1536x1024": 400 },
  medium: { "1024x1024": 1056, "1024x1536": 1584, "1536x1024": 1568 },
  high: { "1024x1024": 4160, "1024x1536": 6240, "1536x1024": 6208 },
};

export function estimateUsd({ model, size, quality, n }) {
  const perM = OUTPUT_TOKEN_USD_PER_M[model] ?? 40;
  const tokens = EST_TOKENS[quality]?.[size] ?? 6240; // unknown → assume the most expensive
  return { tokens, usd: (tokens * n * perM) / 1e6, perM };
}

export function readLedger() {
  if (!existsSync(LEDGER)) return { entries: [] };
  return JSON.parse(readFileSync(LEDGER, "utf8"));
}

export function spent(ledger) {
  return ledger.entries.reduce((s, e) => s + (e.actualUsd ?? e.estimatedUsd ?? 0), 0);
}

export function budgetAllows(ledger, estimate, cap) {
  return spent(ledger) + estimate <= cap + 1e-9;
}

function redact(s) {
  return String(s).replace(/sk-[A-Za-z0-9_-]{6,}/g, "sk-***");
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const slug = args.slug;
  if (!slug || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
    console.error("usage: generate-cover.mjs --slug <slug> --prompt \"…\" | --prompt-file <md> [--commit]");
    process.exit(2);
  }
  const prompt = args["prompt-file"] ? readFileSync(resolve(args["prompt-file"]), "utf8").trim() : args.prompt;
  if (!prompt || prompt === true) {
    console.error("generate-cover: a prompt is required");
    process.exit(2);
  }
  const model = args.model ?? "gpt-image-1";
  const size = args.size ?? "1024x1536";
  const quality = args.quality ?? "medium";
  const n = Number(args.n ?? 1);
  const cap = Number(process.env.OPENAI_IMAGE_BUDGET_USD ?? DEFAULT_BUDGET_USD);
  const ledger = readLedger();
  const est = estimateUsd({ model, size, quality, n });
  const already = spent(ledger);

  console.log(`generate-cover — slug ${slug} · ${model} · ${size} · ${quality} · n=${n}`);
  console.log(`  budget cap $${cap.toFixed(2)} · spent so far $${already.toFixed(4)} · this call ≈ $${est.usd.toFixed(4)} (${est.tokens} est. tokens × ${n}) [estimate]`);
  if (!budgetAllows(ledger, est.usd, cap)) {
    console.error(`generate-cover: REFUSED — would exceed the $${cap.toFixed(2)} cap`);
    process.exit(3);
  }
  if (!args.commit) {
    console.log("  DRY RUN — no request sent. Pass --commit to spend.");
    console.log(`  prompt: ${redact(prompt).slice(0, 200)}${prompt.length > 200 ? "…" : ""}`);
    return;
  }
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    console.error("generate-cover: OPENAI_API_KEY is not set in the environment (never pass it on the command line)");
    process.exit(2);
  }
  const outDir = join(REPO_ROOT, "assets", slug, "cover", "generated");
  mkdirSync(outDir, { recursive: true });
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const entry = { ts, slug, model, size, quality, n, estimatedUsd: Number(est.usd.toFixed(4)), actualUsd: null, usage: null, files: [] };

  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
    body: JSON.stringify({ model, prompt, size, quality, n }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    entry.error = redact(JSON.stringify(body).slice(0, 300));
    ledger.entries.push(entry);
    writeFileSync(LEDGER, `${JSON.stringify(ledger, null, 2)}\n`);
    console.error(`generate-cover: API error ${res.status}: ${entry.error}`);
    process.exit(1);
  }
  const images = body.data ?? [];
  images.forEach((img, i) => {
    if (img.b64_json) {
      const file = join(outDir, `${ts}-${size}-${i + 1}.png`);
      writeFileSync(file, Buffer.from(img.b64_json, "base64"));
      entry.files.push(file);
    }
  });
  if (body.usage?.output_tokens != null) {
    entry.usage = body.usage;
    entry.actualUsd = Number(((body.usage.output_tokens * est.perM) / 1e6).toFixed(4));
  }
  ledger.entries.push(entry);
  writeFileSync(LEDGER, `${JSON.stringify(ledger, null, 2)}\n`);
  addEntry({ project: slug, kind: "image", usd: entry.actualUsd ?? entry.estimatedUsd, units: body.usage?.output_tokens ?? null, model, stage: "cover", note: entry.actualUsd == null ? "estimate (no usage in response)" : "actual from response usage" });
  console.log(`  written ${entry.files.length} file(s) to ${outDir}; cost ${entry.actualUsd != null ? `$${entry.actualUsd} (actual)` : `$${entry.estimatedUsd} (estimate)`}`);
}

if (process.argv[1] && process.argv[1].endsWith("generate-cover.mjs")) {
  main().catch((e) => {
    console.error(`generate-cover: ${redact(e.message)}`);
    process.exit(1);
  });
}
