# PHASE 1 REPORT — Public-Domain Publishing Factory

**4 September 2026 · Phase 1 · Phases 2–10 LOCKED**

---

## Status in one paragraph

Phase 1 was scoped as five books. **All five are complete builds.** The
roadmap and the constitution are written and in force. Nothing is published yet: all three
books are `websiteStatus: "draft"`, and the reason is now understood precisely — a single
malformed line in `.env` has been shadowing the live Paddle key, so every Paddle call was
going to sandbox and returning 403. The live key works. That finding is FOUNDER **F-004**
and it is a two-line fix that unblocks all three books at once.

339 tests pass, lint and `tsc` are clean, `npm run build` succeeds, the rights ledger passes
on 50 rows, and the site is deployed — the companion URLs printed inside these books resolve
in production today.

---

## 1. What was delivered

| Deliverable | State |
|---|---|
| `PUBLIC_DOMAIN_MASTER_ROADMAP.md` | **Done.** 97 of 144 catalog candidates pass the eligibility gate; 50 assigned to Phases 1–10 at five per phase; 47 held as reserve. |
| `PUBLIC_DOMAIN_PUBLISHING_CONSTITUTION.md` | **Done.** Twenty articles. Article 20 settles the AI disclosure as house policy. |
| **Book 1 — Epictetus: The Discourses and Enchiridion** | **COMPLETE.** 176 pp · apparatus **20.1%** |
| **Book 2 — Seneca: Selected Dialogues** | **COMPLETE.** 154 pp · apparatus **20.0%** |
| **Book 3 — Myths and Legends of China, Vol. One** | **COMPLETE.** 108 pp · apparatus **22.4%** |
| **Book 4 — Indian Myth and Legend, Vol. One** | **COMPLETE.** 94 pp · apparatus **21.5%** |
| **Book 5 — Mythical Monsters, Vol. One** | **COMPLETE.** 74 pp · apparatus **22.0%** |
| `FOUNDER.md` | **Done.** 5 open items, 10 closed, severity-ranked. |
| Per-book reports and KDP handbooks | **Done** for all five books. |
| Production deploy | **Done.** `main` fast-forwarded to the deployed commit after 36 commits of drift. |

---

## 2. The five complete books

| | Epictetus | Seneca | Werner | Mackenzie | Gould |
|---|---|---|---|---|---|
| Valice Classics | 3 | 4 | 5 | 6 | 7 |
| Source | PG 10661 | PG 64576 | PG 15250 | PG 47228 | PG 40972 |
| Creator's death | 1879 | 1918 | 1954 | 1936 | 1893 |
| Source words | 61,343 | 47,858 | 31,716 | 28,117 | 22,570 |
| Editorial matter | 15,381 | 12,026 | 9,133 | 7,705 | 6,371 |
| **Editor share** | **20.1%** | **20.0%** | **22.4%** | **21.5%** | **22.0%** |
| Pages | 176 | 154 | 108 | 94 | 74 |
| EPUB | 0/0/0 | 0/0/0 | 0/0/0 | 0/0/0 | 0/0/0 |
| Claims | 23 — **all verified** | 12 — **all verified** | 30 — **all verified** | 29 — **all verified** | 16 — **all verified** |
| Gates passed | 2, 4, 5, 9 | 2, 4, 5, 9 | 2, 4, 5, 9 | 2, 4, 5, 9 | 2, 4, 5, 9 |
| R2 masters | verified | verified | verified | verified | verified |

**110 claims across five books, every one verified by an actual check** — a quotation
located in the source file by search, a measurement read from the build's own QA output, or
a record fetched and read. None was verified by assertion.

Not one of the five uses an illustration, and none cost anything to produce: no image model
is available in this environment and none was used.

Each of the last three volumes is the first of a set. Werner's four legend cycles,
Mackenzie's three epics and Gould's sea-serpent are scoped, measured and unbuilt, and the
apparatus of each published volume tells the reader they are coming.

## 3. Book 3 was blocked. What actually unblocked it

Werner's twelve narrative chapters measured **13.3%** against a 20% floor. The constitution
forbids padding, so the gap could not be written away.

The Founder approved a split, and the numbers justify it rather than merely permitting it:

| | Chapters | Words | What they are |
|---|---|---|---|
| **Volume one (built)** | III, V–IX, XI, XIII | **31,210** | The divine order: creation, the ministries of the natural world, the Immortals, a war in heaven |
| Volume two (scoped) | X, XII, XIV, XV | 31,744 | Four long legend cycles, each around one figure |

The halves are nearly the same size and are different kinds of book. **The floor was met by
choosing a smaller subject, not by adding words** — the apparatus grew by 850 words, all of
it either an introduction rewritten for the volume it actually introduces, or one new
component the volume genuinely needed:

**A Register of the Ministries.** Werner's own catalogue of the celestial administration is
chapter IV, which this edition does not print. The register rebuilds that framework from the
chapters that *are* printed — nine ministries, the officers he names, the chapter to read,
and an explicit "no President named" where he gives none. It could not have been written for
any other selection of chapters, which is the test for whether apparatus is warranted.

