// Every gate on every factory project, as one table.
import { readdirSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
const ROOT = process.env.VALICE_BOOKS_ROOT ?? "/home/emre/Downloads/MY-DİGİTAL-BOOK";

const projects = [];
const walk = (dir, depth = 0) => {
  if (depth > 3) return;
  let entries; try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return; }
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    const p = join(dir, e.name);
    if (existsSync(join(p, "gates.json")) && existsSync(join(p, "project_config.json"))) projects.push(p);
    else walk(p, depth + 1);
  }
};
walk(ROOT);

const house = JSON.parse(readFileSync(new URL("../../valice-house/workflows/gates.json", import.meta.url), "utf8"));
const defs = house.gates;
const tally = {};
const rows = [];
for (const p of projects.sort()) {
  const g = JSON.parse(readFileSync(join(p, "gates.json"), "utf8"));
  const cfg = JSON.parse(readFileSync(join(p, "project_config.json"), "utf8"));
  const name = cfg.title ?? cfg.slug ?? p.split("/").pop();
  const cells = defs.map((d) => {
    const r = g.gates[String(d.id)];
    const s = r?.status ?? "?";
    tally[s] = (tally[s] ?? 0) + 1;
    return { id: d.id, s, founder: !!d.founderSignoff };
  });
  rows.push({ name: name.slice(0, 34), path: p, cells });
}

const sym = { passed: "✓", pending: "·", failed: "✗", waived: "~", blocked: "B" };
console.log(`gate:      ${defs.map((d) => String(d.id).padStart(3)).join("")}`);
console.log(`founder:   ${defs.map((d) => (d.founderSignoff ? "  F" : "  ·")).join("")}`);
for (const r of rows) {
  console.log(`${r.cells.map((c) => (sym[c.s] ?? "?").padStart(3)).join("")}   ${r.name}`);
}
console.log(`\ntally: ${Object.entries(tally).map(([k, v]) => `${k}=${v}`).join("  ")}`);
console.log(`projects: ${projects.length}`);
console.log(`\ngate names:`);
for (const d of defs) console.log(`  ${String(d.id).padStart(2)}  ${d.founderSignoff ? "F" : " "}  ${d.name}`);
