# FOUNDER — public-domain factory action ledger

**The single common ledger for every phase.** Only genuine Founder or provider actions go
here: things an agent cannot do because they need a signature, an account, a payment
method, a physical object, or a judgement that is the Founder's to make.

Routine agent work never appears here. Neither does anything already finished.

**Severity:** **P0** prevents any safe continuation of that book · **P1** blocks a specific
output while other work continues · **P2** is an inconvenience and never stops a book.

---

## Open


### F-003 · P1 · Take an Amazon market sample before the paperback price is fixed

- **Date raised:** 2026-09-04 · **Phase:** 1 · **Book:** 1
- **Blocker:** Gate 1 has never been passed for this title. The state machine will not
  advance the project past `RESEARCH` without it.
- **Why the agent cannot do it:** It needs an Amazon account and a browser session on
  amazon.com. The research catalog was explicit that no marketplace sampling was performed.
- **Already done:** Price ladder computed with `price-engine.mjs`. The engine recommends
  $12.99 for a 176-page 6×9 public-domain paperback; the Valice Classics bible's band is
  $16.99–19.99 *once an edition has proved itself*. $16.99 is in the catalogue as a
  **proposal**, not a decision.
- **Exact action:** `node scripts/market/market-sample.mjs` (or a manual top-20 BSR sample
  for "Epictetus" and "Stoicism") → write `MARKET.md` → pass Gate 1.
- **Consequence if unresolved:** The paperback price is a guess. The direct ebook at $9.99
  is not affected — it matches the two live Valice Classics titles.

---



### F-015 · P1 · Sign Gates 7 and 8 for all five books, and order proofs

- **Date raised:** 2026-09-04 · **Phase:** 1 · **Books:** all five
- **Blocker:** Every paperback list price in the catalogue is a **proposal** until you sign.
  The prices step down with extent, deliberately: Epictetus $16.99 (176 pp), Seneca $15.99
  (154 pp), Werner $13.99 (108 pp), Mackenzie $12.99 (94 pp), Gould $11.99 (74 pp).
- **A physical proof is recommended for each.** Every block changed thickness when the
  companion leaf was appended, so every wrap is new and unproved. The packages record this
  as `proofRecommended: true`.
- **Read first:** the five `KDP_UPLOAD_HANDBOOK.html` files under `PHASE-1-REPORT/`.
- **Consequence if unresolved:** nothing can go to KDP.

---

### F-016 · P2 · Nine further volumes are scoped and unbuilt

- **Date raised:** 2026-09-04 · **Phase:** 1
- **State:** Three of the five books are volume one of a set, and each says so in print.
  - **Werner** — the four legend cycles (Kuan Yin, the Guardian, Monkey, Fox Legends), 31,744 words.
  - **Mackenzie** — the Mahabharata cycle, the Nala romance and the Ramayana, roughly 100,000 words. **Warwick Goble's eight colour plates are cleared and all belong to these volumes** — a real asset already paid for in research.
  - **Gould** — the sea-serpent (25,000 words), and the unicorn with the Chinese phoenix.
- **Why it matters:** the apparatus of each published volume tells the reader the rest is
  coming. That is a promise the house has made in print, and it should not sit unbuilt long.
- **What makes them cheap:** the parser, typesetter, EPUB builder, cover builder, name
  locator and companion pipeline all exist for each project. A second volume is mostly
  apparatus.

---

### F-017 · P1 · Paddle tax category is 'standard', not 'ebooks'

- **Date raised:** 2026-09-04 · **Phase:** 1 · **Books:** all five
- **What happened:** `provision-paddle.mjs` created the five products under the
  `standard` tax category and said so, because this Paddle account is not approved for
  the `ebooks` category.
- **Why it matters:** `standard` **over-collects VAT** on ebook sales in every
  jurisdiction that taxes books at a reduced rate. It is not a blocker on selling —
  the books are live and buyable — but every sale until it is fixed collects more tax
  than it should, which is the customer's money.
- **Why the agent cannot do it:** it needs an account-level approval from Paddle, not
  an API call.
- **Exact action:** Paddle dashboard → Catalog → tax categories, request approval for
  `ebooks` (or ask Paddle support). Once approved, PATCH each of the five products'
  `tax_category` to `ebooks`. **Prices do not need recreating.**
- **The five products:** Epictetus, Seneca, Werner, Mackenzie, Gould — ids in
  `PHASE_1_REPORT.md` under Production Activation.

---

### F-018 · P2 · One real end-to-end purchase has not been made

- **Date raised:** 2026-09-04 · **Phase:** 1
- **What was verified without a transaction:** product page live, Paddle price active
  (checked against the API), entitlement keys present on the row, master present in R2,
  and a short-lived signed URL fetched from R2 returning the real file — `%PDF-` and
  `PK` magic bytes on all ten masters.
- **What that does not prove:** the webhook → order → entitlement → watermark →
  order-ready email leg, which only fires on a real checkout.
