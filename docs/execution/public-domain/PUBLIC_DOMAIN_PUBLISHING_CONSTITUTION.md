# VALICE PRESS — PUBLIC DOMAIN PUBLISHING CONSTITUTION

**Version 1 · 4 September 2026 · Status: ACTIVE · Governs every public-domain book and every phase**

This document governs the conversion of a public-domain source into a Valice Press edition.
It sits **under** the existing house rules and does not replace them: `memory/PAST_DECISIONS.md`
is the architectural constitution, `valice-house/rights/RIGHTS_GATE.md` is the rights gate,
`valice-house/workflows/GATES.md` holds the twelve gates, and the series bibles govern inside
their series. Where this document and a house rule disagree, **the house rule wins** and this
file is wrong and must be corrected.

---

## Article 1 — The founding principle

> **We do not sell public-domain text. We sell a Valice Press edition built from
> public-domain material.**

The text is free. Everywhere. Permanently. A reader who buys a Valice edition is buying
something the free text does not give them, and if we cannot name that thing in one sentence,
the book should not be made.

This is not an aesthetic preference. It is the business model. KDP caps public-domain content
at the 35% royalty tier; the Valice store nets ~90% after Paddle. A public-domain edition earns
more than double here — but only if it is worth buying, because on Amazon it competes with
$0.99 clones and on our own store it competes with Gutenberg.

**The corollary:** the apparatus is not decoration added to a text. The apparatus is the product.

---

## Article 2 — The differentiation standard

Every edition must answer, visibly: **why should somebody buy the Valice edition?**

The answer must be present in the product description, the edition design, the actual interior,
the ebook, the print edition, and the companion. A reader must be able to see it before buying
and feel it after.

### What counts

| Apparatus | Counts as differentiation |
|---|---|
| Original introduction | Yes — ≥1,500 words minimum, ≥3,000 premium (Valice Classics bible) |
| Original notes and annotations | Yes |
| Chronology, glossary, index | Yes |
| Original diagrams, redrawn illustrations, maps | Yes — and ≥10 originals clears the KDP threshold |
| Selection and restructuring with a stated editorial rationale | Yes |
| Modern explanations of superseded claims | Yes |
| Solution apparatus, difficulty ratings, hints | Yes |
| Cross-references to other Valice editions | Yes |
| Source note naming edition, translator, archive id, and what was removed | Required, always |

### What does not count

Linked contents. Reformatting. Fresh typesetting alone. A new cover alone. Compilation alone.
Price. "Available free on the internet." These are KDP's own exclusions and they are also
simply true: none of them gives a reader anything.

### The measured floor

`differentiation.mjs` measures the original share of words and writes it to
`project_config.json → measured.editorShare`. **The Valice Classics floor is 20%; premium is 35%.**
A book below its series floor does not pass Gate 9.

Dudeney measured 27.9%. That is the working benchmark.

### The prohibition

**Do not add filler to reach a percentage.** A padded introduction is worse than a short one,
because it is both useless and dishonest. If a book cannot carry real apparatus, it is the wrong
book — return it to the pool and take another.

---

## Article 3 — Rights are layered, and a layer never clears its neighbour

Every candidate is assessed in eight layers, separately:

**WORK · EDITION · TRANSLATION · ILLUSTRATION · INTRODUCTION · NOTES · APPARATUS · SOURCE SCAN**

A public-domain work does **not** clear a modern translation, a modern illustration, a modern
commentary, or a modern edition's apparatus. The 2026-09-03 revalidation found four separate
cases where the existing pool had marked a book GREEN on the text while its plates were in
copyright for another decade or more — including Maxfield Parrish plates blocked until 2037.

### The four rules that come from that finding

1. **Read the illustrator row.** Project Gutenberg records the illustrator as a distinct agent
   with dates. It costs nothing to check and it is where the failures are.
2. **A publication year is not a death year.** The pool recorded Seneca's Loeb translator as
   "d. 1919 → GREEN". 1919 was the imprint year of volume 2; volume 3 appeared in 1925. Verify
   that a death year is a death year.
