/**
 * Shared shape for every factory lint: collect findings, print them, write a
 * JSON report into the project's QA/ directory, exit non-zero on errors.
 *
 * A lint never "returns success" without having run its checks; when a check
 * cannot run (missing tool, missing input) it records a `skipped` finding so
 * the QA report shows the gap instead of hiding it.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

export class Report {
  constructor(tool, target) {
    this.tool = tool;
    this.target = target;
    this.findings = [];
    this.startedAt = new Date().toISOString();
  }
  error(check, message, where = null) {
    this.findings.push({ level: "error", check, message, where });
  }
  warn(check, message, where = null) {
    this.findings.push({ level: "warn", check, message, where });
  }
  skipped(check, message) {
    this.findings.push({ level: "skipped", check, message, where: null });
  }
  pass(check, message = "") {
    this.findings.push({ level: "pass", check, message, where: null });
  }
  get errors() {
    return this.findings.filter((f) => f.level === "error");
  }
  get ok() {
    return this.errors.length === 0;
  }
  toJSON() {
    return {
      tool: this.tool,
      target: this.target,
      startedAt: this.startedAt,
      finishedAt: new Date().toISOString(),
      ok: this.ok,
      counts: {
        pass: this.findings.filter((f) => f.level === "pass").length,
        warn: this.findings.filter((f) => f.level === "warn").length,
        error: this.errors.length,
        skipped: this.findings.filter((f) => f.level === "skipped").length,
      },
      findings: this.findings,
    };
  }
  print() {
    for (const f of this.findings) {
      const tag = { error: "ERROR  ", warn: "WARN   ", skipped: "SKIPPED", pass: "PASS   " }[f.level];
      console.log(`  ${tag} ${f.check}${f.where ? ` (${f.where})` : ""}${f.message ? ` — ${f.message}` : ""}`);
    }
    const c = this.toJSON().counts;
    console.log(`${this.tool}: ${this.ok ? "ok" : "FAIL"} · ${c.pass} pass · ${c.warn} warn · ${c.error} error · ${c.skipped} skipped`);
  }
  write(path) {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, `${JSON.stringify(this.toJSON(), null, 2)}\n`);
  }
}

/** Finish a CLI lint: print, optionally write QA/<name>.json, set the exit code. */
export function finish(report, { projectRoot = null, out = null, json = false } = {}) {
  if (json) console.log(JSON.stringify(report.toJSON(), null, 2));
  else report.print();
  const target = out ?? (projectRoot ? join(projectRoot, "QA", `${report.tool}.json`) : null);
  if (target) report.write(target);
  process.exitCode = report.ok ? 0 : 1;
}

/** Extract the first fenced ```json block from a markdown file, or null. */
export function jsonBlockFromMarkdown(path) {
  if (!existsSync(path)) return null;
  const text = readFileSync(path, "utf8");
  const m = text.match(/```json\s*\n([\s\S]*?)\n```/);
  if (!m) return null;
  try {
    return JSON.parse(m[1]);
  } catch {
    return null;
  }
}

/** Tiny CSV parser that honours double quotes. Returns array of objects keyed by the header row. */
export function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') inQuotes = false;
      else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else field += c;
  }
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }
  const [header, ...body] = rows.filter((r) => r.length > 1 || (r.length === 1 && r[0] !== ""));
  return body.map((r) => Object.fromEntries(header.map((h, i) => [h.trim(), (r[i] ?? "").trim()])));
}

export function readJSONL(path) {
  if (!existsSync(path)) return [];
  return readFileSync(path, "utf8")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l, i) => {
      try {
        return JSON.parse(l);
      } catch {
        return { __parseError: true, line: i + 1 };
      }
    });
}

export function normalizeText(s) {
  return String(s ?? "").toLowerCase().replace(/\s+/g, " ").trim();
}
