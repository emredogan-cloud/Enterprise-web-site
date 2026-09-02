#!/usr/bin/env node
/**
 * Append-only ledger of AI/API cost per content project.
 *
 *   node scripts/factory/cost-ledger.mjs add --project <slug> --kind tokens|image|ocr|api \
 *        --usd 0.42 [--units 1030000] [--model gpt-image-2] [--stage draft] [--note "..."]
 *   node scripts/factory/cost-ledger.mjs summary [--project <slug>] [--json]
 *
 * File: valice-house/cost/ledger.jsonl (committed — cost is not a secret).
 * The ledger is how the factory learns COST PER CONTENT PROJECT. Every
 * entry carries the actual USD figure the provider reported (or the
 * operator's own reading of the bill), never an estimate presented as spend:
 * estimates go in `note`.
 */

import { appendFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { FactoryError, HOUSE_ROOT, nowISO, parseArgs, printTable } from "./lib/project.mjs";

export const LEDGER_PATH = join(HOUSE_ROOT, "cost", "ledger.jsonl");
const KINDS = ["tokens", "image", "ocr", "api"];

export function readLedger(path = LEDGER_PATH) {
  if (!existsSync(path)) return [];
  return readFileSync(path, "utf8")
    .split("\n")
    .filter((l) => l.trim())
    .map((l) => JSON.parse(l));
}

export function addEntry(entry, path = LEDGER_PATH) {
  if (!entry.project) throw new FactoryError("--project is required");
  if (!KINDS.includes(entry.kind)) throw new FactoryError(`--kind must be ${KINDS.join("|")}`);
  const usd = Number(entry.usd);
  if (!Number.isFinite(usd) || usd < 0) throw new FactoryError("--usd must be a non-negative number");
  const row = {
    ts: nowISO(),
    project: entry.project,
    kind: entry.kind,
    usd: Number(usd.toFixed(4)),
    units: entry.units !== undefined ? Number(entry.units) : null,
    model: entry.model ?? null,
    stage: entry.stage ?? null,
    note: entry.note ?? null,
  };
  mkdirSync(dirname(path), { recursive: true });
  appendFileSync(path, `${JSON.stringify(row)}\n`);
  return row;
}

export function summarize(rows, project) {
  const filtered = project ? rows.filter((r) => r.project === project) : rows;
  const byProject = new Map();
  for (const r of filtered) {
    const s = byProject.get(r.project) ?? { project: r.project, entries: 0, usd: 0, tokens: 0, image: 0, ocr: 0, api: 0 };
    s.entries += 1;
    s.usd += r.usd;
    s[r.kind] += r.usd;
    byProject.set(r.project, s);
  }
  return [...byProject.values()].map((s) => ({
    ...s,
    usd: Number(s.usd.toFixed(2)),
    tokens: Number(s.tokens.toFixed(2)),
    image: Number(s.image.toFixed(2)),
    ocr: Number(s.ocr.toFixed(2)),
    api: Number(s.api.toFixed(2)),
  }));
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const cmd = args._[0] ?? "summary";
  if (cmd === "add") {
    const row = addEntry({ project: args.project, kind: args.kind, usd: args.usd, units: args.units, model: args.model, stage: args.stage, note: args.note });
    console.log(`recorded ${row.kind} $${row.usd} for ${row.project}`);
    return;
  }
  if (cmd === "summary") {
    const rows = summarize(readLedger(), args.project);
    if (args.json) console.log(JSON.stringify(rows, null, 2));
    else if (!rows.length) console.log("ledger is empty");
    else printTable(rows, ["project", "entries", "usd", "tokens", "image", "ocr", "api"]);
    return;
  }
  throw new FactoryError(`unknown command ${cmd}`);
}

if (process.argv[1] && process.argv[1].endsWith("cost-ledger.mjs")) {
  try {
    main();
  } catch (e) {
    console.error(`cost-ledger: ${e.message}`);
    process.exit(e.code ?? 1);
  }
}
