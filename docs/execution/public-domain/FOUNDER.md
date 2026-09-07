# FOUNDER — public-domain factory action ledger

**The single common ledger for every phase.** Only genuine Founder or provider actions go
here: things an agent cannot do because they need a signature, an account, a payment
method, a physical object, or a judgement that is the Founder's to make.

Routine agent work never appears here. Neither does anything already finished.

**Severity:** **P0** prevents any safe continuation of that book · **P1** blocks a specific
output while other work continues · **P2** is an inconvenience and never stops a book.

---

## Open

### F-031 · P2 · Two cover decisions for Kwaidan that are yours, not the factory's

Both are recorded in `project_config.json → covers` and neither blocks anything; they are
here because COVER_STANDARDS makes them Founder decisions and the factory should not make
them by drifting.

1. **The series idiom.** §1 gives Valice Classics as *"emerald/black, Noto Serif Display,
   typographic + one fine engraved device"*, and Article 11 adds that the typographic cover
   is the identity rather than a fallback. This cover keeps the emerald/black and the Noto
   Serif Display, and sets every word in the layout — but where the engraved device would
   be, there is a full-bleed painted night scene. Phases 1 and 2 already moved the series to
   pictorial covers using your own supplied artwork, so this follows them rather than
   breaking new ground; §2.6 still says a series identity is yours to approve.
2. **The 25% title rule.** §2.1 asks for a title band of at least a quarter of the cover
   height. Measured: **23.7%**. KWAIDAN is one word and cannot fill a quarter of a cover the
   way two stacked lines do, and stacking it would print KWAI over DAN. The rule's purpose —
   legibility at thumbnail size — is measured separately and the 150 px contrast is **1.0**,
   the best of any cover this press has made. Recorded as a shortfall rather than closed by
   making the cover worse.

Either waive them on the record or say what you would rather have.

---


### F-028 · RESOLVED 2026-09-06 · The six missing Paddle products now exist

**This closes F-019, F-022, F-024, F-026 and F-027.** Three sessions had stopped at the
same place: the command that writes to the live Paddle account was refused by the sandbox,
so five Phase 2 ebooks and then Kwaidan sat priced and ready with no product to sell.

They were created on 2026-09-06 against the live account, using
`scripts/tmp/.env.production`, and read back in a fresh dry run with no `WOULD CREATE`
remaining anywhere in the catalogue:

| slug | product | price | list |
|---|---|---|---|
| `games-ancient-and-oriental` | `pro_01m1v4n63z30ewtsyrya8jxfgf` | `pri_01m1v4n69wd2th3pf1cbw8an3n` | $7.99 |
| `korean-games` | `pro_01m1v4n6rxp0cgvszpwc56xran` | `pri_01m1v4n6zery50yws32dpspqve` | $8.99 |
| `kwaidan` | `pro_01m1v4n7tthzcxjvp08fzkkt5t` | `pri_01m1v4n80k6g2tba6wt8882ehf` | $8.99 |
| `traditional-games` | `pro_01m1v4n8ep1s4j1ec94gerfxbh` | `pri_01m1v4n8mdw8dnnsdc2bqwf56d` | $9.99 |
| `chess-and-playing-cards` | `pro_01m1v4n932w8vmtb1g8ctj733d` | `pri_01m1v4n991k3h8x20sbwp9455z` | $7.99 |
| `mancala` | `pro_01m1v4n9rnkms9qgj604v00s77` | `pri_01m1v4n9ygd9z3vbgstcjbmvt0` | $4.99 |

**What is still yours to do, and it is small.** Only Kwaidan's catalogue row carries its
price id on this branch. **The five Phase 2 rows on `main` still say
`paddlePriceId: null` and `directSaleBlockedBy: "paddle-not-provisioned"`, and they are
now wrong** — the products exist. Phase 3 is not merged and must not be, so this branch
deliberately left those five rows exactly as Phase 2 left them rather than editing another
phase's data from here. On `main`, for each of the five: paste the price id above, set
`directSaleBlockedBy: null`, set the ebook format's `availability` to `"available"`, set
`websiteStatus` to `"published"`, then

```
node scripts/catalog/load-catalog.mjs --commit    # confirm it targets neondb, not bookstore
```

