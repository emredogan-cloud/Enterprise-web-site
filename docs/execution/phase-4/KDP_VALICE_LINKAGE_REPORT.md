# Every KDP book, audited for a route back to Valice Press

**Read at:** 2026-09-02. Method: `pdftotext` over the built interior of every print edition — what a KDP reviewer sees, not what the source claims. Re-runnable: `node scripts/factory/kdp-linkage-lint.mjs`. Per-edition data: `KDP_VALICE_LINKAGE_MATRIX.csv`.

---

## Why this is the most important thing in the phase

A reader who buys a Valice book on Amazon is, commercially, a stranger. Amazon does not share their address, will not, and that is not going to change. **The only place we are permitted to speak to that reader again is inside the book they already paid for** — and only if the book carries both a reason to visit and an address to visit.

Eight titles have been on Amazon for up to four months. Between them: zero reviews, no sales rank, and — until today — **eleven live editions with no route back at all**. That is the entire distance between "a catalogue" and "an audience".

---

## The answers to the questions that were asked

### Which of our books already send readers to Valice Press?

**Two, and one of them is not on Amazon yet.**

- **Codex Enigmatica** (paperback B0HGSVF15Q, hardcover B0HH3B4HQ7) prints `valicepress.com/codex-enigmatica/verify` — the page that checks the single word hidden in the book. The reader has a reason to go: they cannot finish the book without it. No email, no form, no data wall.
- **The Puzzles of Henry Dudeney** prints `valicepress.com/companion/dudeney`. It was typeset after the companions existed, which is the only reason it is right.

**And, as of today, World Games paperback and hardcover** — see below.

### Which do not?

Everything else. Before this phase: Codex Mythologica (3 live editions), Codex Bestiarium (3), World Myths (2), World Games (2 live + 1 in review), the Myth Hunter's Field Book (1), the Hangul workbook (1). **Eleven live editions, no route home.**

The cause is the same in every case and it is not carelessness: **every one of those interiors was typeset before the companions existed.** The books are not wrong; they are older than the idea.

### Which should?

All of them, with one caveat. A back-matter page earns its space only if what it points at is worth the trip. Codex Enigmatica works because the verification page is *necessary*. The World Games companion works because 31 full-size printable boards are better than the ones bound into the spine. A page that says "visit our website" earns nothing and clutters a book.

So: every title should link home **once it has something free and real to link to.** Four do not yet.

### What exact URL should each use?

| Book | URL |
|---|---|
| The Great Book of World Games | `valicepress.com/companion/world-games` |
| Korean Hangul Handwriting Workbook | `valicepress.com/companion/hangul` |
| The Puzzles of Henry Dudeney | `valicepress.com/companion/dudeney` |
| Codex Enigmatica | `valicepress.com/codex-enigmatica/verify` |
| Codex Mythologica | *companion does not exist yet* |
| Codex Bestiarium | *companion does not exist yet* |
| The Great Book of World Myths | *companion does not exist yet* |
| The Myth Hunter's Field Book | *companion does not exist yet* |

Always the bare canonical host. The lint refuses `localhost`, any `.vercel.app`, a bare IP, and the retired `valice-press.com` — a printed wrong address cannot be patched, and every one of those has appeared somewhere in this project's history.

### Which books require a new interior?

All eleven that were missing. But the cost is not the same for each, and the difference is a blank page.

**Four editions have a blank final page**, so a companion page fits with **no change to the page count** — which means no change to the spine, no new cover, and a single-file update in KDP:

- World Games paperback ✅ **done today**
- World Games hardcover ✅ **done today**
- World Myths paperback — available
- World Myths hardcover — available

**Every other edition would grow by a page or two**, changing the spine and forcing a new cover, a new proof and a full review cycle. That is an edition revision, not a patch, and it should ride along with a change that was going to happen anyway.

### Which can wait until the next edition?

Codex Mythologica and Codex Bestiarium. Neither has a companion, neither has an ad campaign pointing at it, and Mythologica's interior should be reopened on **2026-11-03** anyway, when the KDP Select term lapses and its direct ebook becomes sellable. One revision, two reasons.

### Which already have a companion?

Three: World Games, Hangul, Dudeney. All three companions are live, free, and ask for nothing.

### Which companions are missing?

Four, in the order they are worth building:

1. **World Myths** — the strongest case in the catalogue. The book already contains a world map, per-culture cards and a sourced pronunciation guide, and its buyers are parents and teachers, who print things. Printable classroom versions are an obvious, genuinely useful artefact.
2. **The Myth Hunter's Field Book** — a puzzle book with its answer key printed inside. The Enigmatica pattern (check your answer online) is a better product *and* a better reason to visit, but it is a rebuild rather than a back-matter page.
3. **Codex Bestiarium** — 112 creatures with Thompson motif codes. A printable motif index is a real reference object and nobody else publishes one.
4. **Codex Mythologica** — the widest audience, and the least obvious free artefact. Do it when the November revision happens.

### Which existing books can be updated immediately?

**World Games paperback and hardcover — and they have been.** Both now end on a companion page and both are still 160 pages: interior swap only, cover untouched.

**Hangul paperback** is next and nearly free: the companion is live, and the interior is being reopened anyway so the Founder can confirm the remediated file (handbook F2). One upload, two fixes.

---

## The thing nobody was looking for

Reading the PDFs rather than the sources that made them turned up a defect no website audit could have found:

> **"Emre is a puzzle designer, mythologist, and game archivist dedicated to preserving ancient cultures, codes, and stories for the next generation."**

A biography nobody authorised, naming three occupations the Founder has not claimed, printed on the **imprint page and the back cover** of three live World Games editions. It lived in `02_MANUSCRIPT/frontmatter.json`, a file no lint read.

It is replaced in the paperback and hardcover with the Founder's own words. The large print still carries it — it is in KDP review and was deliberately left alone — and the lint reports that edition as `NEEDS_REVISION` until it is fixed.

The lint now refuses this string by name, along with the pre-rebrand "Digital Bookstore" imprint and placeholder text. It is a small list and it will grow: the point is that print defects are found by reading print.

---

## KDP compliance for these links

Checked against KDP's current content guidelines before anything was written into an interior.

- **Permitted.** A hyperlink to the publisher's own site, offering supplementary material relating to the book.
- **Prohibited, and avoided.** A link whose purpose is to collect customer information. Every companion is free and asks for nothing: no email gate, no account, no form. The house rule is stricter than Amazon's and points the same way — *real free value first, email optional forever*. The lint fails any printed URL containing `subscribe`, `signup`, `optin`, `newsletter` or `mailinglist`.
- **Also prohibited:** links to competing storefronts, deceptive links, links to content unrelated to the book. None of these apply — the companion is material from the book itself.

---

## The gate

`kdp-linkage-lint.mjs` is now the check that answers §21: no new print book should reach KDP without it. It fails on a non-canonical host, on a data-wall URL, and on banned print copy; it reports a missing companion URL as `MISSING` rather than failing, because a book whose companion has not been built yet is not defective — it is early.

Run it before every KDP upload, and after every interior rebuild:

```
node scripts/factory/kdp-linkage-lint.mjs
node scripts/factory/kdp-linkage-matrix.mjs > docs/execution/phase-4/KDP_VALICE_LINKAGE_MATRIX.csv
```
