# SUB-PR 0.3 — Postgres Provisioning & Schema Migrations — Report

> **Phase:** P0 Foundations · **Unit:** SUB-PR 0.3 (`roadmap/WEB_SITE_ROADMAP.md` §18)
> **Scope (verbatim):** *"Managed Postgres (Neon/Supabase), ORM + typed migrations, and the full ERD schema with indexes from §10."*
> **Date:** 2026-05-28 · **Status:** ✅ Complete — verification gate green.
> **Roadmap reference consulted:** §10 (Database Strategy).
> **Stack committed:** **Neon (serverless Postgres)** + **Drizzle ORM** + **drizzle-kit**.

---

## 1. What was accomplished

| Deliverable | Result |
|---|---|
| Dependencies installed | `drizzle-orm 0.45.2`, `@neondatabase/serverless 1.1.0`, dev: `drizzle-kit 0.31.10`. Zero peer-deps needed (Node 24 has native `WebSocket`). |
| Neon-backed Drizzle client | `src/lib/db/index.ts` — `neon-serverless` driver + Pool (transaction-capable) + lazy-fail on missing `DATABASE_URL`. |
| Full §10 schema | `src/lib/db/schema.ts` — **13 tables**, **5 enums**, full relations graph. |
| Mandated indexes | All five §10-required indexes generated as SQL (§3). |
| FTS pipeline | Postgres-native `GENERATED ALWAYS AS … STORED` `tsvector` on `books`, served by a **GIN index** (§3). |
| Drizzle Kit config | `drizzle.config.ts` — schema/out/dialect, `DATABASE_URL` with safe placeholder fallback for offline `generate`. |
| `package.json` scripts | `db:generate`, `db:migrate`, `db:push`, `db:studio`. |
| CI/CD wiring | DB-migration placeholder in `ci.yml` **replaced** with a real `npm run db:migrate` step, gated on the `DATABASE_URL` GitHub secret (§5). |
| Memory/agent updates | `CLAUDE.md` (stack line + commands) and `memory/PAST_DECISIONS.md` (DB line specifies Neon + Drizzle) updated. |
| Migrations produced & inspected | `drizzle/0000_plain_chat.sql` (10 KB) + `drizzle/meta/_journal.json` + snapshot — committed. |

---

## 2. Tables & relations (§10 ERD, end-to-end)

| Drizzle export | Physical table | Role |
|---|---|---|
| `users` | `users` | accounts (email-unique) |
| `books` | `books` | catalog; carries the `search_tsv` generated column |
| `authors` | `authors` | catalog metadata (first-party, not sellers) |
| `categories` | `categories` | classification |
| `bookAuthors` | `book_authors` | M:N (composite PK; `position` orders co-authors) |
| `bookCategories` | `book_categories` | M:N (composite PK) |
| `orders` | `orders` | MoR-keyed commercial record |
| `orderItems` | `order_items` | line items at purchase price |
| `entitlements` | `entitlements` | perpetual grants — the access surface (ADR-3) |
| `watermarkJobs` | `watermark_jobs` | async pipeline status |
| `readingProgress` | `reading_progress` | one row per (user, book) |
| `reviews` | `reviews` | rating + body, status-gated |
| `downloadLogs` | `download_logs` | abuse-detection trail (§11) |

The Drizzle **relational query API** is fully wired — every table has a matching `relations(...)` definition for `db.query.<table>.findMany({ with: { ... } })` ergonomics. This was the bulk of the bottom half of `schema.ts`.

**Naming convention chosen:** physical tables are **plural snake_case** (`users`, `orders`, `books`). This deliberately sidesteps Postgres' reserved words `user` and `order` while staying SQL-idiomatic. Drizzle exports remain singular-ergonomic (`users`, `orders`).

**`onDelete` policy is deliberate, not default:**
| Source | Targets | Policy | Why |
|---|---|---|---|
| `users` | `orders`, `entitlements` | `restrict` | preserve commercial paper trail |
| `users` | `reading_progress`, `reviews` | `cascade` | personal derived data |
| `books` | `order_items`, `entitlements` | `restrict` | preserve order history |
| `books` | `reading_progress`, `reviews`, `book_authors`, `book_categories` | `cascade` | meaningless without the book |
| `orders` | `order_items` | `cascade` | items belong to the order |
| `orders` | `entitlements` | `restrict` | the contract survives the receipt |
| `entitlements` | `watermark_jobs`, `download_logs` | `cascade` | derived state of the entitlement |

---

## 3. Indexes (the §10-mandated five — and the supporting set)

**All five §10-mandated indexes generated correctly:**

| § Requirement | Generated SQL |
|---|---|
| Unique on `book.slug` | `CREATE UNIQUE INDEX "books_slug_uk" ON "books" USING btree ("slug")` |
| Composite on `book.status` + `book.published_at` | `CREATE INDEX "books_status_published_at_idx" ON "books" USING btree ("status","published_at")` |
| Unique composite on `entitlement(user_id, book_id)` | `CREATE UNIQUE INDEX "entitlements_user_book_uk" ON "entitlements" USING btree ("user_id","book_id")` |
| Unique on `order.mor_order_ref` | `CREATE UNIQUE INDEX "orders_mor_order_ref_uk" ON "orders" USING btree ("mor_order_ref")` |
| **FTS on `book(title, description)`** | **GIN index** on the generated `search_tsv` column — full SQL in §4 below |