That is the last thing between those five books and being on sale.

---

### F-029 · P1 · Paddle tax category for the six new products

**Extends F-017 to six more products.** All six were created as `standard` because this
Paddle account is not approved for the `ebooks` tax category. The script says so on every
run. `standard` over-collects VAT on ebook sales in jurisdictions that tax books at a
reduced rate.

Request approval in Paddle (Catalog → tax categories, or Paddle support), then PATCH each
product's `tax_category` to `ebooks`. **Prices do not need recreating.** Nothing is broken
until then; buyers in reduced-rate jurisdictions are simply charged too much VAT.

---

### F-030 · P2 · Gate 2 signature for Kwaidan

`PHASE-3-BOOK/01-KWAIDAN/RIGHTS.md` sets out four layers and is prepared for signature.
Two of them are decisions only you can ratify, and both go against the roadmap's
expectation, so neither should be signed without reading the reasoning:

1. **The two plates ARE printed.** The roadmap says Kwaidan's plates "remain unattributed
   and are designed out". That is true of the source file, which labels them only
   `[Illustration]`. It is not true of the artist: Wikipedia's article on the book names
   Takeuchi Keishū and Wikidata Q11545824 dates him — born 13 November 1861, died 3 January
   of 1942 **or** 1943. On either date life-plus-seventy expired more than a decade ago,
   and the 1904 United States imprint settles the US independently. The edition reproduces
   both plates at their true 300 DPI size, about three inches across.
2. **The 1904 introduction is NOT printed.** The first edition's prefatory matter is two
   pieces, not one. Hearn's own note, 154 words signed "L. H." and dated Tōkyō, 20 January
   1904, is printed. A second piece of 677 words dated March 1904 — about the Russo-Japanese
   war, quoting Paul Elmer More — is **unsigned in the source and named in no authority
   record**, so no death year and therefore no rights position could be established. It is
   omitted, and the Source Note says so on the page.

---



### F-025 · P1 · Six account-holder actions for Codex Mythologica: The Puzzle Book

- **Date raised:** 2026-09-05 · **Phase:** roadmap book 4 · **Branch:**
  `feature/public-domain-phase-2`, not merged
- **Blocker:** production is complete and verified — both interiors and both wraps
  preflight clean at 156 pp, EPUBCheck 0/0/0, 100/100 puzzles independently solved,
  542/542 premises re-read, the live Paddle price created and the R2 masters read back
  byte-identical. Everything that remains needs a person, an account or a physical object.
- **Why the agent cannot do them:**

  1. **KDP upload, paperback then hardcover.** Four files, all preflight clean.
     `KDP/KDP_UPLOAD_GUIDE.html` carries a complete section per format with every field,
     every filename, every measured dimension, every sha256, and the files *not* to
     upload. Uploading needs the KDP account.
  2. **The AI declaration.** Text **generated** and images **generated**, both recorded
     with their evidence in `project_config.json → compliance.aiDisclosure`. The
     declaration is made on a person's KDP form; `compliance-lint` fails on exactly that
     one line (`decidedBy=founder`) and should, because recording it from inside the
     factory would be forging it.
  3. **Gate 2 signature** on six assessed-clean rights rows, RL-0068 … RL-0073 — two own
     works, one generated illustration, three open-licence faces. `rights-lint` is clean;
     a row goes GREEN when the account holder signs it.
  4. **Paddle `ebooks` tax category.** The product was created as `standard` because this
     account is not approved for `ebooks`, which over-collects VAT where books are
     zero- or reduced-rated. Same pending request as seven other books.
  5. **ISBNs.** None assigned; each format needs its own. The copyright page prints
     PENDING.
  6. **Proof copies of both print formats.** The hardcover's case wrap folds around board
     and that fold is not visible on any screen.

- **The action:** work down the handbook, then sign gates 2 and 5.
- **Not blocking the ebook.** The direct ebook is live on a live Paddle price and reaches
  buyers when this branch is deployed; items 1, 5 and 6 are print-only.

---


### F-021 · P1 · Deploy, so Falkener's companion URL resolves before the book ships

