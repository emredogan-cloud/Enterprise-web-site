# FOUNDER — public-domain factory action ledger

**The single common ledger for every phase.** Only genuine Founder or provider actions go
here: things an agent cannot do because they need a signature, an account, a payment
method, a physical object, or a judgement that is the Founder's to make.

Routine agent work never appears here. Neither does anything already finished.

**Severity:** **P0** prevents any safe continuation of that book · **P1** blocks a specific
output while other work continues · **P2** is an inconvenience and never stops a book.

---

## Open

### F-004 · **P0** · One malformed line in `.env` is blocking every Paddle sale

- **Date raised:** 2026-09-04 (rewritten the same day — the diagnosis changed) · **Phase:** 1 · **Books:** 1, 2, 3
- **This is the single highest-value item in this file. It is a two-line edit and it
  unblocks three finished books.**

**What was reported earlier, and why it was wrong.** Phase 1 recorded that the only Paddle
credential available was a sandbox key returning 403 on every endpoint, and that no price
could therefore be created. That was the observed behaviour and it was reproducible. It was
not the cause.

**What is actually true.** `.env` contains **two** `PADDLE_API_KEY` lines:

```
line 18   PADDLE_API_KEY=pdl_sdbx_…      ← stale sandbox key
line 24   PADDLE_API_KEY =pdl_live_…     ← the live key, with a space before the '='
```

The loader in `provision-paddle.mjs` (and in `upload-masters.mjs`, and in every other
script that reads the file the same way) matches `^([A-Z0-9_]+)=(.*)$` and keeps the
**first** value it can parse. The space on line 24 makes that line unmatchable, so the live
key is skipped entirely and the stale sandbox key on line 18 wins. The script then trusts
the key's own prefix, resolves `SANDBOX`, and calls `sandbox-api.paddle.com` — which
returns 403 because the sandbox key has no permissions.

**The live key works.** Verified read-only on 2026-09-04: `GET https://api.paddle.com/products`
returns **HTTP 200** and lists the three real live products (Dudeney, Meditations, World Myths).

- **Why the agent did not fix it:** editing `.env` is blocked by the tool-permission layer,
  correctly — it is a secrets file. Copying a live key into another file to route around
  that block would defeat the point of the block, so it was not done.
- **Exact action** (two lines, no values change):
  1. In `.env`, comment out **line 18** (the `pdl_sdbx_` key).
  2. On **line 24**, delete the space so it reads `PADDLE_API_KEY=pdl_live_…`.
     Do the same for `PADDLE_ENVIRONMENT =production` on line 27.
- **Then, and only then:**
  ```
  node scripts/catalog/provision-paddle.mjs                                  # dry run — READ IT
  node scripts/catalog/provision-paddle.mjs --commit --i-know-this-is-live
  ```
  Paste each returned `pri_…` into `paddlePriceId` in `scripts/catalog/valice-catalog.mjs`
  for `epictetus-discourses-and-enchiridion`, `seneca-selected-dialogues` and
  `myths-and-legends-of-china`; set each ebook to `available` and each
  `websiteStatus` to `published`; run `npm test` and `npm run validate:catalog`; deploy.
- **Also check, separately:** `.env.local` carries a sandbox key **and**
  `PADDLE_ENVIRONMENT =sandbox`, and Next.js loads `.env.local` over `.env`. If anything in
  the running app reads `PADDLE_API_KEY` at runtime, production may be talking to sandbox.
  Worth confirming before the first real sale.
- **Consequence if unresolved:** three finished books stay `draft`. Nothing is sold.

---

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

### F-011 · P1 · Provision Paddle for Seneca

- **Date raised:** 2026-09-04 · **Phase:** 1 · **Book:** 2
- **Half of this is done.** The digital-edition masters are uploaded to R2 and
  content-verified; `masterFileKey` and `epubFileKey` are real.
- **The remaining half is F-004** and is not Seneca-specific: one malformed `.env` line is
  shadowing the live Paddle key for every book. Fix that first, then provision all three
  slugs in one pass.
- **Consequence if unresolved:** the direct ebook cannot be bought.

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
