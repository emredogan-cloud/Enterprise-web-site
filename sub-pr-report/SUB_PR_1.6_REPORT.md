# SUB-PR 1.6 — Async Watermark Pipeline (Inngest + pdf-lib) — Report

> **Phase:** P1 Commerce Core (MVP) · **Unit:** SUB-PR 1.6.
> **Scope (verbatim):** *"Durable job (Inngest/Vercel Queues) that stamps the per-order PDF (pdf-lib/qpdf), writes the artifact to R2, sets `entitlement.ready`, and sends the ready email (ADR-3, §9)."*
> **Date:** 2026-05-29 · **Status:** ✅ Complete — verification gate green; SSG invariant preserved.
> **Roadmap references consulted:** §9 (fulfillment pipeline), §10 (schema), §11 (PII / signed-URL discipline), ADR-3.
> **Queue committed:** **Inngest** (`inngest@4.5.0`). **Stamping:** `pdf-lib`.

---

## 1. What was accomplished

| Deliverable | Result |
|---|---|
| Dependencies | `inngest@4.5.0` + `pdf-lib` installed. |
| Inngest client | `src/lib/inngest/client.ts` — lazy client + canonical event contract (`FULFILLMENT_EVENT` + `FulfillmentTransactionCompletedData`). |
| Inngest endpoint | `src/app/api/inngest/route.ts` — Node-runtime `serve()` exposing `processFulfillment`. |
| Watermark worker | `src/inngest/functions/watermark.ts` — fan-out via `step.run("watermark-<bookId>", …)` per book, two-layer idempotency, PDF stamping, R2 upload, DB update, email placeholder. |
| Fulfillment wiring | `src/lib/fulfillment.ts` — replaced the SUB-PR 1.5 audit-only placeholder with a real `inngest.send(FULFILLMENT_EVENT, …)` (and keeps the audit log entry as defense-in-depth when the send itself fails). |
| Webhook handler | `src/app/api/webhooks/paddle/route.ts` — now also extracts `customer.name` so the watermark can credit a real human. |
| Verification | lint · tsc · build — all green; `/api/inngest` is `ƒ Dynamic`; every catalog classification unchanged. |

---

## 2. The job flow, end to end

```
Paddle webhook (/api/webhooks/paddle)
  │
  ▼  signature-verified, transaction.completed
processCompletedTransaction()                          // src/lib/fulfillment.ts
  │  ▸ upsert local user (idempotent on email)
  │  ▸ db.transaction:
  │       INSERT order  ON CONFLICT (mor_order_ref) DO NOTHING RETURNING id
  │         └─ no rows → idempotent return
  │       INSERT order_items  ×N
  │       INSERT entitlements (pending)  ×N  ON CONFLICT (user, book) DO NOTHING
  │  ▸ inngest.send("fulfillment.transaction.completed", { … })
  │       └─ on failure: log + return (order is already committed; replay later)
  ▼
Inngest                                                 // network ⟶ /api/inngest
  │
  ▼
processFulfillment  inngest.createFunction(             // src/inngest/functions/watermark.ts
  { id, retries: 3, triggers: [{ event: FULFILLMENT_EVENT }] },
  async ({ event, step }) => {
    for (bookId of event.data.bookIds) {
      await step.run(`watermark-${bookId}`, () =>
        watermarkOneBook({ orderId, userId, bookId, buyerName, buyerEmail })
      );
    }
  }
)
  │
  ▼ per book (each step is an independently-checkpointed unit)
watermarkOneBook()
  │  ▸ short-circuit if entitlement is already ready+watermarkedKey  ─┐  ← idempotency layer 2
  │  ▸ getObject(MASTERS_BUCKET, book.masterFileKey)                  │
  │  ▸ stampPdfWithWatermark(masterBytes, "Licensed to … · Order …")  │
  │  ▸ putObject(ARTIFACTS_BUCKET, "<orderId>/<bookId>.pdf", bytes)   │
  │  ▸ db.update(entitlements) → status=ready, watermarkedKey=…       │
  └─ ▸ sendReadyEmailPlaceholder()  // SUB-PR-future swap → Resend     ┘
```

`/api/inngest` is the dispatch surface — Inngest Cloud POSTs to it; the handler in turn invokes the registered function. The function's body never runs on the request thread (it runs in Inngest's runtime); each `step.run` is a separate dispatched execution that can retry independently.

---

## 3. PDF watermarking with `pdf-lib`

```ts
const pdfDoc = await PDFDocument.load(masterBytes);
const font = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

for (const page of pdfDoc.getPages()) {
  page.drawText(watermarkText, {
    x: 36, y: 18,             // bottom-left margin, ~0.25in from edge
    size: 8, font,
    color: rgb(0.4, 0.4, 0.4),
    opacity: 0.7,
  });
}

// Forensic XMP metadata — invisible to readers, queryable by tooling.
pdfDoc.setSubject(watermarkText);
pdfDoc.setProducer("Digital Bookstore");
pdfDoc.setKeywords([`orderId:${orderId}`, `bookId:${bookId}`]);
```