- **Date raised:** 2026-09-05 · **Phase:** 2 · **Book:** 1
- **Blocker:** `valicepress.com/companion/games-ancient-and-oriental` and its four PDFs
  return **404**. `validate-catalog --env .env` reports them as five errors, correctly:
  the address is **printed inside the book**, on page 78, and encoded in a QR code, so a
  reader who scans it before the deploy gets nothing. This is the same dependency F-006
  answered for Phase 1, and it is open again because Phase 2 has not been deployed.
- **Why the agent cannot do it:** deploying is a production write, and this branch must
  not be merged or deployed without explicit instruction. The page and its assets are
  built, tracked and correct — `npm run build` renders 73 static pages including
  `/companion/games-ancient-and-oriental`, and the four PDFs are sha256-identical to the
  book's own `ASSETS/companion/`.
- **The action:** when Phase 2 is approved for merge, deploy, then re-run
  `node scripts/catalog/validate-catalog.mjs --env .env` and confirm 74 pass · 0 error.
- **Not a reason to hold the ebook.** The companion is free material with no sign-up; the
  404 blocks the *printed* edition, which is not on KDP yet either (see the handbook).

---

### F-020 · P1 · Sign gates 2 and 5 for Falkener

- **Date raised:** 2026-09-05 · **Phase:** 2 · **Book:** 1
- **Blocker:** gates 2 (rights) and 5 (facts) are never-skip gates that require a person's
  signature. `kill_gate.py --level release` refuses the book until they carry one, which is
  correct. Recording them as passed from inside the factory would be forging the signature.
- **Why the agent cannot do it:** it is a signature, not a check. Both checks are done.
- **Already done — gate 2:** `rights-lint` clean over 60 ledger rows. RL-0017 is GREEN and
  was founder-approved on 2026-09-02 for the work itself. Falkener died 17 December 1896
  and Samuel Birch on 27 December 1885, both verified against the National Archives
  authority record and the DNB. None of the 1892 engravings is reproduced: they are
  unsigned, the 1892 line figures are unsigned and no draughtsman is named for them; the colophon credits the photographic plates to Owen Williams, photographer, of Laugharne, whose dates are not recoverable, so there is no death year to clear them
  against — the same finding that removed Werner's plates in Phase 1. Every figure is drawn
  for this edition from the descriptions in the text.
- **Already done — gate 5:** twelve claims registered in `CLAIMS.jsonl`, every one VERIFIED
  against an external source, `claim-lint` clean. **The verification pass found and
  corrected two errors before they shipped:** the imprint gave Falkener's death as 1908
  when the ledger and every authority say 1896; and the introduction said Birch became
  Keeper of Oriental Antiquities *after* the 1864 letter, when the DNB shows he had held
  the keepership since the department was divided in 1861. The chronology was also widened
  where it was too narrow (mehen) and dated where it was vague (Hatshepsut, and the
  Manchester show, which is the Royal Jubilee Exhibition of 3 May 1887).
- **The action:** read `CLAIMS.jsonl` and `RIGHTS.md`, then set gates 2 and 5 in
  `gates.json` to `status: "passed"`, `approvedBy: "founder"`, as was done for Epictetus on
  2026-09-04.

---

### F-019 · P1 · Create the Paddle product for Falkener (one command)

- **Date raised:** 2026-09-05 · **Phase:** 2 · **Book:** 1
- **Blocker:** `games-ancient-and-oriental` is built, priced, uploaded to R2 and validated,
  but it has no Paddle product or price, so it cannot be sold. Everything else is done.
- **Why the agent cannot do it:** the live write is refused by this environment's
  permission layer. The dry run passes and shows exactly one product to create; the
  `--commit --i-know-this-is-live` run is blocked. Routing around that block — copying the
  key elsewhere, calling the API directly — would defeat the control, so it was not done.
- **Already done:** `scripts/catalog/paddle-products.mjs` carries the entry at $7.99 with
  its price basis. The dry run reports `games-ancient-and-oriental product=WOULD CREATE
  price=WOULD CREATE $7.99`, and every other book resolves to its existing ids, so the
  run will create one product and touch nothing else. The masters are in R2 and
  content-verified. The catalogue entry holds the ebook at `coming_soon` with
  `directSaleBlockedBy: "paddle-not-provisioned"`, because a buy button with no price
  behind it is a lie.