**Supporting indexes** (not mandated but high-value, added based on the queries §5/§9/§14 imply):
- `entitlements_user_status_idx` — fast library queries (`WHERE user_id = ? AND status = 'ready'`).
- `entitlements_order_idx` — webhook reconciliation by order.
- `orders_user_created_at_idx` — user order history.
- `order_items_order_idx` — items lookup by order.
- `watermark_jobs_entitlement_idx` / `watermark_jobs_status_updated_idx` — stuck-job sweepers + entitlement-scoped retries.
- `reading_progress_user_book_uk` — one progress row per (user, book).
- `reviews_user_book_uk` + `reviews_book_status_idx` — one review per (user, book); approved-reviews-for-book read path.
- `download_logs_entitlement_idx` + `download_logs_entitlement_created_idx` — velocity windows for abuse detection.

---

## 4. The complex piece: PostgreSQL FTS implementation

**Goal (§10):** "FTS index on book(title, description)".

**Pattern chosen:** the canonical Postgres approach — a STORED generated `tsvector` column on `books` with the **title weighted `A` and description weighted `B`**, served by a GIN index. This puts the work at write-time (and amortizes it) and keeps query plans simple: `WHERE search_tsv @@ to_tsquery('english', '...')`.

**Drizzle wiring (`src/lib/db/schema.ts`):**

```ts
const tsvector = customType<{ data: string }>({
  dataType: () => "tsvector",
});

searchTsv: tsvector("search_tsv").generatedAlwaysAs(
  sql`setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
      setweight(to_tsvector('english', coalesce(description, '')), 'B')`,
),
```

```ts
index("books_search_gin_idx").using("gin", t.searchTsv)
```

**Generated SQL (`drizzle/0000_plain_chat.sql`):**

```sql
"search_tsv" "tsvector" GENERATED ALWAYS AS (
  setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(description, '')), 'B')
) STORED
...
CREATE INDEX "books_search_gin_idx" ON "books" USING gin ("search_tsv");
```

This is the standard, query-friendly form. SUB-PR 1.2 (browse + search) will issue queries against `search_tsv` directly; SUB-PR 3.4 (search upgrade) can later swap to a dedicated search service if recall warrants it, without disturbing the canonical FTS index.

**Why generated + GIN, and not other patterns:**
- A *functional* GIN index (expression-only, no stored column) was the alternative — works but you can't `SELECT` the tsvector or weight at query-time without recomputing.
- A *trigger-maintained* tsvector column adds moving parts; generated columns supersede this pattern on Postgres 12+.
- We're using `'english'` because the catalog is English-first (F4 / Roadmap §3); a future i18n SUB-PR would either add per-row language and switch to `to_tsvector(language, ...)`, or maintain language-specific `search_tsv_xx` columns.

---

## 5. Drizzle Kit config & CI/CD migration step

**`drizzle.config.ts`** (chosen knobs):
- `dialect: "postgresql"`, `schema: "./src/lib/db/schema.ts"`, `out: "./drizzle"`.
- `dbCredentials.url` uses `process.env.DATABASE_URL` **or a syntactically valid placeholder** (`postgresql://placeholder@localhost:5432/_unset`) — this lets `drizzle-kit generate` (which never connects) succeed in local dev and CI before Neon credentials exist.
- `verbose: true`, `strict: true`.

**`package.json` scripts:**
```json
"db:generate": "drizzle-kit generate",
"db:migrate":  "drizzle-kit migrate",
"db:push":     "drizzle-kit push",
"db:studio":   "drizzle-kit studio"
```

**`.github/workflows/ci.yml`** — the previous placeholder echo step was replaced with a real, **secret-gated** migration step:

```yaml
- name: DB migration (Drizzle)
  if: github.event_name == 'push' && github.ref == 'refs/heads/main'
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
  run: |
    if [ -z "$DATABASE_URL" ]; then
      echo "::warning title=DB migration skipped::DATABASE_URL secret is not yet configured in GitHub Actions. …"
      exit 0
    fi
    npm run db:migrate
```

This **does not break CI** while Neon credentials are still being provisioned: if the `DATABASE_URL` secret isn't set, the step emits a warning annotation and exits cleanly. The moment the secret is added in **Settings → Secrets and variables → Actions**, migrations apply automatically on every push to `main`, with zero further wiring.

The migration step runs **only** on `push` to `main` — never on PRs against an ephemeral preview DB — which matches the canonical "migrations follow merges, not previews" pattern.

---

## 6. DB client design choices (`src/lib/db/index.ts`)