3. **Source provenance is a rights signal.** An Internet Archive item in `americana` or a named
   university library carries a library's determination. One in `opensource; community` carries
   an anonymous uploader's self-applied Public Domain Mark. One in `internetarchivebooks` is
   lending, not free. All three display similar-looking licence text.
4. **Modern reprints outrank originals in search.** Verified three times — 1961 Falkener, 1964
   Gomme, a Singing Tree Press Ingersoll. Read the year field every time.

### The record

Every production project carries `RIGHTS.md` and a row per source layer in
`valice-house/rights/ledger.csv`, per `valice-house/rights/SCHEMA.md`. Work rights and
edition/translation/illustration/apparatus rights are **separate rows**.

---

## Article 4 — GREEN is not clearance

The research catalog's GREEN is an **operational research classification**: strong enough
evidence to justify further work. It is not permission to publish.

Before a book is built, the following are re-verified and recorded:

- the source identifier resolves and is the edition claimed (not a reprint);
- authorship;
- the death year of every creator of every layer used, from an authority record;
- the translation and its translator;
- the illustrator, or the explicit finding that none is recorded;
- jurisdiction, stated per market — US and EU/UK/TR separately, never "public domain" alone;
- source provenance (which collection, which scan, which OCR engine);
- commercial-use suitability.

Then **Gate 2** is completed per house rules: a founder-signed ledger row per layer, with an
evidence URL and a verification date. `rights-lint.mjs` enforces the shape; the founder's
signature is the substance.

**No book is built before Gate 2 is prepared. No book is published before Gate 2 is signed.**

### The date rule

Public-domain status moves every 1 January. Every rights conclusion is stamped with the date it
was made and the line it was tested against. A conclusion older than the last 1 January is
re-checked, not assumed.

---

## Article 5 — Cultural and ethical review

**Legal clearance is not ethical clearance.**

A work involving Indigenous cultures, colonial-era description, racial classification, superseded
anthropology, living cultural communities, or sacred tradition requires cultural review before
Gate 2, regardless of copyright status.

This rule already exists in the house: Culin's *Games of the North American Indians* was
deliberately scheduled last for exactly this reason, and that decision stands. The research
catalog holds seven candidates behind this gate, including *Myths of the Cherokee* — 6,312
Gutenberg downloads a month, and among the most commercially attractive material found.

**That is the point.** The gate exists precisely where commercial pressure would otherwise
quietly skip it. A high score is a reason to be more careful, not less.

A title behind this gate may not occupy a production slot until the review is done. The review
is done by consultation, never by a document.

---

## Article 6 — Factual accuracy and the three registers

Every Valice edition must keep three things visibly distinct:

| Register | What it is | How it appears |
|---|---|---|
| **SOURCE CLAIM** | What the historical author asserted | In the text, as they wrote it |
| **CURRENT FACT** | What is now known | In an editorial note, marked as such |
| **EDITORIAL INTERPRETATION** | What Valice thinks it means | In the introduction or notes, in Valice's voice |

Historical sources in this catalog are frequently, interestingly wrong. Gould argues dragons
were surviving real animals. Elliot Smith's diffusionism is discredited. Taylor's Semitic
philology is superseded. Morley's Maya decipherment has been overtaken.

**Do not silently modernise a historical claim into an apparent fact, and do not silently
reprint a disproven one as if it still stood.** Repeating a superseded claim without apparatus
is as much a factual failure as inventing one — it is simply a slower one.

Every checkable statement Valice adds goes into `CLAIMS.jsonl` and through Gate 5, verified by
someone who is not the author. A load-bearing claim that comes back WRONG or UNVERIFIABLE is
cut, not softened.

---

## Article 7 — No modern copyright, ever

Never copy a modern introduction, translation, annotation, cover, illustration, solution set,
or publisher apparatus.

Modern editions may be used only as **market research** and **comparative evidence** — to know
what exists, what it costs, and what it fails to do. A modern edition is never a source and
never a rights basis.