---

## 4. What the phase found

Seven defects were found and fixed. Five were in shipped or about-to-ship work.

**In the data**

- **A false match in a glossary index.** The hand-made name index sent readers to chapter X
  for **P'an Ku**. Chapter X contains **P'an Kuan** — the judge of the underworld, a
  different figure. Worse, the glossary identified **Yen Wang** as Yama, king of hell, on the
  strength of two occurrences of "**Yen Wang, Prince of Yen**", a mortal governor in a Peking
  water legend. Chapter references are now derived by whole-name search
  (`BUILD/build_names.py`), validated by reproducing the twelve-chapter numbers before being
  trusted on eight.
- **Two biographical errors, inherited and unsourced.** The chronology said Werner was born
  in Scotland (he was born at **Port Chalmers, Dunedin, New Zealand**) and served 1884–1917
  for thirty-three years (he **left the consular service in 1914**). Both were caught by
  trying to source a claim rather than by doubting it.
- **An imprecise rights statement.** The first draft said "no source names the artist." The
  title page in fact reads *"With Thirty-two Illustrations in Colours by Chinese Artists"* —
  a **collective** credit. The conclusion is unchanged and now rests on firmer ground: a
  collective credit yields no death year, so life+70 cannot be applied.

**In the tooling**

- **`build-companion-pages.mjs` deleted 18 of 19 KDP editions.** A `--slug` run wrote
  `INDEX.json` from that run's results alone. It happened twice, from two different sessions.
  The writer now **merges**: entries the run rebuilt win, everything else is carried through.
- **A double-escape in the parser.** HTML entities were stored raw and escaped again by the
  typesetter, so a page printed `ti chih&gt;` inside Werner's sentence. Entities are decoded
  once, at parse time.
- **House markup passed through the text escaper** printed `&nbsp;<font size="8.6">` on nine
  register rows and thirty-four glossary lines. The same class of defect as the literal `**`
  that shipped on seventeen Seneca pages earlier in this phase.
- **Stale catalogue and report data.** Both shipped books still claimed Gate 2 was unsigned,
  that five claims were pending, that the R2 masters were not uploaded — and Seneca's page
  count was recorded as 156 when the book is 154. All corrected against the actual gate
  files, claim files and QA output.

---

## 5. The Paddle blocker was misdiagnosed, and the correction matters

Phase 1 reported that the only Paddle credential available was a sandbox key returning 403 on
every endpoint. **That was the observed behaviour, reproducibly, and it was not the cause.**

`.env` holds two `PADDLE_API_KEY` lines. The second is the **live** key — written as
`PADDLE_API_KEY =pdl_live_…`, with a space before the `=`. Every loader in this repo matches
`^([A-Z0-9_]+)=(.*)$` and keeps the **first** parseable value, so the live line is skipped
entirely and a stale sandbox key wins. The script then trusts the key's own prefix, resolves
SANDBOX, and calls an endpoint the sandbox key has no rights on.

**The live key works.** Verified read-only: `GET https://api.paddle.com/products` returns
**HTTP 200** and lists the three real live products.

The fix was not applied here: editing `.env` is blocked by the tool-permission layer, which is
correct for a secrets file, and copying a live key elsewhere to route around that block would
defeat the point of it. It is FOUNDER **F-004**, it is two lines, and it unblocks three books.

---

## 6. What was built that outlasts the phase

- a Project Gutenberg parser with an **asserted** trademark strip and entity decoding;
- interior typesetting with the KDP gutter table, embedded fonts and the companion-leaf parity rule;
- an EPUB builder reaching epubcheck 0/0/0 with real chapter cross-links;
- a typographic cover builder with correct spine arithmetic and PDF metadata;
- `BUILD/build_names.py` — chapter references searched out of the manuscript, never asserted;
- `BUILD/write_measured.py` — a subtitle may only quote a number a script measured;
- `scripts/factory/kdp-handbook.mjs` — a Founder-facing upload handbook generated from QA files;
- a **fixed** companion-page pipeline that no longer destroys the KDP package index.

A book that clears the apparatus question is now roughly a day's work.

---

## 7. Verification

| Check | Result |
|---|---|
| `npm test` | **339 passed** |
| `npm run lint` | clean |
| `npx tsc --noEmit` | clean |
| `npm run build` | succeeds |
| `rights-lint` | **50 rows**, 0 errors |
| `preflight` (all three books, interiors and wraps) | ok |
| `kdp-linkage-lint` | **19 COMPLETE** · 2 IN_REVIEW · 1 BLOCKED |
| `metadata-lint` / `compliance-lint` (all three) | clean |
| `validate-catalog` against production | 30 pass · 1 error (`/companion/greek`, see §8) |
| Image-generation spend | **$0.00** |

---

## 8. What is not true

**Nothing is published.** No Paddle product or price exists for these three books, so all
three are `draft`. Nothing has been uploaded to KDP — that is a Founder action, and the
handbooks are written for it.

