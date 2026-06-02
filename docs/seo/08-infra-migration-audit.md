# WS-INFRA — Migration-System Audit (awareness + safety)

**Scope:** audit only. No redesign, no migration-system rewrite, no DB work beyond the already-approved `categories.description` (applied). Surfaced because the migration journal turned out to be in a non-standard state.

## Findings

| # | Finding | Evidence |
|---|---|---|
| 1 | **Prod migration journal is EMPTY.** `drizzle.__drizzle_migrations` has 0 rows, yet the schema is fully present. Prod was provisioned via **`db:push`** (direct schema sync), not `db:migrate`. | Live query returned `[]` for the migrations table |
| 2 | **`drizzle-kit migrate` cannot run on prod.** With an empty journal it replays from `0000` (CREATE TABLEs that already exist) → aborts at `0000`. | Manual `db:migrate` exited 1; nothing applied |
| 3 | **CI `db:migrate` is a no-op today.** `ci.yml` runs it only on `push → main` **and** only if the GH Actions `DATABASE_URL` secret is set; it currently `exit 0`s with a warning ("secret not configured"). So CI has **never** applied migrations. | `ci.yml:54–62` (`if -z "$DATABASE_URL" … exit 0`) |
| 4 | **Committed migration files are not the source of truth.** `0000`–`0003` exist in `drizzle/` but are **unapplied/untracked**; the real schema source is `schema.ts` via `db:push`. The files are currently *informational*, not *operational*. | journal vs files mismatch |
| 5 | **`categories.description` (0003) was applied directly** (`ALTER TABLE … ADD COLUMN IF NOT EXISTS … text`), idempotently, to achieve the approved change. Prod schema now matches `schema.ts`. | Live verify: column present, `text`, nullable |

## Severity: **MEDIUM**
- **Not breaking prod now** — schema is correct (db:push + the direct ALTER); no data risk; finding #2 fails atomically (nothing half-applied).
- **But:** the migration path is non-functional; turning on the CI secret would make CI's migrate step **fail** (finding #2); future migrations via `db:migrate` will fail until baselined; and the committed migration files mislead anyone who trusts them.

## Risk register
- **Replay risk:** LOW data-risk (atomic abort at `0000`), but the `migrate` path is blocked.
- **Drift risk:** MEDIUM — schema source-of-truth (db:push/`schema.ts`) and the migration files can diverge silently; only `schema.ts` is authoritative today.
- **Operational surprise:** MEDIUM — "just run `db:migrate`" does not work; this audit removes that landmine.

## Recommended future fix (do NOT do now — awareness only)
**Baseline the journal (preferred, low-effort):** mark `0000`–`0003` as already-applied in `drizzle.__drizzle_migrations` (insert their journal hashes), so `drizzle-kit migrate` treats them as done and **future** migrations (`0004+`) apply cleanly. Then set the GH Actions `DATABASE_URL` secret to re-enable CI auto-migrate. One-off, ~15 min, reversible.

Alternatives: (b) keep `db:push` for schema changes and **delete the misleading migration files** (simpler, loses history/auditability); (c) squash to a single baseline migration matching current schema + reset the journal (cleanest history, more work).

**Recommendation:** Option (a) — baseline — before any further schema change relies on migrations. Until then, schema changes must be applied the way `0003` was (direct/`db:push`) and **never** by trusting `db:migrate` in CI.

## Cluster-4 impact: none
This is contained. WS-J / WS-K proceed independently (no schema work).