Project Gutenberg's text is public domain, but the **Project Gutenberg trademark, header and
licence must be stripped** from any sold edition, and no copyright may be claimed on the
public-domain text itself. Standard Ebooks files are CC0; their cover art is only *believed*
public domain and is re-verified before any use.

---

## Article 8 — The digital edition standard

Every production candidate receives a **Valice Direct ebook**. Minimum:

- a valid EPUB — **epubcheck with 0 fatals and 0 errors**, recorded in `QA/`;
- correct metadata;
- a real cover;
- working navigation with a page-numbered contents;
- correct images;
- house typography;
- a direct-sale listing with a price;
- the production asset stored and retrievable.

Where the infrastructure supports PDF delivery, the PDF companion asset is built too. The
digital edition is **a separate artifact from the print interior** — print interiors run
40–121 MB and the fulfillment worker reads the whole file into memory in a serverless function.
`build-digital-editions.mjs` cuts the 150 DPI edition. Never point `master_file_key` at a print
interior.

**Do not claim an EPUB is included until fulfillment actually delivers it.** The Dudeney
edition built a clean EPUB months before fulfillment was wired to serve it, and the product
page correctly said nothing about EPUB until it was true.

---

## Article 9 — Website and asset standard

Every book gets a dedicated product page carrying: correct title, description, author, real
cover, price, category, edition information, preview where appropriate, purchase CTA, related
books, and the companion where one exists.

**The real cover appears everywhere** — home, catalog, ebooks, product page, cart, library,
search, related shelves — through the canonical asset map (`scripts/assets/asset-manifest.mjs`).
No placeholder. No route-specific hardcoded image.

Publication is data: a book goes live because `websiteStatus: "published"` is written next to
its blockers in `scripts/catalog/valice-catalog.mjs` and the loader applies it. Never publish by
editing the database.

---

## Article 10 — Commerce standard

For every direct ebook: create or update the Paddle product and price, map the catalog entry,
verify production mode, verify tax category, verify fulfillment, verify library entitlement.

Use the Paddle API wherever authorised access permits. Where an action genuinely requires
owner-only access, **document the exact Founder action in `FOUNDER.md` and complete everything
else.** A manual step downstream is not a reason to stop the work upstream.

Three statuses are never conflated: `websiteStatus` (do we list it), `format.kdp` (what Amazon
holds), `directSale` (may we sell the digital edition ourselves).

`price_cents = 0` means **not sold here**, never *free*. An Amazon link requires a verified
ASIN, and an ASIN requires `kdp: "live"` — Amazon issues the ASIN at publication, so an ASIN on
an unpublished title is by definition invented. Never invent a rating; zero reviews renders as
no stars at all.

---

## Article 11 — Cover standard

Every book gets a professional cover in the Valice identity, per
`valice-house/covers/COVER_STANDARDS.md`. Valice Classics is **emerald/black, Noto Serif
Display, typographic plus one fine engraved device** — the Meditations pattern.

Rules that bind every cover:

1. Title ≥25% of cover height and legible at 150 px (the Amazon thumbnail).
2. All lettering set in type, never rendered inside an image.
3. No QR code, URL or form on any cover — KDP disallows it. The companion address lives on
   the last leaf.
4. Slots: front source PNG ≥2400×3600, Kindle 1600×2560 JPEG, print wrap PDF at 300 DPI with
   0.125 in bleed and the barcode corner clear, storefront WebP via `ingest-covers.mjs`.
5. Versions are never overwritten; bump `v<n>`.

**Prohibited:** bland generic public-domain covers, plain-text covers, cheap template covers,
repetitive AI covers.

### On image generation

`OPENAI_API_KEY` is **not present in this environment** (verified 2026-09-04). No image model
is available, and no budget is spent. Covers are therefore **typographic**, built by script in
the Meditations/Dudeney pattern — which is the series identity anyway, not a fallback. If a key
is added later, generation runs under the existing budget controls, assets are tracked, the key
is never printed or committed, and the AI disclosure is updated to match.

---

## Article 12 — Format decisions are made, not assumed

