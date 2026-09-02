# Catalog Master Inventory — Valice Press

> Compiled 2026-08-29 by direct audit of every project under `/home/emre/Downloads/MY-DİGİTAL-BOOK/`. Source of truth for the storefront catalog; the machine-readable version lives at `scripts/catalog/valice-catalog.mjs`.
>
> **UNVERIFIED** means the value could not be established from the project files. It is never a guess.

---

## THE HEADLINE FINDING

**No Valice Press book is published on Amazon.**

Across all fourteen project directories there is:

- no ASIN anywhere,
- no live Amazon listing URL,
- no assigned ISBN (every project uses the "free KDP ISBN" strategy, assigned at upload — and none has been uploaded),
- no KDP submission record, no Previewer run, no proof copy ordered.

Every apparent hit for "ASIN" or "published" in these repositories is forward-looking planning text, a JSON status enum, or a false-positive substring inside a Turkish word.

**One partial exception, flagged rather than accepted:** `CODEX_MYTHOLOGICA`'s own docs state the paperback is "✅ YAYINDA" (live) with a proof copy ordered and A+ content live. But the same project's post-publication checklist item *"record the ASIN"* was never completed, and no ASIN, URL, or publication date appears in any file. This is a founder claim in a document, not file-level evidence, and is treated here as **UNVERIFIED**. It must be checked against the actual KDP Bookshelf before any Amazon link is published.

### What follows from this

1. **No "Buy on Amazon" button can be rendered today.** There is nothing to point one at. The `book_formats` table has `amazon_asin` and `amazon_url` columns, both null on every row, and the UI deliberately renders "Not yet available" rather than a button that 404s on Amazon.
2. **Direct ebook sale is the *less* encumbered channel.** Nothing is enrolled in KDP Select, because nothing is on KDP. No digital-exclusivity clause applies to any of these titles. This inverts the assumption in the earlier strategy work: the website could be the *first* sales channel, not the second.
3. **Every book is loaded as `draft`.** That is the accurate state, not a placeholder.

---

## Inventory

Prices marked **(modelled)** are computed from KDP's published cost tables by each project's own `editions.py`, never confirmed against a live KDP pricing screen. Prices marked **(hypothesis)** are self-labelled as such by the project. Only one price in the entire catalog is founder-approved.

### 1. Codex Mythologica

| Field | Value |
|---|---|
| Subtitle | 76 Myths from 19 Civilizations |
| Author / Publisher | Emre Doğan / Vâliçe Press |
| Series | Codex, vol. 1 |
| ASIN / ISBN | **none** / **none** |
| Amazon URL | **none** |
| Formats built | Paperback (329pp), Hardcover (329pp), Large print (578pp), Kindle EPUB (267 KB), 5 A+ modules |
| Prices | PB $18.99, HC $32.99, LP $27.99 (modelled); Kindle $4.99 launch → **$8.99 or $9.99 — docs contradict each other** |
| Words / pages | 88,398 + ~6,000 front/back matter / 329pp, 6×9in |
| Category | FIC010000 · SOC011000 · LIT004290. Adult general readers |
| Website status | Loaded, `draft` |
| Direct-sale eligible | **Yes** |
| Verification | Publication status **UNVERIFIED** — docs claim paperback live, no ASIN/URL/date recorded |

