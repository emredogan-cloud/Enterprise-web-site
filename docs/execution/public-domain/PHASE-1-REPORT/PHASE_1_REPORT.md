# PHASE 1 REPORT — Public-Domain Publishing Factory

**4 September 2026 · Phase 1 · Phases 2–10 LOCKED**

---

## Status in one paragraph

Phase 1 was scoped as five books. **Three are complete builds. Two were not started.** The
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
| Books 4 and 5 | **Not started.** Specified in the roadmap. FOUNDER F-014. |
| `FOUNDER.md` | **Done.** 6 open items, 9 closed, severity-ranked. |
| Per-book reports and KDP handbooks | **Done** for all three books. |
| Production deploy | **Done.** `main` fast-forwarded to the deployed commit after 36 commits of drift. |

---

## 2. The three complete books

| | Epictetus | Seneca | Werner, Vol. One |
|---|---|---|---|
| Series | Valice Classics 3 | Valice Classics 4 | Valice Classics 5 |
| Source | PG 10661, Long 1877 | PG 64576, Stewart 1889 | PG 15250, Werner 1922 |
| Creator's death | **1879** | **1918** | **1954** |
| Source words | 61,343 | 47,858 | 31,716 |
| Original editorial matter | 15,381 | 12,026 | 9,133 |
| **Editor share** | **20.1%** | **20.0%** | **22.4%** |
| Pages | 176 | 154 | 108 |
| Preflight | ok | ok | ok |
| EPUB | **0 / 0 / 0** | **0 / 0 / 0** | **0 / 0 / 0** |
| Companion QR | 24% of page | 25% of page | 29% of page |
| Claims | 23 — **all verified** | 12 — **all verified** | 30 — **all verified** |
| Gates passed | 2, 4, 5, 9 | 2, 4, 5, 9 | 2, 4, 5, 9 |
| R2 masters | uploaded, **hash-verified** | uploaded, **hash-verified** | uploaded, **hash-verified** |

None of the three uses a single illustration. None cost anything to produce — no image model
is available in this environment and none was used.

---

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

**Books 4 and 5 do not exist.** Not started, not drafted, not parsed.

---

## 9. Phase completion

**Phase 1 is NOT complete.** Three of five books are complete builds; two were not started.

**Phases 2–10 remain LOCKED.**

The highest-value next action is not agent work and takes about a minute: **FOUNDER F-004**,
the two-line `.env` repair that lets three finished books be sold.