- **The action:**

  ```
  node scripts/catalog/provision-paddle.mjs --commit --i-know-this-is-live
  ```

  Then paste the new `pri_…` into the book's `paddlePriceId` in
  `scripts/catalog/valice-catalog.mjs`, set the ebook format to `availability: "available"`,
  set `directSaleBlockedBy: null`, set `websiteStatus: "published"`, and run
  `load-catalog.mjs` against **`neondb`** — not the `bookstore` database the local env
  files point at. See `docs/execution/public-domain/PHASE-2-REPORT`.
- **Still open:** F-017 applies here too — Paddle will create this product under the
  `standard` tax category, which over-collects VAT on an ebook.

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

### F-024 · P1 · Paddle product and gates 2 and 5 for Chess and Playing Cards

- **Date raised:** 2026-09-05 · **Phase:** 2 · **Book:** 3
- **Paddle.** `chess-and-playing-cards` is built, priced at **$7.99**, uploaded to R2,
  previewed and validated, and has no Paddle product. Same blocked live write as F-019
  and F-022. `node scripts/catalog/provision-paddle.mjs --commit --i-know-this-is-live`,
  then put the returned price id in the catalogue row, set the ebook to `available`, and
  run the loader **against `neondb`**.
- **Gate 2 (Rights).** Stronger than the two books before it: Culin died in 1929 **and**
  the 1898 United States imprint settles the United States on its own. He was not a
  federal employee, so the government-works rule is not relied on and is not needed. The
  illustration layer is not cleared — several plates are his own reuse of the *Korean
  Games* artwork by Ki San, for whom no death year is recorded — and none of it is
  reproduced.
- **Gate 5 (Factual verification).** 12 claims, every one VERIFIED against an external
  source; `claim-lint` clean. Includes a finding worth your attention: this scan carries a
  per-word confidence score that the previous volume's did not, and it was **measured and
  found unusable** — median 22 on a 0–100 scale, with *and*, *of* and *four* scoring under
  10. Nothing in the edition depends on it.
- **What signing means:** these two gates are `founderSignoff` and only you can set them.

---

### F-027 · P1 · Paddle, KDP and gates 2, 5 and 10 for The Singing Games

- **Date raised:** 2026-09-06 · **Phase:** 2 · **Book:** 5
- **This is the biggest book this press has made**: 244 pages, 43 games, 209 versions of
  the rhymes, and **78 tunes engraved for it from the notes**. It is also the last of the
  five, so Phase 2's five books are now all built.
- **Paddle.** `traditional-games` is built, priced at **$9.99**, uploaded to R2, previewed
  and validated, and has no Paddle product. Same blocked live write as F-019, F-022, F-024
  and F-026, and all five can be done in one run:
  `node scripts/catalog/provision-paddle.mjs --commit --i-know-this-is-live`, then put the
  returned price ids in the catalogue rows, set the ebooks to `available`, and run the
  loader **against `neondb`**.
- **KDP.** The paperback is built and has never been uploaded: interior 244 pp with the
  companion leaf spliced and sealed, wrap at a 0.5495 in spine, handbook at
  `docs/execution/public-domain/PHASE-2-REPORT/05-traditional-games/KDP_UPLOAD_HANDBOOK.html`.
  `kdp: "not_created"` and no ASIN is invented.
- **Gate 2 (Rights) — the cleanest of the five, and the only one with no red row.** Gomme
  died in 1938, so the text is public domain everywhere and has been since 2008; the 1894
  British imprint settles the United States on its own. Two things are worth your eye:
  1. **The tunes.** Gomme's staves are not photographed, traced or reproduced. The MIDI
     files Project Gutenberg's Music Team made from them are read for **pitch and duration
     only**, and every stave in the book is then *drawn* by `BUILD/engrave.py` — 78 tunes,
     94 staves, 836 bars, 3,042 notes. Nothing of the transcribers' own work (page images,
     harmonisation, tempo, instrument) is in the product.
  2. **The illustrator is clear and his drawings are still not used.** J. P. Emslie died
     in 1913, so the figures in the 1894 volumes have been out of copyright since 1983 —
     the opposite of the other four books of this phase, where the illustration layer is
     red because nobody is named. This edition still does not reproduce them, which is a
     decision about scope, and the book says so.