Every book is **evaluated** for Kindle, paperback, hardcover and large print. No format is
produced automatically.

For each, record **YES/NO with a reason**, considering page count, audience, economics, market,
physical suitability, differentiation and expected contribution.

- **Large print** requires a reason to exist — an audience that needs it and a page count that
  survives the re-set. If it is not justified, write why not.
- **Hardcover** needs enough pages for a spine and a price the market will carry.
- **Kindle** on a public-domain title earns 35% and competes with free. It is a discovery
  channel, not a revenue channel, and it is a choice.

Public-domain editions are **direct-first**. That is a locked house decision.

---

## Article 13 — The companion is a real thing or it is not there

Every physical edition using the Valice bridge carries a **visible reader-utility companion
page**: a dedicated page, a clear heading, a useful explanation, a large QR, a human-readable
URL, and a relevant visual.

The URL is `https://valicepress.com/companion/<slug>`. Never localhost, never a Vercel preview,
never a temporary host, never an expiring shortener. The QR is large, high-contrast, with a
quiet zone, and points to exactly the URL printed beside it — tested with an independent reader.

The reader should think *"I have something useful waiting for me"*, never *"the publisher is
advertising to me"*. A companion with nothing behind it is worse than no companion: it spends
the reader's trust and returns nothing.

**Do not bury the URL in a paragraph.** The Phase 5 standard is a dedicated page with the QR at
≥25% of usable height.

---

## Article 14 — Page count is load-bearing arithmetic

Adding a companion page changes the page count. When it does: recalculate page count,
recalculate spine, recalculate cover, recalculate barcode placement, update metadata, update
the KDP files.

**Never keep an obsolete cover because recalculating is work.** A wrong spine is a rejected
upload at best and a ruined print run at worst.

---

## Article 15 — Author, biography and disclosure

Never fabricate credentials, awards, follower counts, expertise, occupations or professional
history. The Founder's biography is canonical, supplied verbatim, and recorded in
`project_config.json → founder.authorBio`. It is not rewritten, not embellished, and not
shortened except where a provider field has a hard limit — and any shortened variant is
recorded, not improvised.

An unauthorised invented author bio has already reached print once in this catalogue. It was
found and removed in Phase 4. It must not happen again.

**AI disclosure records what actually happened.** Distinguish AI-generated, AI-assisted and
human-created, per component. The KDP declaration must match the real production process.
Never falsify a disclosure to make a submission look cleaner.

---

## Article 16 — One book at a time

A book is processed through its complete lifecycle before the next book begins:

> select → verify source → verify rights → verify layers → prepare Gate 2 → read the source →
> design differentiation → build apparatus → build visuals → build ebook → validate ebook →
> price → Paddle → website product → companion → paperback → hardcover → large-print decision →
> URL + QR → recalculate geometry → KDP preflight → upload handbook → rights/compliance QA →
> catalog QA → website QA → book report → **COMPLETE**

**The requirement is BOOK 1 COMPLETE → BOOK 2, never five half-finished books.**

A book is COMPLETE only when rights are resolved, differentiation is real and measured, the
ebook validates, a price exists, the website product exists, the cover exists, physical formats
are decided with reasons, generated files are validated, the companion exists where applicable,
URL and QR are correct where applicable, the KDP package and handbook exist, Founder blockers
are documented, and the book report is written.

A phase is COMPLETE only when **all five books are COMPLETE**. Then the factory **stops** and
waits for explicit Founder approval. Only one phase is ever active; only one book within it.

---

## Article 17 — Blockers do not stop the line

| Severity | Meaning | Effect |
|---|---|---|
| **P0** | Prevents any safe continuation of this book | Stops this book only, if other work can safely continue |
| **P1** | Blocks a specific output | Other work continues; rarely stops a phase |
| **P2** | Inconvenience or optional refinement | **Never** stops a book |

A real blocker is documented in `docs/execution/public-domain/FOUNDER.md` — the single common
ledger for all phases — with date, phase, book, the blocker, why the agent cannot complete it,
what is already done, the exact Founder action, the exact file or screen or command, and the
consequence if unresolved.

