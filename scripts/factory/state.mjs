#!/usr/bin/env node
/**
 * Move a factory project through the content-project state machine.
 *
 *   node scripts/factory/state.mjs <project-dir> show [--json]
 *   node scripts/factory/state.mjs <project-dir> to <STATE> [--by founder|R1..R9] [--reason "..."]
 *
 * The machine is `valice-house/workflows/state-machine.json`. A transition
 * is refused unless every gate it requires is `passed` (a `waived` gate
 * counts only when the gate is not in `neverSkip`). Founder-only
 * transitions require `--by founder`. Entering BLOCKED or KILLED requires a
 * reason; leaving BLOCKED returns to the state the project was in.
 */

import {
  FactoryError,
  loadHouse,
  loadProject,
  nowISO,
  parseArgs,
  saveState,
} from "./lib/project.mjs";

export function findTransition(house, from, to) {
  const t = house.states.transitions;
  return (
    t.find((x) => x.from === from && x.to === to) ??
    t.find((x) => x.from === "*" && x.to === to) ??
    (from === "BLOCKED" ? t.find((x) => x.from === "BLOCKED" && x.to === "*previous") : undefined)
  );
}

export function gateSatisfied(project, house, gateId) {
  const g = project.gates.gates[String(gateId)];
  if (!g) return false;
  if (g.status === "passed") return g.evidence.length > 0;
  if (g.status === "waived") return !house.states.neverSkip.includes(Number(gateId));
  return false;
}

export function transition(project, house, to, opts = {}) {
  const from = project.state?.state ?? house.states.initial;
  if (!house.states.states.includes(to)) throw new FactoryError(`unknown state ${to}`);
  if (to === from) throw new FactoryError(`already in ${from}`);

  let t = findTransition(house, from, to);
  if (from === "BLOCKED") {
    const prev = project.state.previous;
    if (to !== prev) throw new FactoryError(`from BLOCKED you can only return to ${prev} (or go to KILLED)`);
    t = house.states.transitions.find((x) => x.from === "BLOCKED" && x.to === "*previous");
  }
  if (!t) throw new FactoryError(`no transition ${from} → ${to}`);

  if (t.requiresReason && !opts.reason) throw new FactoryError(`${to} requires --reason`);
  if (t.founderOnly && opts.by !== "founder") {
    throw new FactoryError(`${from} → ${to} is founder-only; pass --by founder`);
  }
  const missing = (t.requiresGates ?? []).filter((id) => !gateSatisfied(project, house, id));
  if (missing.length) {
    throw new FactoryError(
      `${from} → ${to} requires gate(s) ${missing.join(", ")} passed with evidence` +
        (missing.some((id) => house.states.neverSkip.includes(id)) ? " (never-skip gate: waiver not accepted)" : ""),
    );
  }

  const previous = from === "BLOCKED" ? project.state.previous : from;
  project.state = {
    version: 1,
    state: to,
    previous: to === "BLOCKED" ? from : previous,
    updatedAt: nowISO(),
    history: [
      ...(project.state?.history ?? []),
      { state: to, at: nowISO(), by: opts.by ?? "factory", reason: opts.reason ?? null },
    ],
  };
  return project.state;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const [dir, cmd = "show", to] = args._;
  if (!dir) {
    console.error("usage: state.mjs <project-dir> show | to <STATE> [--by founder] [--reason ...]");
    process.exit(2);
  }
  const house = loadHouse();
  const project = loadProject(dir);
  if (cmd === "show") {
    if (args.json) console.log(JSON.stringify(project.state, null, 2));
    else {
      console.log(`state: ${project.state?.state ?? "(none)"}`);
      for (const h of project.state?.history ?? []) console.log(`  ${h.at}  ${h.state.padEnd(16)} by ${h.by}${h.reason ? ` — ${h.reason}` : ""}`);
    }
    return;
  }
  if (cmd === "to") {
    const s = transition(project, house, to, { by: args.by, reason: args.reason });
    saveState(project);
    console.log(`state → ${s.state}`);
    return;
  }
  throw new FactoryError(`unknown command ${cmd}`);
}

if (process.argv[1] && process.argv[1].endsWith("state.mjs")) {
  try {
    main();
  } catch (e) {
    console.error(`state: ${e.message}`);
    process.exit(e.code ?? 1);
  }
}