**Watermark text format** (Roadmap §11 PII discipline):
> `Licensed to <buyerName> · Order <8-char-prefix> · Digital Bookstore`

- **Name and order-ID, not raw email.** Email maps back to the order server-side. If an artifact leaks, we can trace the buyer without their email being visible in the file.
- **8-char order prefix** is enough for human-readable lookup (UUIDs collide-resistant well below 8 chars in our volume) and keeps the footer line short.
- **`reader` fallback** for missing names — no awkward `"Licensed to null"` strings.
- **`.slice(0, 80)` on the name** — prevents a degenerate Paddle customer name from blowing out the footer line.

**Memory profile.** `pdf-lib` loads the full PDF into memory and rebuilds it on `.save()`. Peak usage ≈ 2-3× the source size while processing — fine for the assumed 1–50 MB range (assumption A6), well under Vercel Functions' memory limits. The function uses `Uint8Array` for the master and `Buffer.from(...)` only at the R2 upload boundary (one allocation). For >100 MB books we would switch to a streaming pipeline (chunked reads, page-by-page rewrite) — out of scope for SUB-PR 1.6.

---

## 4. Idempotency — three layers, intentionally

The pipeline is now safe under any combination of:
- Paddle retrying the webhook on a 5xx,
- Inngest retrying the function on a thrown step,
- An operator manually replaying a dropped event,
- Two webhook handlers racing each other.

| Layer | Mechanism | What it prevents |
|---|---|---|
| **1. Order create** | `INSERT … ON CONFLICT (mor_order_ref) DO NOTHING RETURNING id` (Roadmap §10 UNIQUE) | Double-fulfillment of the same Paddle transaction. The DB itself is the lock. |
| **2. Inngest step checkpoint** | `step.run(\`watermark-${bookId}\`, …)` — Inngest persists the per-step result and skips completed steps on retry. | Re-stamping book #1 when the retry is caused by a failure in book #2. |
| **3. DB-state short-circuit** | First action inside `watermarkOneBook` checks `entitlement.status === "ready" && watermarkedKey` and returns early. | A *fresh* event (e.g., manual replay from a different trigger) producing a redundant R2 write — Layer 2 can't catch this because the step name is different. |

Even with all three layers, R2 `putObject` would itself be idempotent (overwrite same key → same bytes). The layers are pure cost-saves: each one short-circuits a more expensive path higher up.

---

## 5. v4 API quirks that surfaced (and how they were resolved)

The installed `inngest@4.5.0` differs from the v3 docs that most online examples reference:

| What changed | What I did |
|---|---|
| `EventSchemas` is no longer exported. | Dropped the v3 schemas pattern. Replaced with a single shared TS contract — `FULFILLMENT_EVENT` + `FulfillmentTransactionCompletedData` — colocated in `src/lib/inngest/client.ts`. The producer uses `satisfies` at the call site; the consumer casts `event.data` through the same interface. Same end-to-end safety, different mechanism. (A future SUB-PR can layer Zod / StandardSchema-based runtime validation if/when payloads need server-enforced shape.) |
| `inngest.createFunction(opts, trigger, handler)` → `inngest.createFunction(opts, handler)` — 3 args collapsed to 2; triggers moved inside `opts` as an array. | Single Edit on the function call site. The body is unchanged. |

Both errors were caught by `tsc --noEmit` on the first verification cycle — fixed in one revision; the second cycle ran clean.

---

## 6. Build-resilience under unprovisioned env

The graceful-degradation discipline established in SUB-PRs 1.4 and the root-layout fix continues here:

- `new Inngest({ id })` does no network at construction — module import is safe with `INNGEST_EVENT_KEY` unset.
- `inngest.send(...)` is wrapped in try/catch in `processCompletedTransaction`; if it throws (e.g., env missing in dev), **the order is already committed** in Postgres. The audit log records a clear `ENQUEUE FAILED — replay this event manually…` entry, so no fulfillment is silently lost.
- The Inngest function file imports `db`, `storage`, `pdf-lib`, and `inngest` — none of those throw at import time even without env. Build/tsc both pass with zero credentials in scope (the build log confirms: catalog `safeQuery` warnings, no Inngest-related crash).

---

## 7. Verification (this run)

| Check | Command | Result |
|---|---|---|
| Lint | `npm run lint` | ✅ Pass — zero warnings |
| Typecheck | `npx tsc --noEmit` | ✅ Pass *(after one cycle: replaced v3 `EventSchemas` import with a v4-correct local TS contract, and collapsed the 3-arg `createFunction` call to the new 2-arg shape)* |
| Build | `npm run build` | ✅ Pass — `/api/inngest` is `ƒ Dynamic`; every other route classification unchanged |

Final route table (only new entry is `/api/inngest`):