- **Driver:** `drizzle-orm/neon-serverless` (WebSocket Pool), **not** `neon-http`. Reason: the fulfillment pipeline in SUB-PR 1.5/1.6 must upsert `Order` + `OrderItem` + `Entitlement` **atomically inside a transaction** (ADR-3, §9), and Drizzle's HTTP path does not yet support transactions.
- **No `ws` polyfill:** Node 22+ ships native `WebSocket`; we target Node 24. The file documents the one-liner workaround if this ever runs on an older Node.
- **No throw on missing `DATABASE_URL`:** the Pool tolerates an empty connection string at construction (lazy connect). Build steps that never query (current state) succeed; the first real query against an unset URL will fail loudly — the correct behavior.

---

## 7. Verification results (this run)

| Check | Command | Result |
|---|---|---|
| Schema → SQL | `npm run db:generate` | ✅ `drizzle/0000_plain_chat.sql` produced — 13 tables, 5 enums, all §10 indexes, FTS generated column emitted correctly |
| Lint | `npm run lint` | ✅ Pass |
| Typecheck | `npx tsc --noEmit` | ✅ Pass (schema + relations type cleanly under `strict: true`) |
| Build | `npm run build` | ✅ Pass — compiled in ~2.1s; `/` still **○ Static** (SSG preserved); 4 static pages |

Same benign Node warning as the previous SUB-PRs (`MODULE_TYPELESS_PACKAGE_JSON` on `tailwind.config.ts`) — cosmetic, not blocking.

---

## 8. Files created / modified

```
src/lib/db/schema.ts                 (new — 13 tables, 5 enums, FTS, full relations)
src/lib/db/index.ts                  (new — Neon serverless + Drizzle Pool)
drizzle.config.ts                    (new — Drizzle Kit config)
drizzle/0000_plain_chat.sql          (new — generated migration; committed)
drizzle/meta/_journal.json           (new — migration journal; committed)
drizzle/meta/0000_snapshot.json      (new — schema snapshot; committed)
.github/workflows/ci.yml             (db migration step: placeholder → real, secret-gated)
package.json                         (+ db:generate / db:migrate / db:push / db:studio scripts; + drizzle deps via npm install)
package-lock.json                    (updated)
CLAUDE.md                            (stack line specifies Neon + Drizzle; expanded commands)
memory/PAST_DECISIONS.md             (DB decision updated to Neon + Drizzle + drizzle-kit; SUB-PR 0.3 noted)
sub-pr-report/SUB_PR_0.3_REPORT.md   (new — this report)
```

---

## 9. Decisions / deviations worth surfacing

1. **Plural snake_case table names.** Avoids the Postgres reserved words `user` and `order` without quoting-everywhere. Drizzle exports stay singular-ergonomic.
2. **`neon-serverless` over `neon-http`.** Transactions are non-negotiable for the fulfillment pipeline (ADR-3) and only the WebSocket driver supports them in Drizzle today.
3. **Generated `tsvector` column + GIN** chosen over a functional GIN index — query-friendly, query plans are simpler, and language is explicit (`'english'`).
4. **CI migration step is secret-gated and does not fail** when `DATABASE_URL` is unset — the pipeline keeps moving while Neon is being provisioned in the dashboard.
5. **`onDelete` policies are explicit per FK** (mix of `restrict` and `cascade`) — preserve commercial history; cascade only personal/derived data.
6. **No `ws` polyfill installed** — Node 24 has native `WebSocket`. Minimal-deps preference.
7. **Drizzle Kit `dbCredentials.url` falls back to a syntactically valid placeholder** so `db:generate` is fully offline-capable.

---

## 10. Definition-of-done vs. SUB-PR 0.3 scope

- [x] Drizzle ORM + Neon serverless installed; drizzle-kit dev dep.
- [x] DB connection utility (`src/lib/db/index.ts`) — Pool + transaction-capable.
- [x] **All 11** §10 ERD entities implemented (users, books, authors, categories, orders, order_items, entitlements, watermark_jobs, reading_progress, reviews, download_logs) **plus** the 2 junction tables (book_authors, book_categories).
- [x] Strict types: UUIDs everywhere, `timestamptz`, integer cents, smallint rating, `real` percent, enums.
- [x] Relations graph wired for Drizzle's relational query API.
- [x] All 5 §10-mandated indexes — including FTS (`tsvector` + GIN).
- [x] `drizzle.config.ts` present.
- [x] `db:generate / migrate / push / studio` scripts.
- [x] CI migration step replaced with the real Drizzle command (secret-gated).
- [x] `db:generate` produces valid SQL; lint / tsc / build green.

**Out of scope (correctly deferred):** provisioning the actual Neon project, populating `DATABASE_URL` / `DIRECT_URL` secrets, seed data, server actions / route handlers that *use* the schema — those belong to SUB-PR 0.4 (R2) and onward.

---

## 11. Next unit (NOT started — awaiting approval)

**SUB-PR 0.4 — Object storage (R2) & signed-URL utility.** Private master + artifact buckets, S3-compatible client, short-TTL signed-URL issuance, per-environment isolation (Roadmap ADR-6, §12). Execution is **halted pending explicit approval.**