- **Gate 5 (Factual verification).** 15 claims, every one VERIFIED against an external
  source; `claim-lint` clean. The load-bearing one is critical rather than biographical:
  **the survivals doctrine that frames Gomme's conclusions was abandoned in the middle of
  the twentieth century**, and the edition says so in the introduction, in the register and
  in Since 1894 — while arguing, at the same length, that it never touched the quality of
  what she wrote down. `BUILD/check_quotes.py` holds all 31 quoted passages against her
  text on every build.
- **Gate 10 (KDP compliance).** `compliance-lint` clean, linkage included. Text
  **generated**, images **NONE**, translation **none**. The images answer is worth a
  sentence because a reader of the file will see 78 pieces of music in a book that
  declares no images: **they are drawn by a program in this repository from a list of
  pitches**, which is drawing and not generation, and no image model was used or is
  available here.
- **One decision of scope you may want to revisit.** This edition is the *singing* games of
  Gomme's **first** volume — every entry in it that carries a tune. Her Volume II holds 23
  more singing games and 59 more tunes, and the four hundred descriptive games of Volume I
  (hopscotch, marbles, fivestones, tag) are a third book. The scope was fixed before a word
  of apparatus was written and is stated on the product page and in A Note on the Text.
- **What signing means:** gates 2, 5 and 10 are `founderSignoff` and only you can set them.

---

### F-026 · P1 · Paddle product and gates 2, 5 and 10 for Mancala

- **Date raised:** 2026-09-05 · **Phase:** 2 · **Book:** 4
- **Paddle.** `mancala` is built, priced at **$4.99**, uploaded to R2, previewed and
  validated, and has no Paddle product. Same blocked live write as F-019, F-022 and
  F-024, and all four can be done in one run:
  `node scripts/catalog/provision-paddle.mjs --commit --i-know-this-is-live`, then put
  the returned price id in the catalogue row, set the ebook to `available`, and run the
  loader **against `neondb`**.
- **Two decisions in this book you should know about, because they are yours to reverse.**
  1. **EBOOK ONLY.** The volume is 38 pages. A printed block would need a blank leaf to
     stay even and would run to 40, giving a spine of 0.090 in: too thin to carry spine
     text (KDP allows it from 79 pages) and too thin to be a good object. The interior
     and a cover wrap are both built so the arithmetic exists if you want to revisit it;
     both are marked not for use, and nothing is registered in `print-interiors.mjs`.
  2. **PRICED BELOW THE BAND.** $4.99 against the Valice Classics band of $7.99–9.99,
     because at 38 pages this is a quarter the length of the other volumes of the phase.
     It nets $4.24 after Paddle.
- **Gate 2 (Rights).** The simplest position of the four: Culin died in 1929 **and** the
  1896 United States imprint settles the United States on its own. This is the one book
  of the phase with **no scan and no OCR layer** — the source is Project Gutenberg 66220,
  a transcription proof-read by volunteers — so there is no OCR rights row to clear. The
  PG boilerplate is stripped at parse time and the PG trademark is used nowhere. RED on
  the images: all 22 captioned pictures name neither photographer nor draughtsman, and
  none is reproduced.
- **Gate 5 (Factual verification).** 17 claims, every one VERIFIED against an external
  source; `claim-lint` clean. **Three were corrected by the verification rather than
  confirmed by it**, and one of those is worth a minute of your time:
  - the introduction quoted Culin's closing prediction as ending "…when this account may
    acquire a practical value." **He wrote no such thing** — his sentence ends "…when
    this account may answer some inquiries that may be made as to its history." The first
    half was his and the second half was invented. It is now printed as he wrote it, and
    `BUILD/check_quotes.py` holds every quoted passage in the apparatus *and* in the build
    scripts against the source text on every build, so the class of error cannot recur
    silently in this book;
  - the Aksumite mancala boards are dated to the sixth or seventh century, not the
    eighth, and one of the two sites (Matara) is in Eritrea, not Ethiopia;
  - the count of traditional names was called "the standard reference count"; the
    encyclopaedia carries it without a citation and the country figure comes from a
    specialist census, so the sentence now says which number comes from where.