Founder actions are not duplicated across reports. Routine agent work never goes in that file.

---

## Article 18 — What is never done

Never: start a locked phase; mass-produce phases; build five books at once; fabricate rights,
market demand, ASINs, ISBNs, prices, author facts or measurements; copy a modern edition; use an
uncleared translation or illustration; hide a historical inaccuracy; ship cosmetic-only
differentiation; add a meaningless companion; bury a companion URL; generate a generic cover;
use a fabricated biography; falsify an AI disclosure; claim KDP live when only uploaded; claim a
companion live when its URL is broken; or claim an EPUB is included before delivery works.

---

## Article 19 — The standard

> **RIGHTS + EDITORIAL VALUE + VISUAL VALUE + DIGITAL VALUE + PHYSICAL VALUE +
> CUSTOMER UTILITY + COMMERCIAL DISCIPLINE = A VALICE PRESS EDITION**

The factory is allowed to be ambitious. It is not allowed to be careless.

The reader must never feel they bought a lazy republication — because if they did, they did,
and no amount of process will have hidden it.

---

## Article 20 — The AI disclosure, decided once

**Founder decision, 4 September 2026.** This is house policy for every public-domain book.
It is recorded here so that the answer is given once and identically, rather than re-derived
per title and answered differently each time.

### What KDP actually asks

KDP distinguishes **AI-generated** content — created by an AI tool, *even if you then edited
it substantially* — from **AI-assisted** content, which you created yourself and used AI tools
to refine. The distinction turns on who produced the first draft, not on how much editing
followed.

### The house answer, per layer

| Layer | What actually happens | KDP declaration |
|---|---|---|
| **Public-domain source text** | Written by a human author and a human translator, decades or centuries ago. Transcribed by volunteers, parsed mechanically here. No model touches the words. | **Not AI. Not declared.** |
| **Editorial apparatus** — introduction, head-notes, glossary, biographical index, chronology, source note | Drafted by an AI model under human editorial direction, written against the source text, with every checkable statement registered in `CLAIMS.jsonl` and verified before Gate 5 | **AI-generated text. Declared.** |
| **Images and cover art** | Where no image model is used — as in Phase 1 — there is nothing to declare. Where one is used, it is declared. | **Declared only when actually used.** |
| **Translation** | No translation is generated. The public-domain translator's words are reproduced unaltered. | **Not declared unless a translation is actually produced.** |

### Why "AI-generated" and not "AI-assisted"

Because it is the truthful answer under KDP's own definition. The apparatus is drafted by a
model and then edited, verified and cut by a human; KDP's category for that is AI-generated,
and the subsequent editing does not move it. Declaring "AI-assisted" would be the more
flattering answer and it would be wrong.

**This does not weaken the edition.** Public-domain differentiation at KDP is judged on whether
the edition adds original annotation — which it does, measurably, at 20% or more of the volume,
recorded in `QA/differentiation.json`. A declared AI-generated apparatus that is genuinely
original still differentiates; an undeclared one is a compliance failure regardless of quality.

### What this closes

The *Puzzles of Henry Dudeney* edition carries an unresolved conflict of exactly this shape —
the founder declared no AI use while the project recorded an agent-drafted apparatus at 28% of
the words. **That declaration is wrong under this policy and should be corrected at the next
revision of that listing** (`FOUNDER.md`).

### Recording it

Every project carries, in `project_config.json → compliance.aiDisclosure`:

```
text: "generated"        // when the apparatus was model-drafted
images: "none"           // or "generated", when a model was actually used
translation: "none"      // or "generated", when one was actually produced
decidedBy: "founder"
decidedAt: "<date>"
housePolicy: "PUBLIC_DOMAIN_PUBLISHING_CONSTITUTION.md#article-20"
```

`compliance-lint.mjs` refuses a disclosure without `decidedBy=founder`. **Never edit the
historical production record to match a preferred answer.** If what happened changes, the
declaration changes.
