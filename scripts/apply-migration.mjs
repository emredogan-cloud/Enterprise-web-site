/**
 * Apply one committed migration SQL file directly, statement by statement.
 *
 * Why this exists rather than `npm run db:migrate`: this project's
 * `__drizzle_migrations` journal is empty on databases that were built with
 * `db:push`, so drizzle-kit replays `0000` and collides with the existing
 * schema. That is documented in the project memory as a known trap. The
 * committed SQL is still the source of truth; this script just applies it
 * without the journal.
 *
 * Usage:
 *   node scripts/apply-migration.mjs drizzle/0005_soft_glorian.sql [--commit]
 *
 * Dry by default: prints the target database and the statements it *would*
 * run, and touches nothing. Pass --commit to actually execute. The target is
 * always DATABASE_URL from .env.local — verify the printed database name
 * before committing, because this repo has a production (`neondb`) and a
 * sandbox (`bookstore`) database on the same host and mixing them is the
 * single highest-consequence mistake available here.
 */
import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

function readEnvUrl() {
  const raw = readFileSync(".env.local", "utf8");
  const line = raw.split("\n").find((l) => l.startsWith("DATABASE_URL="));
  if (!line) throw new Error("DATABASE_URL not found in .env.local");
  // Values may be quoted; strip a single leading/trailing quote pair.
  return line.slice("DATABASE_URL=".length).trim().replace(/^["']|["']$/g, "");
}

const file = process.argv[2];
const commit = process.argv.includes("--commit");
if (!file) {
  console.error("usage: node scripts/apply-migration.mjs <file.sql> [--commit]");
  process.exit(1);
}

const sql = neon(readEnvUrl());
const [{ db }] = await sql`select current_database() as db`;
console.log(`target database : ${db}`);
console.log(`migration file  : ${file}`);
console.log(`mode            : ${commit ? "COMMIT" : "DRY RUN"}\n`);

const statements = readFileSync(file, "utf8")
  .split("--> statement-breakpoint")
  .map((s) => s.trim())
  .filter(Boolean);

for (const [i, stmt] of statements.entries()) {
  const label = `[${i + 1}/${statements.length}] ${stmt.split("\n")[0].slice(0, 90)}`;
  if (!commit) {
    console.log(`WOULD RUN ${label}`);
    continue;
  }
  try {
    await sql.query(stmt);
    console.log(`ok  ${label}`);
  } catch (err) {
    // Re-running a partially applied migration is a normal recovery path,
    // so an "already exists" is reported and skipped rather than fatal.
    if (/already exists/i.test(err.message)) {
      console.log(`skip ${label} — already exists`);
      continue;
    }
    console.error(`FAIL ${label}\n     ${err.message}`);
    process.exit(1);
  }
}

console.log(
  commit ? "\nmigration applied." : "\ndry run complete — re-run with --commit to apply.",
);
