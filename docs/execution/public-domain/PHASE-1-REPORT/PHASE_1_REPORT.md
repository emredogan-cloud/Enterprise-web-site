# PHASE 1 REPORT — Public-Domain Publishing Factory

**4 September 2026 · Phase 1 · Phases 2–10 LOCKED**

---

## Status in one paragraph

Phase 1 was scoped as five books. **Two are complete builds, one is blocked on a decision that
is the Founder's, and two were not started.** The roadmap and the constitution are written and
in force. Nothing is published: every book is `websiteStatus: "draft"` and the gates that need a
person are open. 329 tests pass, lint and `tsc` are clean, `npm run build` succeeds, and the
rights ledger passes on 42 rows.

This report says what was built, what was found, and why the phase stopped where it did.

---

## 1. What was delivered

| Deliverable | State |
|---|---|
| `PUBLIC_DOMAIN_MASTER_ROADMAP.md` | **Done.** 97 of 144 catalog candidates pass the eligibility gate; 50 assigned to Phases 1–10 at five per phase; 47 held as a reserve; 47 recorded as not schedulable with reasons. |
| `PUBLIC_DOMAIN_PUBLISHING_CONSTITUTION.md` | **Done.** Nineteen articles. In force for every phase. |
| **Book 1 — Epictetus: The Discourses and Enchiridion** | **COMPLETE build.** 176 pp · apparatus **20.1%** |
| **Book 2 — Seneca: Selected Dialogues** | **COMPLETE build.** 156 pp · apparatus **20.1%** |
| **Book 3 — Myths and Legends of China** | **BLOCKED.** Parsed, rights-cleared, apparatus written at **13.3%**. Scope decision → FOUNDER F-013. |
| Books 4 and 5 | **Not started.** Specified in the roadmap. FOUNDER F-014. |
| `FOUNDER.md` | **Done.** 14 entries, severity-ranked, no duplicates. |
| `PHASE_1_PROMPT_LIBRARY.html` | **Done** — and it records that no image was generated and nothing was spent. |
| Per-book reports and KDP handbooks | **Done** for Books 1–3 (Book 3's is a status report, not a handbook — there is no package to upload). |

---

## 2. The two complete books

| | Epictetus | Seneca |
|---|---|---|
| Series | Valice Classics 3 | Valice Classics 4 |
| Source | PG 10661, George Long 1877 | PG 64576, Aubrey Stewart 1889 |
| Translator's death | **1879** (verified) | **1918** (verified) |
| Source words | 61,343 | 47,858 |
| Original editorial matter | **15,381** | **12,026** |
| **Editor share** | **20.1%** | **20.1%** |
| Pages | 176 | 156 |
| Preflight | ok, 4 fonts embedded, 6×9 exact | ok, 4 fonts embedded, 6×9 exact |
| EPUB | **0 fatals / 0 errors / 0 warnings** | **0 fatals / 0 errors / 0 warnings** |
| Cover check | 3 pass, 0 warn, 0 error | 3 pass, 0 warn, 0 error |
| Companion QR | 24% of page, 1.696 mm/module | 25% of page, 1.947 mm/module |
| KDP package | written | written |
| Claims | 23 — 18 verified, 5 pending | 12 — 7 verified, 5 pending |

Both carry: an introduction at the premium standard, per-unit editorial notes, a glossary of
the working terms anchored to passages where the source itself supplies the original word, a
biographical index, a chronology that says where the sources disagree, a subject index generated
by searching the text, and a **concordance to the Valice *Meditations*** that lists what is
verified present *and* what is verifiably absent.

Neither uses a single illustration. Neither cost anything to produce.

---

## 3. What the phase found

**The Seneca substitution.** Book 2 exists because a rights check failed. The previous candidate
pool recorded Seneca's Loeb translator as "d. 1919 → GREEN"; 1919 is the imprint year of volume 2
of a series whose volume 3 appeared in 1925, and the translator's authority record gives a birth
year and no death. Aubrey Stewart (d. 1918) is the verified substitute. The constitution now
carries the lesson: **a publication year is not a death year.**

**Werner's plates cannot be used.** No source names the artist of the 1922 colour plates. With no
identified creator there is no death year and the life-plus-seventy rule cannot be applied at all.
Seventeen plates were dropped from the selected chapters and the count is written to the parse
report by the parser, so the omission is a decision on file. Ledger row RL-0041 is **RED**.

**Werner is clear outside the US only since 1 January 2025.** He died in 1954. Valice research
written before that date still records the title as encumbered.

**A parallel system was built and removed.** Book 1's first build authored its own companion page
inside the interior. It met the numbers and it was a parallel system: no read-back, no
module-level QR decode, no spine arithmetic, no KDP package — all of which
`scripts/factory/build-companion-pages.mjs` already did. `CLAUDE.md` forbids exactly this. Both
books were moved onto the house pipeline, and the interior builders now deliberately produce an
**odd** page count because the appended companion leaf is what makes the final count even.

**Two KDP-fatal font defects** were caught by the preflight and fixed — an unembedded Helvetica
from ReportLab's canvas base font and another from an unstyled table. The same class of defect
that got a previous Valice edition rejected.

**A live defect outside this phase.** Four companion newsletter sources declared during Phase 4
were never added to the API's runtime allowlist, so signups from four existing companion pages
were being rejected while the form appeared to work. Found while registering a new source; fixed.

---

## 4. Why the phase stopped at two books

The brief is explicit: **one book complete, then the next — never five half-finished.** The
constitution written for this factory adds two rules that decided the outcome:

- *"Do not add filler to reach a percentage."*
- Selection must be **editorial**, never arithmetic.

Book 3 measures 13.3% against a 20% floor. Every expansion that was genuinely warranted has been
made — the introduction is at 3,000 words, all twelve chapters have introductions, the glossary
entries average 180 words with verified references. What would close the gap is either padding or
cutting chapters *because they close a ratio*. Both are forbidden.

The gap is real and the fix is a product decision:

| Option | Source words | Editor share | |
|---|---:|---:|---|
| all twelve chapters | 63,857 | 13.3% | fails |
| drop the two Ming-novel extracts | 47,193 | 17.2% | fails |
| the pantheon only | 32,113 | **23.4%** | passes |
| pantheon + Goddess of Mercy | 42,500 | 18.7% | fails |
| pantheon + fox legends | 36,806 | **21.0%** | passes |

The recommendation in FOUNDER F-013 is to **split Werner into two volumes** along a seam that is
real rather than invented — the pantheon and its ministries in one, the four long narratives in
the other. The first carries the existing apparatus at 23.4%. The second becomes a Phase 2 title.

Starting Books 4 and 5 while Book 3 waited on that decision would have produced precisely the
outcome the brief forbids. **Both remaining titles have the same shape as Werner** — Mackenzie is
90,000+ source words, Gould about 100,000 — so the scoping question should be settled once,
before either is begun, rather than discovered at measurement time twice more.

---

## 5. What was built that outlasts the phase

The pipeline is proven end to end and is reusable:

- a Project Gutenberg bibrec parser with an **asserted** trademark strip;
- interior typesetting with the KDP gutter table, embedded fonts and the companion-leaf parity rule;
- an EPUB builder reaching epubcheck 0/0/0 with real cross-links;
- a typographic cover builder producing all three slots with correct spine arithmetic;
- a subject-index generator that drops headings it cannot evidence;
- a differentiation measurement that no listing may contradict;
- `scripts/factory/kdp-handbook.mjs`, a new reusable generator that writes a Founder-facing
  upload handbook entirely from a project's own QA files;
- two new entries each in the house companion spec, edition geometry and rebuilt-cover registries.

A book that clears the apparatus question is now roughly a day's work.

---

## 6. Verification

| Check | Result |
|---|---|
| `npm test` | **329 passed** |
| `npm run lint` | clean |
| `npx tsc --noEmit` | clean |
| `npm run build` | succeeds |
| `rights-lint` | 42 rows, 0 errors |
| `preflight` (both books) | ok |
| `kdp-linkage-lint` | 17 COMPLETE · 2 IN_REVIEW · 1 BLOCKED |
| `metadata-lint` (both) | clean |
| `compliance-lint` (both) | 1 error each — AI disclosure awaiting the Founder |
| Image-generation spend | **$0.00** |

---

## 7. What is not true

Nothing is published. No Paddle product exists. No master is in R2. Nothing has been uploaded to
KDP. The site has not been deployed, so the two companion URLs 404 in production — and **a QR
printed in a paperback is permanent, so nothing may be printed until it resolves** (FOUNDER F-006).

No Amazon market sample has been taken for any title, so every paperback price in the catalogue is
a proposal.

---

## 8. Phase completion

**Phase 1 is NOT complete.** Two of five books are complete builds; one is blocked on FOUNDER
F-013; two are not started.

**Phases 2–10 remain LOCKED** and will stay locked regardless — the roadmap does not authorise
them and this phase has not been approved.

The next action is not agent work. It is FOUNDER F-013: decide what the Werner volume is.