- **Gate 10 (KDP compliance).** `compliance-lint` clean. Text **generated**, images
  **none**, translation **none** — and the text figure matters more here than anywhere
  else in the phase, because the apparatus is **54.8%** of the volume, longer than
  Culin's paper. There is no KDP upload to declare it on and none is planned.
- **What signing means:** gates 2, 5 and 10 are `founderSignoff` and only you can set them.

---

### F-022 · P1 · Create the Paddle product for Korean Games (one command)

- **Date raised:** 2026-09-05 · **Phase:** 2 · **Book:** 2
- **Blocker:** `korean-games` is built, priced, uploaded to R2, previewed and validated,
  but it has no Paddle product or price, so it cannot be sold. Everything else is done.
- **Why the agent cannot do it:** the live write is refused by this environment's
  permission layer, exactly as for F-019. Routing around that block would defeat the
  control, so it was not done.
- **Already done:** `scripts/catalog/paddle-products.mjs` carries the entry at **$8.99**
  with its price basis. The masters are in R2 at `books/korean-games/master/v1/`
  (`master.pdf`, `master.epub`), the catalogue row is written with
  `directSaleBlockedBy: "paddle-not-provisioned"`, and the ebook shows `coming_soon`
  rather than a buy button with no price behind it.
- **The command:**
  `node scripts/catalog/provision-paddle.mjs --commit --i-know-this-is-live`
  Run the dry run first; it should report `korean-games product=WOULD CREATE
  price=WOULD CREATE $8.99` and resolve every other book to its existing ids.
- **Then:** put the returned price id into the catalogue row's `paddlePriceId`, set the
  ebook to `available`, and run `node scripts/catalog/load-catalog.mjs` **against
  `neondb`** — not `bookstore`, which the loader still defaults to.

---

### F-023 · P0 · Sign gates 2 and 5 for Korean Games

- **Date raised:** 2026-09-05 · **Phase:** 2 · **Book:** 2
- **Gate 2 (Rights).** `RIGHTS.md` is complete and `rights-lint` is clean. Culin died in
  1929 and Wilkinson in 1930, so both text layers are public domain everywhere and the
  1895 US imprint settles the United States on its own. The **illustration layer is not
  cleared and none of it is reproduced**: Culin names Ki San — the Korean painter Kim
  Chun-gŭn, whose drawings the Smithsonian holds — and Teotiku Morimoto of Tokyo, and no
  death year is recorded for either, so there is no life-plus-seventy calculation to make.
  Every board in the book is drawn for it from his descriptions.
- **Gate 5 (Factual verification).** 12 claims registered, every one VERIFIED against an
  external source; `claim-lint` clean. The adversarial review found and corrected six
  substantive faults before this was written — see the book report — including a wrong
  McCune–Reischauer form printed in the conversion table the edition advertises, and a
  playing guide that gave kon-tjil the European game's nine men where Culin's own text
  has the players fill all twenty-four points, which is twelve each.
- **What signing means:** these two gates are marked `founderSignoff` in `gates.json` and
  only you can set them. Nothing else in the book is waiting on them.

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

---

### F-033 · P0 · Sign Gate 2 for *The Book of Were-Wolves*

Three rows, and the simplest rights position of the phase: a text of 1865 by an author who
died in 1924, **no illustration layer at all** — the 1865 book has no plates and this edition
invents none — and Baring-Gould's own translations, which are part of the 1865 book and carry
no separate right. Evidence in `PHASE-3-BOOK/03-BOOK-OF-WERE-WOLVES/RIGHTS/RIGHTS.md`.

*(Referenced by that book's report and catalogue row since 2026-09-06; recorded here
2026-09-07, when the gap between reference and record was noticed.)*

---

### F-034 · P1 · Confirm that seven chapters of murder are printed entire

Chapters VI, VII, IX and XI–XV of *The Book of Were-Wolves* describe the killing and
mutilation of children, grave-robbing and cannibalism, at length and in the language of the
trial records Baring-Gould was reading.

They are printed entire, because Article 18 forbids abridging a book to hide what it contains
and because his argument depends on them. What the edition does instead is say plainly, at the
front and in each of the seven head-notes, what is in those chapters, so a reader chooses
knowingly rather than turning a page and meeting it.

**This is the decision to revisit if the Founder wants a different answer.** It is recorded
rather than taken quietly.

---