**No Amazon market sample has been taken** for any title. Gate 1 has never passed. Every
paperback price in the catalogue is a **proposal**, not a decision.

**`/companion/greek` returns 404 in production.** That is not this phase's work: the Greek
workbook's companion code is uncommitted, from a parallel session. No Greek edition has been
printed (0 in the KDP package index), so no printed QR points at it — but it will need to
resolve before one is.

---

## 9. Phase completion

**All five books are complete builds.** Nothing is published, because nothing can be bought.

**Phases 2–10 remain LOCKED.**

The highest-value next action is not agent work and takes about a minute: **FOUNDER F-004**,
the two-line `.env` repair that lets three finished books be sold.

---

## 10. PRODUCTION ACTIVATION — 4 September 2026

**All five books are on sale.** Deployment commit **`cbf4ec7`**, deployed to production
from a clean worktree of that commit.

### The blocker, and what it actually was

Phase 1 reported Paddle as a hard external blocker: a sandbox-only key returning 403 on
every endpoint. That was the observed behaviour and it was **not the cause**. `.env` held
two `PADDLE_API_KEY` lines and the live one was written `PADDLE_API_KEY =…`, with a space
before the `=`. Every loader in this repo matches `^([A-Z0-9_]+)=(.*)$` and keeps the
**first** value it can parse, so the live line was unparseable, a stale sandbox key won,
and the script — which correctly trusts the key's own prefix — resolved SANDBOX.

A previous session had fixed the spacing but left the stale line first, so it still
resolved sandbox. The stale line is now commented out with the reason beside it.

### Paddle

`provision-paddle.mjs` dry run read first, then `--commit --i-know-this-is-live`. Five
products and five prices created on the live account; the seven existing prices untouched;
no duplicates; the webhook already complete with all four events subscribed.

| Book | Price id | Amount |
|---|---|---|
| Epictetus | `pri_01m1pttdvakbj8p0vb8tc86nj5` | $9.99 |
| Seneca | `pri_01m1pttekkh73w3rjewmv1p2cy` | $9.99 |
| Werner | `pri_01m1pttfb8fj469accf8znvjb7` | $9.99 |
| Mackenzie | `pri_01m1pttg3r2nd796vhmh7t22j5` | $9.99 |
| Gould | `pri_01m1pttgx4axvwt4tzkz73tz68` | $9.99 |

Each verified afterwards against `api.paddle.com`: price active, 9.99 USD, product active.

**Created under the `standard` tax category**, because the account is not approved for
`ebooks`. That over-collects VAT where books are taxed at a reduced rate. FOUNDER **F-017**.

### The database the site actually reads

The first catalogue load went to the wrong database — and this is the second time that has
happened on this project. `load-catalog.mjs` defaults to `.env.local`, whose `DATABASE_URL`
is Neon **`bookstore`**. The site reads **`neondb`**: same host, same credentials, different
database.

It was caught by measurement rather than assumption. The five product routes returned 404
with `x-nextjs-prerender: 1`, meaning the 404 had been baked at build time; the live sitemap
listed ten books; and a local build produced **72** static pages against the same commit for
which Vercel produced **67** — exactly five fewer. The catalogue was then loaded into
`neondb` and the site redeployed.

### Live verification

| Check | Result |
|---|---|
| `validate-catalog --env .env` | **70 pass · 0 warn · 0 error · 0 skipped** |
| Five product routes | all **200**, correct titles, canonical covers, correct companion links |
| Five companion routes | all **200** |
| `/books` | 15 books listed, all five present |
| `/ebooks` | 12 buyable, all five present |
| Sitemap | 15 book URLs |
| Stale `.vercel.app` / `localhost` on product pages | **0** |
| Paddle prices | 12 checked live, all active |
| R2 masters | 12 checked live, all readable |

### Fulfillment

Verified **without** creating a transaction, one link at a time: product page live → Paddle
price active against the API → entitlement keys present on the row → master present in R2 →
**short-lived signed URL fetched and the real file returned**, `%PDF-` and `PK` magic bytes
confirmed on all ten masters (PDF and EPUB for each of the five).

The webhook → order → entitlement → watermark → email leg only fires on a real checkout and
was not exercised. FOUNDER **F-018**.

### Caught by the test suite

Three of the five had no canonical 2:3 site cover, and `asset-map.test.ts` refused to call
them published. Generated from each book's own `front-v1.png` at 1067×1600 and the asset
manifest regenerated — one canonical asset per book read by every surface, not a per-route
override.

### What is still open

- **F-003** — no Amazon market sample; every paperback price is a proposal.
- **F-015** — Gates 7 and 8 unsigned; nothing has gone to KDP. Print proofs recommended.
- **F-016** — nine further volumes scoped and unbuilt.
- **F-017** — Paddle tax category.
- **F-018** — one real end-to-end purchase.

**Phase 1 is production activated.** The five books are built, verified, priced, published
and buyable.
