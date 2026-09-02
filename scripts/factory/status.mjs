#!/usr/bin/env node
/**
 * Machine-readable status of every factory project under a root.
 *
 *   node scripts/factory/status.mjs [--root <dir>] [--json] [--out <file>]
 *
 * A project is any directory (depth 1 under the root) that carries both
 * `project_config.json` and `gates.json`. Legacy book repositories that only
 * have `project_config.json` + `.gate` are listed as `legacy` with their
 * `.gate` token, so the founder sees the whole shelf in one table.
 *
 * Columns: project · stage · gate · owner · status · blocked_reason ·
 * founder_action · updated_at — the shape the later /admin/metrics page reads.
 */

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

import { loadHouse, loadProject, parseArgs, printTable, readJSON, writeJSON } from "./lib/project.mjs";

export function projectStatus(dir, house) {
  const project = loadProject(dir);
  const gates = Object.entries(project.gates.gates);
  const passed = gates.filter(([, g]) => g.status === "passed").length;
  const waived = gates.filter(([, g]) => g.status === "waived").length;
  const failed = gates.filter(([, g]) => g.status === "failed");
  const state = project.state?.state ?? "IDEA";
  // The next gate the current state's outgoing transition needs.
  const outgoing = house.states.transitions.filter((t) => t.from === state && !t.to.startsWith("*"));
  const needed = [...new Set(outgoing.flatMap((t) => t.requiresGates ?? []))]
    .filter((id) => !["passed", "waived"].includes(project.gates.gates[String(id)]?.status));
  const nextGate = needed.length ? project.gates.gates[String(needed[0])] : null;
  const founderPending = gates
    .filter(([, g]) => g.founderSignoff && !["passed", "waived"].includes(g.status))
    .map(([id, g]) => `gate ${id} ${g.name}`);
  const blocked = state === "BLOCKED" ? project.state.history.at(-1)?.reason ?? "(no reason recorded)" : failed.length ? `gate ${failed[0][0]} failed: ${failed[0][1].reason}` : "";
  return {
    project: project.config.project?.slug ?? dir,
    title: project.config.project?.title ?? "",
    series: project.config.project?.series ?? "",
    lane: project.config.project?.lane ?? "",
    stage: state,
    gate: nextGate ? `${needed[0]} ${nextGate.name}` : "—",
    gates_passed: `${passed}/12${waived ? ` (+${waived} waived)` : ""}`,
    owner: nextGate ? nextGate.owner : "",
    status: state === "BLOCKED" ? "blocked" : failed.length ? "failed" : state === "PUBLISHED" || state === "OPTIMIZE" ? "live" : "in_progress",
    blocked_reason: blocked,
    founder_action: founderPending.length && nextGate?.founderSignoff ? founderPending[0] : "",
    updated_at: project.state?.updatedAt ?? project.gates.gates["1"]?.updatedAt ?? "",
    kind: "factory",
  };
}

export function legacyStatus(dir) {
  const cfg = readJSON(join(dir, "project_config.json"));
  const gate = existsSync(join(dir, ".gate")) ? readFileSync(join(dir, ".gate"), "utf8").trim() : "";
  return {
    project: cfg.project?.slug ?? cfg.project?.id ?? dir.split("/").pop(),
    title: cfg.project?.title ?? cfg.product?.title ?? "",
    series: cfg.project?.series?.name ?? "",
    lane: "",
    stage: gate ? `legacy:${gate}` : "legacy",
    gate: "—",
    gates_passed: "",
    owner: "",
    status: "legacy",
    blocked_reason: "",
    founder_action: "",
    updated_at: "",
    kind: "legacy",
  };
}

export function scan(root, house) {
  const rows = [];
  for (const entry of readdirSync(root)) {
    const p = join(root, entry);
    if (!statSync(p).isDirectory()) continue;
    if (existsSync(join(p, "gates.json")) && existsSync(join(p, "project_config.json"))) rows.push(projectStatus(p, house));
    else if (existsSync(join(p, "project_config.json"))) rows.push(legacyStatus(p));
  }
  return rows.sort((a, b) => a.kind.localeCompare(b.kind) || a.project.localeCompare(b.project));
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const root = resolve(args.root ?? process.env.VALICE_BOOKS_ROOT ?? "/home/emre/Downloads/MY-DİGİTAL-BOOK");
  const house = loadHouse();
  const rows = scan(root, house);
  const report = { generatedAt: new Date().toISOString(), root, projects: rows };
  if (args.out) writeJSON(resolve(args.out), report);
  if (args.json) console.log(JSON.stringify(report, null, 2));
  else printTable(rows, ["project", "stage", "gate", "owner", "status", "gates_passed", "blocked_reason", "founder_action", "updated_at"]);
}

if (process.argv[1] && process.argv[1].endsWith("status.mjs")) {
  try {
    main();
  } catch (e) {
    console.error(`status: ${e.message}`);
    process.exit(e.code ?? 1);
  }
}