### F-035 · P0 · Sign Gate 2 for *British Goblins*

Four rights rows, and the first illustration layer of Phase 3 that is actually **used**:
twenty of T. H. Thomas's twenty-one drawings are set. One row is **refused** — the six music
engravings in the Gutenberg file are Lesley Halamek's of 2010, not Sikes's of 1880, and the
airs are named and placed in the apparatus instead. Evidence is in
`PHASE-3-BOOK/04-BRITISH-GOBLINS/RIGHTS/RIGHTS.md`, rows S-1 to S-4.

---

### F-036 · P1 · Confirm the price of a 390-page book

$22.99 paperback and $41.99 hardcover for *British Goblins*, $19.99 and $38.99 for each
Fairy Mythology volume, are `price-engine.mjs`'s own recommendations at the 35% margin target
for those page counts. No book this press has sold is priced anywhere near them. The engine is
not wrong; the question is whether the market is there, and that is a Founder call.

---

### F-037 · P0 · Sign Gate 2 for *The Fairy Mythology* (both volumes)

**Five rights rows — the most of any book in the phase, and one of them refused.**

- S-1 text: Keightley 1789–1872, enlarged edition 1850, reprinted 1892. Clear.
- S-2 the frontispiece: **George Cruikshank, 1792–1878**. Bohn's 1850 issue replaced W. H.
  Brooke's 1828 plates with a new Cruikshank frontispiece. Clear. **Note the honest limit:**
  the plate carries a signature but it is not legible at the resolution of the source scan
  (376 × 600), so the attribution rests on the bibliographic record of the 1850 issue, not on
  reading the signature. Either candidate — Cruikshank d. 1878, Brooke d. 1860 — is long out
  of copyright, so nothing turns on it, but the edition says so rather than implying it read
  the signature.
- S-3 the seven engraved script blocks (Persian and Sanskrit): anonymous, published 1850.
  Clear on publication terms.
- S-4 the Gutenberg transcription of 2012: faithful transcription, no new right.
- **S-5 REFUSED:** the ~150 one-letter images the 2012 transcribers made to stand for insular
  Anglo-Saxon and Gaelic letterforms. Their work, not Keightley's. All 141 in the printed text
  are replaced by their Unicode characters, and the build refuses to run if it meets an image
  it cannot account for.

Evidence: `PHASE-3-BOOK/05-FAIRY-MYTHOLOGY/RIGHTS/RIGHTS.md` and `SOURCE/glyph-map.json`.

---

### F-038 · P1 · The apparatus of both Fairy Mythology volumes is below the 20% floor

Measured, not padded: **12.5%** in Volume I (14,303 words) and **8.7%** in Volume II (10,661).
Every other Valice Classic has cleared 20%.

The Founder's standing instruction is that the floor is a **quality floor and not a
word-count target**, and that where genuine apparatus falls short the measured result is
documented rather than faked. Article 2 forbids filler. What the volumes carry is a head-note
for every one of their fifty-one sections, a Register of Evidence and Inference — with a
fifth column in Volume II that no other book of this phase has needed, *what the author had a
hand in making* — ninety glossary entries, forty-four beings, thirty-three authorities,
twenty-nine editorial notes, nine essays, a tale index and a motif concordance measured across
both volumes.

Reaching 20% would mean writing some 25,000 more words with nothing left to say. **This is the
decision to revisit if the Founder wants the floor held absolutely**; the alternative is to
commission genuinely new scholarly matter rather than to pad.

---

### F-039 · P0 · Five Phase 2 books are complete and provisioned, and still not on sale

*Games Ancient and Oriental*, *Korean Games*, *Traditional Games*, *Chess and Playing Cards*
and *Mancala* are built, priced, their R2 masters uploaded, and — as of a check against
api.paddle.com on 2026-09-07 — **their Paddle products and prices are live**. The blocker text
in the catalogue said the environment prevented the Paddle write; that was true when it was
written and is false now, and has been corrected.

What actually holds all five is **Gate 2 (Rights) and Gate 5 (Facts) — Founder signatures**,
which no agent can give. `status.mjs` shows all five at QA, 2 of 12 gates passed.