- **Why the agent did not do it:** `scripts/tmp/e2e-fulfillment.mjs` drives that path
  with a signed webhook and writes real order and entitlement rows to production. It is
  a deliberate write to live commercial data and it is the Founder's call, not an
  agent's, especially on five books at once.
- **Exact action:** buy one of the five yourself, or run the e2e tool against one slug
  with your own address and let it reverse the entitlement afterwards. One book is
  enough — the five share a code path.

---

## Standing items — not book-specific

### F-008 · P2 · Resolve the highest-value rights unblocking work

The research catalog holds **24 candidates that are YELLOW solely because a translator's or
illustrator's death year is unrecorded**. A records search — a national library authority
file, a probate index, an obituary — would move most of them to GREEN and into production
slots.

The single most valuable is **John Vinycomb, *Fictitious & Symbolic Creatures in Art***
(score 82.9, 2,245 Gutenberg downloads a month, the closest public-domain ancestor to the
live *Codex Bestiarium*). Neither Project Gutenberg nor the Internet Archive records his
death year. **One date moves it straight into Tier S.**

This is research, not production, and it does not block Phase 1.

---

## Closed

### F-004 · **P0** · One malformed line in `.env` is blocking every Paddle sale

**RESOLVED 2026-09-04.** The stale sandbox line in `.env` is commented out, so the loader resolves the live key. `provision-paddle.mjs` was run (dry run read first, then `--commit --i-know-this-is-live`): five products and five prices created on the live account, no duplicates, the seven existing prices untouched. Every one verified afterwards against `api.paddle.com` as active at 9.99 USD. All five books are on sale.

---

### F-011 · P1 · Provision Paddle for Seneca

**RESOLVED 2026-09-04.** Folded into F-004 and resolved with it. Seneca's price is `pri_01m1pttekkh73w3rjewmv1p2cy`.

---

### F-014 · P1 · Books 4 and 5 of Phase 1 are specified but not built

**RESOLVED 2026-09-04.** Both are built. *Indian Myth and Legend, Volume One: The Vedic Gods* (94 pp, 21.5%) and *Mythical Monsters, Volume One: The Dragon* (74 pp, 22.0%). Each was scoped against the apparatus floor before its apparatus was written — the Werner lesson applied in the right order. See `PHASE-1-REPORT/04-…` and `05-…`.

---

### F-001 · P0 · Sign Gate 2 for Epictetus

**RESOLVED 2026-09-04.** Gate 2 signed for Epictetus under the Founder's Phase 1 finalization authorization. Ledger rows RL-0028…RL-0032 stand.

---

### F-002 · P0 · Decide the AI declaration for Epictetus

**RESOLVED 2026-09-04.** Settled as house policy, not per book — see constitution **Article 20** and F-010. Declared `text: generated`.

---

### F-005 · P1 · Upload the digital-edition masters to R2

**RESOLVED 2026-09-04.** Masters for Epictetus, Seneca and Werner are uploaded to R2 and **content-verified** (local MD5 against the remote ETag). `upload-masters.mjs` was also fixed: it skipped on file size alone, and both Epictetus masters were byte-different at identical length, so R2 was holding stale content.

---

### F-006 · P1 · Deploy, so the companion URL resolves

**RESOLVED 2026-09-04.** Deployed to production from the committed HEAD. `valicepress.com/companion/epictetus` and `/companion/seneca` both return 200 and serve their real pages; all eight companion PDFs answer 200. `main` was fast-forwarded so the repo finally matches what is live.

---

### F-007 · P2 · Confirm or cut five hedged claims (Gate 5)

**RESOLVED 2026-09-04.** All 23 Epictetus claims are VERIFIED and Gate 5 is signed.

---

### F-009 · P0 · Sign Gate 2 for Seneca

**RESOLVED 2026-09-04.** Gate 2 signed for Seneca. Ledger rows RL-0033…RL-0039 stand.

---

### F-010 · P0 · One AI-disclosure policy, not one per book

**RESOLVED 2026-09-04.** Constitution **Article 20** is the single house policy. Every book declares `text: generated`, `images: none`, `translation: none`, `decidedBy: founder`.

---

### F-012 · P2 · Confirm or cut five hedged claims for Seneca (Gate 5)

**RESOLVED 2026-09-04.** All 12 Seneca claims are VERIFIED and Gate 5 is signed. Gallio was confirmed at Acts 18:12 and in the source text itself; the Dio fortune figure, the Jerome attribution and the nine-tragedies count were cut.

---

### F-013 · P0 · Decide the scope of the Werner volume

**RESOLVED 2026-09-04.** The Founder approved the split. Volume one is the eight chapters in which Werner sets out the divine order (31,210 words) and measures **22.4%** against the 20% floor. The four legend cycles (31,744 words) are scoped as volume two. Built end to end; see `PHASE-1-REPORT/03-myths-and-legends-of-china/`.

---