**Blockers:** Kindle price contradiction unresolved · claimed-live paperback unconfirmed · hardcover and large print built but never uploaded, no proof ordered for either · cover art native resolution ~112 PPI (101 on hardcover canvas) · large print cannot be hardcover (578pp exceeds KDP's 550pp maximum).

---

### 2. Codex Bestiarium

| Field | Value |
|---|---|
| Subtitle | A World Bestiary: 112 Legendary Creatures from 40 Traditions |
| Series | Codex, vol. 2 |
| ASIN / ISBN | **none** / **none** |
| Formats built | Paperback (435pp), Hardcover (435pp), Large print (599pp), Kindle EPUB (4.96 MB), 5 cover PDFs, 5 A+ modules |
| Prices | PB $24.99, HC $37.99, LP $29.99, Kindle $9.99 (all modelled) |
| Words / pages | 88,700 / 435pp, 6×9in, cream, B&W |
| Category | SOC011000 · REF000000 · FIC010000. Adults |
| Website status | Loaded, `draft` |
| Direct-sale eligible | **Yes** |

**Blockers:** Production complete, publication blocked at the KDP account boundary — the project's own changelog reads "ÜRETİM TAMAM, YAYIN BLOKE" (production done, publication blocked). No proof copy, Previewer never run, nothing uploaded · white-paper cover variants defective (spine band overflows 1.10mm PB / 0.41mm HC; cream stock is correct and is the chosen stock) · cover art 103–116 PPI upscaled to a 300 DPI canvas.

---

### 3. The Great Book of World Myths

| Field | Value |
|---|---|
| Subtitle | 45 Stories of Gods, Heroes, and Monsters from 22 Cultures — Retold for Young Readers (Ages 8–12) |
| Series | The Great Book of…, vol. 1 |
| ASIN / ISBN | **none** / **none** |
| Formats built | Paperback (234pp), Hardcover (234pp), Kindle EPUB (2.94 MB), 10 A+ modules. Large print deliberately disabled |
| Prices | PB $16.99, HC $26.99, Kindle $7.99 (modelled) |
| Words / pages | 39,985 (target 43,000) / 234pp measured, 68 B&W illustrations |
| Category | JUV033010. **Ages 8–12**, grades 3–7 |
| Website status | Loaded, `draft` |
| Direct-sale eligible | **Yes** |

**Blockers — note this is the only title with an actual KDP interaction on record:** A **KDP upload was ATTEMPTED and REJECTED on 2026-08-12, twice** — a placeholder author bio on p.231 that KDP read as template text, and a `[QR CODE — Phase 6]` marker on p.233. Both were fixed and all files rebuilt the same day. **There is no record of a successful resubmission.** Also: founder's AI-content declaration not made · KDP Select / Kindle Unlimited decision open (this one materially affects direct-sale eligibility) · cover art effective resolution 115/106 dpi, acceptance pending a physical proof · the two-parent-readings validation gate was closed by founder attestation only, with no per-reader log · README status table is stale and wrongly claims Phase 0 / 0 stories.

---

### 4. The Great Book of World Games

| Field | Value |
|---|---|
| Subtitle (as printed) | 56 Games from 4,600 Years of Human Play — Rules, Boards and Stories from 39 Cultures, Ready to Play Tonight |
| Subtitle (locked target) | 100 Games from 5,000 Years… from 45 Cultures |
| Series | The Great Book of…, vol. 2 |
| ASIN / ISBN | **none** / **none** — imprint page literally prints `PENDING — KDP-PROVIDED ISBN` |
| Formats built | Paperback (160pp, 8.25×11), Hardcover (160pp), Kindle EPUB 3 (948 KB, 50 SVG diagrams), 5 of 6 A+ modules |
| Prices | PB $22.99, HC $34.99, Kindle $11.99 — **self-labelled "hipotez" (hypothesis)** |
| Words / pages | 65,419 / 160pp, 51 vector diagrams |
| Category | GAM002000 · REF000000 · HIS000000. Ages 8–99, family play |
| Website status | Loaded, `draft` |
| Direct-sale eligible | **No** |

**Blockers:** **SCOPE INCOMPLETE — 56 of a locked 100 games written, 39 of 45 cultures.** The gate is held at `phase1` and the project describes it as intentionally red. 44 games were not written and, to the project's credit, were not faked · **ZERO external playtesting** — `01_SOURCE/playtests/` is empty and no game has been played by a human from the book's text alone. The subtitle promises *"Ready to Play Tonight"*, and that claim is currently unevidenced. **That is why this title is marked not eligible for direct sale** · founder's AI declaration not made · APLUS-05 has no artwork · hardcover spine formula unverified against a KDP template.

---

### 5. The Myth Hunter's Field Book

| Field | Value |
|---|---|
| Subtitle | A Screen-Free Quest Through 22 Cultures — 120 Puzzles, Maps, Codes and Challenges for Ages 8–12 |
| ASIN / ISBN | **none** / **none** |
| Formats built | Paperback interior (156pp, 8.5×11, 40.6 MB) + cover (52.6 MB) + 11 A+ images. **No ebook by design** — it is a write-in book |
| Prices | PB $14.99 (modelled; print $3.65, royalty $5.34). An A/B plan against $12.99 exists but has not run |
| Words / pages | 156pp measured; 120 activities, 22 cultures, 6 regions |
| Category | JNF001000 · JUV045000 · JNF025000. **Ages 8–12** |
| Website status | Loaded, `draft` |
| Direct-sale eligible | **No** — there is no ebook to sell. Amazon-print-only by design |

**Status — closest to market in the whole catalog.** Gate `release`, tag `v1.0.0`, preflight 61 audits / 61 green. Its own preflight document states plainly: *"AJAN KDP PANELİNE DOKUNMADI. PREVIEWER ÇALIŞTIRILMADI. HİÇBİR DOSYA YÜKLENMEDİ."*

**Remaining work is four founder actions at the KDP panel:** run Previewer · order and inspect a physical proof · make the AI-content declaration · upload.

**Accepted risks on record (not blockers, but disclosed):** **zero child testing** — `externalValidation = overridden-zero-sessions`, explicitly *not* `passed`; the A10 blocker was closed by founder decision, not evidence, and the config permanently refuses to claim a child tested this book · interior art resolution floor lowered from 300 to 150 dpi by founder decision rather than regenerating assets.

---

### 6. Korean Hangul Handwriting Workbook

| Field | Value |
|---|---|
| Subtitle | Learn to write all 40 letters with correct stroke order, build syllable blocks, and read your first 97 Korean words |
| ASIN / ISBN | **none** / **none** (cover barcode plate deliberately left empty) |
| Formats built | Paperback interior (124pp, 8.5×11), Hardcover interior (124pp, 8.25×11), **fixed-layout Kindle EPUB 3 (125pp, 13.26 MB)**, 3 covers, 6 A+ modules — 23 hashed artifacts, none missing |
| Prices | **PB $12.99, HC $21.99 — FOUNDER-APPROVED (decision K43, 2026-08-29). The only confirmed prices in the catalog.** Kindle price deliberately null; founder must choose within KDP's $2.99–9.99 70%-royalty band |
| Words / pages | 124pp; word count **UNVERIFIED** (no such field exists) |
| Category | **No BISAC assigned.** Free-text candidates only. Adult English-speaking Korean learners |
| Website status | Loaded, `draft` |
| Direct-sale eligible | **No — legal** |

**Blockers:** **LEGAL, UNRESOLVED — an A7 review item flags a CC BY-NC licensed dictionary source (S-0019) used in a commercial book.** A non-commercial licence is incompatible with selling this title in *any* channel until it is cleared or the source replaced; it blocks direct sale exactly as much as it blocks KDP. Further A7 items: ownership terms of the AI-generated cover art, and the KDP AI declaration · Previewer never run · **cover art measures ~83 DPI true resolution and no higher-resolution source exists anywhere in the project** · no real human usability test (Phase 4 pilot used an AI proxy, returned REVISE, closed by founder override) · two correctly-flagged `NOT_FOR_RELEASE` files present in the output tree.

---

### 7. Codex Enigmatica

| Field | Value |
|---|---|
| Subtitle | One Hundred Engraved Enigmas and a Single Unbroken Mystery — A Puzzle Book Bound as a Grimoire |
| Series | Codex, vol. 3 |
| ASIN / ISBN | **none** / **none** |
| Formats built | **None final.** Pilot plates proof only |
| Prices | HC $29.99, PB $19.99 — hypothesis. (Kindle modelled at a **negative** royalty and is correctly not offered) |
| Words / pages | 238pp modelled, 34,000-word target; 101 puzzle drafts written |
| Category | GAM014000. Adults 25–55, escape-room / Cain's Jawbone / Journal 29 audience |
| Website status | Loaded, `draft` |
| Direct-sale eligible | **No — unfinished** |

**Blockers:** **IN PRODUCTION, NOT FINISHED.** 101 drafts written, **0 verified, 0 final**. Gate `phase5` · **KILL GATE: HARD-STOP.** Five external solvers identified, **zero sessions recorded**; the project's own stats call a zero-session pass *"not a pass but a gap"* · **the verification page this book depends on is live in this repository at `/codex-enigmatica/verify`, but the URL printed in the book is `valicepress.com/codex-enigmatica/verify` and the project records `domainRegistered: false`, `deployed: false`.**

> **This is the single most time-critical item in the catalog.** The address is printed on the last leaf of a physical book. If a copy is ever printed before that domain is registered and this site is deployed to it, every printed copy ships with a dead address and the book's central mechanic — an answer that exists nowhere in the book — becomes unresolvable for the reader. Register the domain before printing, not after.

---

## Deliberately excluded from the storefront

| Title | Why |
|---|---|
| **Before You Cut — Book 1: Measure & Diagnose** | 255-page interior exists but has no cover, title page, copyright page, bibliography or index. Substantively: **0 of 43 fit signs and 0 of 129 cause claims are verified** — all `agent_drafted_unverified` — and 0 of 159 figures physically validated. The series kill-gate fails by design on two hard stops (0/3 home sewers, 0/19 physical validations). An independent review produced 149 findings and 132 required revisions. Not a sellable product. |
| **Before You Cut — Books 2 and 3** | Empty scaffolds: four and five files respectively, zero content. Book 3 is additionally blocked on an undecided drafting system. |
| **License & Launch: California Life & Health** | Not a book. Gate `bootstrap`, **0 questions written, 0 manuscript words, 0 built files**, no author name anywhere. Structurally unpublishable under its own architecture: the pipeline hard-codes that no question can be verified without licensed-SME review, while decision K9 states no SME will ever be hired. As written it can never reach phase 4. |
| **Turkish web projects** (tuzun-hafizasi, intikam-yemini, mendiran-vakayinamesi, solgun-kitabe, Fabl) | Web reader applications, not typeset books — no PDF or EPUB exists for any. All dormant since May–June 2026. `tuzun-hafizasi` (63,541 words, v1.0 locked, declared publication-ready) is genuinely the strongest future candidate and would need only a typesetting pass; `intikam-yemini` is a real trilogy-in-progress. |

---

## Cross-cutting notes

- **Branding inconsistency to resolve:** the book projects print **"Vâliçe Press"** (Turkish orthography). This website now uses **"Valice Press"** throughout, per the current instruction, and the domain is `valicepress.com`. These should be reconciled deliberately — a printed book and its website disagreeing about the publisher's own name is the kind of detail readers notice. Since nothing is printed yet, either choice is still open.
- **Trademark exposure:** the sewing series' working name **"TRUE FIT" was formally rejected (K18) for conflict with True Fit Corporation**, but is still hardcoded in six files (three `book_config.json`, three READMEs). The replacement name is "Before You Cut". Clearance itself is `NOT STARTED`.
- **Stale documents that contradict measured data:** World Myths' README (claims Phase 0 / 0 stories), World Games' README vs ROADMAP_PROGRESS (phase disagreement), Mythologica's Kindle price (README $9.99 vs PROJECT_CONTEXT $8.99).
- **Genuine methodological credit where due:** every project generates its statistics from measurement rather than assertion, self-tests its own quality gates, and explicitly forbids inventing ISBNs, ASINs, page counts or prices. That discipline is the only reason this inventory can state its negatives with confidence.