```
┌ ○ /
├ ƒ /admin
├ ƒ /api/cart/count
├ ƒ /api/inngest              ← new — Inngest serve() endpoint
├ ƒ /api/webhooks/paddle
├ ● /authors/[slug]
├ ○ /books         1h    1y
├ ● /books/[slug]
├ ƒ /cart
├ ● /categories/[slug]
└ ƒ /search
```

`safeQuery` warnings continue to appear during the build (DB unprovisioned) — same graceful-empty-states behavior as every prior SUB-PR.

---

## 8. Files created / modified

```
src/lib/inngest/client.ts                         (new — Inngest v4 client + event contract)
src/app/api/inngest/route.ts                      (new — Inngest serve() endpoint, Node runtime)
src/inngest/functions/watermark.ts                (new — processFulfillment + watermarkOneBook + helpers)
src/lib/fulfillment.ts                            (− log placeholder, + inngest.send with try/catch fallback)
src/app/api/webhooks/paddle/route.ts              (+ extract customer.name alongside customer.email)
package.json                                      (+ inngest, + pdf-lib)
package-lock.json                                 (updated)
sub-pr-report/SUB_PR_1.6_REPORT.md                (new — this report)
```

---

## 9. Decisions / deviations worth surfacing

1. **Sequential `step.run` per book**, not `Promise.all(step.run(...))`. Per-book stamping is the bottleneck; parallel would briefly multiply memory by N (where N = items in the order). Sequential keeps peak memory bounded to one book at a time. Parallelism can land in a follow-up once memory profiles are observed.
2. **Three idempotency layers** (DB UNIQUE → Inngest step name → DB-state short-circuit). Each is cheap; each catches a different replay scenario. Worth the explicit redundancy because "paid customer, no book" is the worst possible failure for a trust-first brand.
3. **`step.run("watermark-<bookId>", …)`** — stable, content-addressable step name. Even if event payloads are reshuffled, the same `bookId` deduplicates correctly across retries.
4. **Watermark text uses 8-char order prefix** + name, no email. Email never leaves the database; the order ID is enough for human-readable trace.
5. **Forensic XMP metadata** in addition to the visible footer — invisible to casual readers, recoverable with any PDF inspector (`pdfinfo`, Acrobat's Document Properties). Belt-and-braces against someone who crops the footer.
6. **Inngest send failure is logged, never thrown.** The order is already committed in Postgres; raising would mark the Paddle webhook as failed and trigger Paddle's retry, which would then no-op on the order INSERT (good!) but never re-trigger Inngest. The audit-log entry is the canonical "this event needs replay" record.
7. **`runtime = "nodejs"` on `/api/inngest`** — pdf-lib is Node-friendly, Drizzle transactions need WebSocket pool. Edge runtime would not support either.
8. **`buyerName` falls back to `"reader"`** — never `"null"` or `"undefined"` strings in the footer. Tiny, but the kind of thing customers screenshot.

---

## 10. Definition-of-done vs. SUB-PR 1.6 scope

- [x] `inngest` and `pdf-lib` installed.
- [x] Inngest client at `src/lib/inngest/client.ts` (v4-correct).
- [x] Inngest endpoint at `src/app/api/inngest/route.ts` (Node runtime, `serve(...)`).
- [x] `processFulfillment` worker at `src/inngest/functions/watermark.ts` following the §9 pipeline:
  - [x] Fetch master from R2 `MASTERS_BUCKET` (via `getObject`).
  - [x] Stamp buyer name + order id with `pdf-lib` (Social DRM, ADR-3, §11 PII discipline).
  - [x] Write artifact to R2 `ARTIFACTS_BUCKET` (via `putObject`).
  - [x] Update DB: `entitlement.status = "ready"`, `watermarked_key = …`.
  - [x] Email placeholder (`sendReadyEmailPlaceholder` — `console.log` for now).
- [x] Replaced `appendFulfillmentLogEntry` placeholder in `fulfillment.ts` with `inngest.send(FULFILLMENT_EVENT, …)`; audit log retained as fallback on send failure.
- [x] Local verification — lint, tsc, build — all green; SSG invariant preserved.
- [x] Pipeline is idempotent if a job fails and retries (§4 — three layers).

**Out of scope (correctly deferred):**
- Real transactional email (Resend / Postmark) — the placeholder is the single swap-point.
- Parallel per-book stamping inside the same order — sequential is the right default until memory profiles call for it.
- Streaming PDF pipeline for very large books — needs >100 MB titles to be worth the complexity.
- Inngest dashboard / dev-server setup instructions — operator concern; placeholder env vars are already in `.env.example`.

---

## 11. Next unit (NOT started — awaiting approval)

**SUB-PR 1.7 — Signed-URL download + Library + fulfillment-status UX.** The user-facing closing piece of the M1 milestone: library page (`/account/library`), per-entitlement re-download via fresh short-TTL signed URLs (the `generateSignedDownloadUrl` from SUB-PR 0.4 fires here), and the "preparing your copy" optimistic UX on the order-confirmation page. Execution is **halted pending your explicit approval.**