The live price ids are recorded in each row's blockers and are deliberately **not** written
into `paddlePriceId`: `valice-catalog.test.ts` forbids a price id on a row whose ebook is not
`available`, and that test is right — a live id on a row that is not for sale fails at the
till rather than at load. Signing the gates and flipping `websiteStatus` is one action; the
ids are ready for it.

---

### F-040 · P1 · Four books shipped with an under-measured apparatus, because the measuring instrument was wrong

`differentiation.py` — the instrument Article 2 is judged by — counted **every string** in a
content file. Two things followed that nobody had looked for:

* each block's `kind` (the word `p`, or `verse`) scored as a word of the book — 552 to 1,489
  per volume;
* a verse block, which carries both a joined `text` for the matchers and its `lines` for the
  typesetter, was counted **twice** — 10,175 words of Keightley's verse in Volume I alone.

All of it landed in the **SOURCE denominator**, so every editor share this phase reported was
**understated**. It failed safe, which is why it survived four books: it never reported a floor
breach that was not real. But the direction of an error stops being safe the moment it is used
to justify a decision, and it was about to be — *"these two volumes are below the floor, record
it"* is exactly that decision.

Corrected and all six volumes re-measured. Every share rose; every book that met the floor
still meets it. Nine regression tests now hold the counter.

**Nothing is asked of the Founder here.** It is recorded because the lesson is not about verse
blocks: *a measuring instrument that errs in the safe direction is still a broken instrument,
and it will be found late, by someone writing the report.*

---

### F-041 · P0 · The Fairy Mythology was printing 3,363 words short, and four checks could not see it

An adversarial review found that both Keightley volumes were **discarding continuation
paragraphs of footnotes** — 61 notes truncated, 19 printing as nothing at all — while Volume I
page 4 told the reader in print that *nothing is abridged*.

The reason no check caught it is worth the Founder's attention, because it generalises:

* the parse report counted footnotes **found** — containers matched to an anchor — and stayed
  at 604 the whole time. **A count of containers is not a count of contents.**
* `coverage.py` compares each section's first and last **prose** paragraph, and a footnote is
  neither;
* `check_quotes.py` reads the apparatus, not the source;
* the word-count reconciliation used the same lossy extractor on both sides, so both sides
  agreed.

Fixed at the parser, with two shapes it had never met — a note whose whole body is a poem, and
one whose body is a two-column table. The build now **refuses to complete** if a note would
reach the page empty, which is what the front matter had been claiming all along. A new
source-claim asserts the **words**, as a floor, with the broken extractor's own figure as its
regression test.

**The ask:** none, but this is the finding to remember when the next book is signed off. Both
volumes' page counts moved — 332 → 336 and 322 → 326 — which sent the covers back to the KDP
calculator.

---

### F-042 · P0 · A fabricated authority reached print in both volumes, and an essay was built on him

*William Hone* was given fourteen citations in Volume I, twenty-six in Volume II, an entry in
both who's-whos, a glossary entry, a row in the Register, an editorial note, a line in the
companion copy, a claim in the ledger marked **VERIFIED**, and **a whole essay** in Volume II —
*England and the Every-Day Book* — whose opening sentence was *"Hone is cited twenty-six times
here — more than Grimm, more than Scott."*

**Keightley never names him.** Not once, in either volume. Neither *Every-Day Book* nor *Table
Book* appears anywhere in the source.

Every other count in the same table was exact against the text — Grimm, Thiele, Chaucer,
Milton, Gervase, Giraldus. This one number was invented and then everything else was built on
top of it. Two further counts in the same tables were also wrong: Walter Scott's (fifteen and
sixteen claimed; the name occurs seven and six times, and not all of them are the same man),
and a book — the *Letters on Demonology and Witchcraft* — that Keightley never cites at all.

All of it is removed, and what is genuinely there was worth having: the English section rests
on **poets rather than collectors**, and on Brand's *Popular Antiquities*, itself a compilation
of earlier print. Three new source-claims now hold the book to the corrected statements.

**The ask:** this is the second phase running in which a confident, specific, checkable number
turned out to be invented — British Goblins had eleven. Both times the same thing was true:
**the number was never held against the text the book actually prints.** `check_source_claims.py`
exists because of the first; it now carries the second's negative claims too. If the Founder
wants one rule enforced above the others at Gate 5, it is this one.
