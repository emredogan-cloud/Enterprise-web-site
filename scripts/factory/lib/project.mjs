/**
 * Shared helpers for the Valice publishing factory scripts.
 *
 * A "project" is a directory instantiated from
 * `valice-house/templates/project-template/`. The factory keeps three small
 * JSON files at its root and treats them as the record of truth:
 *
 *   project_config.json  — the book's specification (same convention as the
 *                          existing book repositories under MY-DİGİTAL-BOOK/)
 *   gates.json           — the twelve quality gates with status + evidence
 *   state.json           — the content-project state and its history
 *
 * The definitions of gates and states live in `valice-house/workflows/`
 * and are loaded here so every script enforces the same rules.
 *
 * Nothing in this module performs network I/O.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));

/** Repository root (this file lives at scripts/factory/lib/). */
export const REPO_ROOT = resolve(HERE, "..", "..", "..");
export const HOUSE_ROOT = join(REPO_ROOT, "valice-house");

export const GATE_STATUSES = ["not_started", "in_progress", "passed", "failed", "waived"];

export function nowISO() {
  return new Date().toISOString();
}

export function readJSON(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

export function writeJSON(path, value) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

export function loadHouse(houseRoot = HOUSE_ROOT) {
  const gates = readJSON(join(houseRoot, "workflows", "gates.json"));
  const states = readJSON(join(houseRoot, "workflows", "state-machine.json"));
  return { gates, states, houseRoot };
}

/** Build the per-project gate record from the house definition. */
export function emptyGateRecord(house) {
  const gates = {};
  for (const g of house.gates.gates) {
    gates[String(g.id)] = {
      key: g.key,
      name: g.name,
      owner: g.owner,
      founderSignoff: g.founderSignoff,
      status: "not_started",
      evidence: [],
      updatedAt: null,
      updatedBy: null,
      approvedBy: null,
      reason: null,
    };
  }
  return { version: 1, gates };
}

export function emptyState(house) {
  return {
    version: 1,
    state: house.states.initial,
    previous: null,
    updatedAt: nowISO(),
    history: [{ state: house.states.initial, at: nowISO(), by: "factory", reason: "created" }],
  };
}

export function isProjectDir(dir) {
  return existsSync(join(dir, "project_config.json")) && existsSync(join(dir, "gates.json"));
}

export class FactoryError extends Error {
  constructor(message, code = 2) {
    super(message);
    this.code = code;
  }
}

export function loadProject(dir) {
  const root = resolve(dir);
  if (!isProjectDir(root)) {
    throw new FactoryError(`not a factory project (no project_config.json + gates.json): ${root}`);
  }
  const config = readJSON(join(root, "project_config.json"));
  const gates = readJSON(join(root, "gates.json"));
  const statePath = join(root, "state.json");
  const state = existsSync(statePath) ? readJSON(statePath) : null;
  return { root, config, gates, state };
}

export function saveGates(project) {
  writeJSON(join(project.root, "gates.json"), project.gates);
}

export function saveState(project) {
  writeJSON(join(project.root, "state.json"), project.state);
  // `.gate` keeps the convention of the existing book repositories: a single
  // plain-text token that CI and kill_gate.py can read without JSON.
  writeFileSync(join(project.root, ".gate"), `${project.state.state.toLowerCase()}\n`);
}

/** Evidence is a relative path that exists in the project, an http(s) URL, or a commit hash reference. */
export function evidenceIsAcceptable(project, item) {
  if (typeof item !== "string" || !item.trim()) return false;
  if (/^https?:\/\//.test(item)) return true;
  if (/^commit:[0-9a-f]{7,40}$/i.test(item)) return true;
  if (/^kdp:[A-Za-z0-9_-]{4,}$/.test(item)) return true; // a KDP submission/order id
  const p = item.split("#")[0];
  return existsSync(join(project.root, p)) || existsSync(resolve(p));
}

/** Parse `--key value` and `--flag` arguments; repeated keys accumulate into arrays. */
export function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) {
      out._.push(a);
      continue;
    }
    const key = a.slice(2);
    const next = argv[i + 1];
    let value = true;
    if (next !== undefined && !next.startsWith("--")) {
      value = next;
      i++;
    }
    if (key in out) {
      out[key] = Array.isArray(out[key]) ? [...out[key], value] : [out[key], value];
    } else {
      out[key] = value;
    }
  }
  return out;
}

export function asList(v) {
  if (v === undefined || v === true) return [];
  return Array.isArray(v) ? v : [v];
}

/** Print a padded table to stdout. */
export function printTable(rows, columns) {
  const widths = columns.map((c) =>
    Math.max(c.length, ...rows.map((r) => String(r[c] ?? "").length)),
  );
  const line = (cells) => cells.map((c, i) => String(c ?? "").padEnd(widths[i])).join("  ");
  console.log(line(columns));
  console.log(widths.map((w) => "-".repeat(w)).join("  "));
  for (const r of rows) console.log(line(columns.map((c) => r[c])));
}
