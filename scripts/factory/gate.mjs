#!/usr/bin/env node
/**
 * Inspect or set a quality gate on a factory project.
 *
 *   node scripts/factory/gate.mjs <project-dir> show [--json]
 *   node scripts/factory/gate.mjs <project-dir> set <id> <status>
 *        [--evidence <path|url|commit:sha|kdp:id>]... [--owner R1..R9|founder]
 *        [--reason "..."] [--approved-by founder]
 *
 * Rules (enforced, not advisory):
 *   - `passed` requires at least one acceptable evidence item and an owner.
 *     An evidence item is a file that exists (relative to the project), an
 *     http(s) URL, `commit:<sha>` or `kdp:<id>`.
 *   - Gates marked `founderSignoff` in valice-house/workflows/gates.json can
 *     only be `passed` or `waived` with `--approved-by founder`.
 *   - `failed` and `waived` require `--reason`. `waived` is recorded as a
 *     founder override; it is never displayed as a pass.
 *   - Nothing here ever writes `"passed": true` without evidence.
 */

import {
  FactoryError,
  GATE_STATUSES,
  asList,
  evidenceIsAcceptable,
  loadHouse,
  loadProject,
  nowISO,
  parseArgs,
  printTable,
  saveGates,
} from "./lib/project.mjs";

export function setGate(project, house, id, status, opts = {}) {
  const def = house.gates.gates.find((g) => String(g.id) === String(id));
  if (!def) throw new FactoryError(`unknown gate id ${id}`);
  if (!GATE_STATUSES.includes(status)) {
    throw new FactoryError(`status must be one of ${GATE_STATUSES.join("|")}, got ${status}`);
  }
  const record = project.gates.gates[String(def.id)];
  if (!record) throw new FactoryError(`project has no record for gate ${def.id}; regenerate gates.json`);

  const evidence = asList(opts.evidence);
  const owner = opts.owner ?? null;
  const approvedBy = opts.approvedBy ?? null;
  const reason = opts.reason ?? null;

  if (status === "passed") {
    if (evidence.length === 0) {
      throw new FactoryError(`gate ${def.id} (${def.name}) cannot be passed without evidence`);
    }
    for (const e of evidence) {
      if (!evidenceIsAcceptable(project, e)) {
        throw new FactoryError(`evidence not acceptable (missing file or bad reference): ${e}`);
      }
    }
    if (!owner) throw new FactoryError(`gate ${def.id} cannot be passed without --owner`);
    if (def.founderSignoff && approvedBy !== "founder") {
      throw new FactoryError(
        `gate ${def.id} (${def.name}) is a founder sign-off; pass --approved-by founder`,
      );
    }
  }
  if (status === "waived") {
    if (!reason) throw new FactoryError("a waived gate needs --reason (it is a recorded override)");
    if (approvedBy !== "founder") throw new FactoryError("only the founder can waive a gate (--approved-by founder)");
  }
  if (status === "failed" && !reason) {
    throw new FactoryError("a failed gate needs --reason");
  }

  record.status = status;
  record.evidence = status === "passed" ? evidence : record.evidence;
  record.owner = owner ?? record.owner;
  record.approvedBy = status === "passed" || status === "waived" ? approvedBy : null;
  record.reason = reason;
  record.updatedAt = nowISO();
  record.updatedBy = owner ?? approvedBy ?? "factory";
  return record;
}

export function gateRows(project) {
  return Object.entries(project.gates.gates).map(([id, g]) => ({
    id,
    gate: g.name,
    owner: g.owner + (g.founderSignoff ? " + founder" : ""),
    status: g.status,
    evidence: g.evidence.length ? g.evidence.join(", ") : "",
    updated: g.updatedAt ?? "",
    reason: g.reason ?? "",
  }));
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const [dir, cmd = "show", id, status] = args._;
  if (!dir) {
    console.error("usage: gate.mjs <project-dir> show | set <id> <status> [--evidence ...] [--owner ...] [--reason ...] [--approved-by founder]");
    process.exit(2);
  }
  const house = loadHouse();
  const project = loadProject(dir);

  if (cmd === "show") {
    if (args.json) console.log(JSON.stringify(project.gates, null, 2));
    else printTable(gateRows(project), ["id", "gate", "owner", "status", "evidence", "updated", "reason"]);
    return;
  }
  if (cmd === "set") {
    const record = setGate(project, house, id, status, {
      evidence: args.evidence,
      owner: args.owner,
      reason: args.reason,
      approvedBy: args["approved-by"],
    });
    saveGates(project);
    console.log(`gate ${id} → ${record.status}${record.evidence.length ? ` (evidence: ${record.evidence.join(", ")})` : ""}`);
    return;
  }
  throw new FactoryError(`unknown command ${cmd}`);
}

if (process.argv[1] && process.argv[1].endsWith("gate.mjs")) {
  try {
    main();
  } catch (e) {
    console.error(`gate: ${e.message}`);
    process.exit(e.code ?? 1);
  }
}
