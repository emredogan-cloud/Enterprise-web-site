# WS-I — Editorial System & Topical-Authority Foundation

A **concrete publishing system** a solo founder can actually run — not a theoretical content plan. Quality > volume. No AI sludge, no keyword stuffing, no thin content. Built on `06-keyword-intent-map.md` and the *Builder's Library* positioning. Compatible with the **freeze-features / content-first** mandate (this *is* the content work).

---

## 1. Editorial operating system

- **Cadence:** **1 substantial piece every 1–2 weeks.** That's it. A sustainable solo rhythm beats a launch spike that dies. ~2 pieces/month → the first two clusters land in ~3 months.
- **Pipeline (per piece):** `brief (from §4) → draft (founder voice) → self-edit against the §8 checklist → publish (markdown in src/content/blog/) → wire internal links (§5) → submit/recrawl (GSC)`.
- **Voice:** calm, literary, first-person-credible (the Vassallo register) — earned opinion + real reading, never listicle filler. The founder's *judgment* is the moat; AI can't fake it.
- **Format home:** the existing blog (`/blog`, categories, tags) — **no new features needed.** Pillars are long-form posts; spokes are focused posts; both already get `BlogPosting` + breadcrumb schema (WS-G).

---

## 2. First-90-days calendar (maps to WS-H execution order)

| Wk | Piece | Cluster | Type | Primary KPI |
|---|---|---|---|---|
| 1 | **Lead magnet:** "The Builder's Stoic Reading Guide" (PDF) + capture on `/` and pillars | A | asset | email |
| 2 | **Pillar:** How to read the Stoics — a builder's reading order | A | pillar | email + rank |
| 4 | **Spoke:** The best translation of *Meditations*, compared | A | spoke (COMM) | edition clicks |
| 6 | **Spoke:** Where to start with Stoicism (and what to skip) | A | spoke (INFO) | email |
| 8 | **Pillar:** Own your ebooks — a guide to DRM-free reading | B | pillar | email |
| 10 | **Spoke:** The best DRM-free ebook stores (an honest map) | B | spoke (COMM) | brand/email |
| 12 | **Spoke:** Stoicism for builders, founders & engineers | A↔C bridge | spoke (INFO) | anchor-book interest |

*Cluster C (builder/technical) enters only alongside the founder's anchor book + build-in-public — it supports, it doesn't lead.*

---

## 3. Article templates (archetypes)

**Every template ends with:** (a) a **curated-edition** link + **newsletter** capture, (b) ≥1 sibling-spoke link + pillar link, (c) answer-extractable structure (§7), (d) `BlogPosting` (auto) + `FAQPage` where there's genuine Q&A.

### T1 — Pillar (reading-guide / topic hub)
`Hook (a real opinion) → who this is for → the reading order/map (scannable, H2 per step) → "if you read one thing" → common mistakes → FAQ → CTA (lead magnet + edition)`. 1,500–2,500 words. Links down to every spoke.

### T2 — Comparison / "which edition" (COMM)
`The decision in one line → comparison table (editions/translations: readability, fidelity, price, format) → recommendation + why → who'd prefer the alternative → FAQ → CTA (the recommended edition)`. The table = the info-gain. This is where a PD title *converts*.

### T3 — Values / manifesto essay (Cluster B)
`A concrete grievance (DRM lock-in) → what ownership actually means → how watermarking ≠ DRM → how to live DRM-free (practical) → CTA (/about + newsletter)`. Opinion-led; links to the catalog as proof-of-values.

### T4 — Utility ("how to X") top-of-funnel
`Direct answer in the first 2 sentences (AEO) → steps → caveats → "why this matters if you own your files" bridge → CTA`. Earns loose-intent volume; bridges to Cluster B.

---

## 4. First publishable cluster — concrete briefs (founder-usable)

> Each brief is enough to sit down and write. **Drafts are the founder's to write** (voice/credibility); these are scaffolds, not ghost-written posts.

**Brief 1 — Pillar: "How to read the Stoics: a builder's reading order"** (T1)
- Query: *where to start with stoicism* · Intent: INFO · Slug: `/blog/stoicism-reading-guide`
- Info-gain angle: a *builder's* sequencing (Epictetus → Marcus → Seneca, with the "why" for makers), not the generic list.
- Outline: who/why → the order (H2 per author, 1 book each) → "read one thing: *Meditations*, this translation" → mistakes (reading Seneca's letters cover-to-cover, skipping Epictetus) → FAQ (Which translation? How long? Religious?) → CTA.
- Internal links: → Brief 2 (translation), → Brief 3 (where-to-start nuance), → `/books/meditations`, → newsletter (lead magnet). Schema: BlogPosting + FAQPage.

**Brief 2 — Spoke: "The best translation of *Meditations*, compared"** (T2) — *the conversion piece*
- Query: *best translation of meditations* · Intent: COMM · Slug: `/blog/best-meditations-translation`
- Info-gain: an honest comparison table — Hays (modern, readable, in-copyright), Long (public-domain, our edition), Hard, Hammond — on readability / fidelity / price / DRM-free.
- Position: "If you want a beautiful, DRM-free, owned copy of the most readable *public-domain* translation, here's ours" → routes to the curated edition while being genuinely useful.
- Internal links: → pillar, → `/books/meditations`, → Brief 3. Schema: BlogPosting + FAQPage.

**Brief 3 — Spoke: "Where to start with Stoicism (and what to skip)"** (T1-lite)
- Query: *is meditations worth reading / where to start* · Intent: INFO · Slug: `/blog/where-to-start-stoicism`
- Info-gain: a *skip list* (what's overrated/archaic) — opinionated, rare in the SERP.
- Links: → pillar, → Brief 2, → newsletter. Schema: BlogPosting + FAQPage.

**Brief 4 — Pillar: "Own your ebooks: a guide to DRM-free reading"** (T3)
- Query: *DRM-free ebooks / own your ebooks* · Intent: INFO/COMM · Slug: `/blog/own-your-ebooks`
- Info-gain: the practical ownership stack (where to buy, how to back up, watermarking vs DRM) + an honest map of DRM-free stores (incl. us, named as the *curated* one).
- Links: → Brief 5, → `/about`, → `/books`, → newsletter. Schema: BlogPosting + FAQPage.

**Brief 5 — Spoke: "Stoicism for builders, founders & engineers"** (T1-lite, A↔C bridge)
- Query: *stoicism for founders/engineers* · Intent: INFO · Slug: `/blog/stoicism-for-builders`
- Info-gain: maps specific Stoic ideas to building (control dichotomy → scope; premeditatio → incident review). The wedge that makes the soul-spine *on-brand* for the Builder's Library.
- Links: → Cluster A pillar, → (later) anchor book. Schema: BlogPosting.

---

## 5. Internal-linking operational plan
- On publish, add the piece to its **pillar's** spoke list and to ≥1 **sibling** spoke (bidirectional).
- Every pillar carries the **lead-magnet capture** + a **curated-edition** link above the fold of the CTA.
- PDPs already link to the **author entity** (WS-G) + related shelf; ensure new editorial links *into* the relevant PDP.
- Quarterly: prune/redirect any piece that drifts off-cluster (keep the graph tight; avoid orphan posts).

---

## 6. First authority plays (off-page; founder-led)
1. **Lead magnet → newsletter** = the compounding owned-audience play (do first).
2. **Anchor book** (founder's systems/AWS book) = the flagship linkable asset + build-in-public on X/HN ("Show HN"). Highest-leverage authority move (Vassallo precedent).
3. **Provenance as citable trust** — publish the *Meditations* edition-source transparency (Gutenberg #15877 / Long 1862) as a structured, citable page; the DRM-free/ownership essays are naturally link-worthy to the ethos community.
4. **Entity `sameAs`** — wire founder X/GitHub + the anchor book into Organization/Person once they exist (don't fabricate).
5. **Blog RSS** for syndication/citation.

---

## 7. AI-search / AEO guidelines (answer-engine visibility)
- **Lead with the answer:** first 1–2 sentences directly answer the title's question (snippet + LLM extraction).
- **Comparison tables + definition blocks** = high info-gain, easily lifted by answer engines.
- **FAQ blocks** with real Q&A → `FAQPage` schema (only where genuine).
- **Provenance + named opinions** → citability + E-E-A-T.
- **AI crawlers welcome** (per the WS-G robots stance) — being cited *is* distribution for a zero-authority brand.

---

## 8. Definition-of-done per piece (self-edit checklist)
☐ Maps to exactly one owning query (06 master table) · ☐ Answer-first opening · ☐ Real info-gain (a table, a skip-list, a named opinion — not a summary of what's already ranking) · ☐ Links up to pillar + ≥1 sibling + a curated edition + newsletter · ☐ FAQ/schema where genuine · ☐ No filler, no stuffing, founder voice · ☐ CWV unaffected (markdown, no heavy embeds) · ☐ Submitted in GSC.

---

## 9. Anti-patterns (hard no)
PD-title "free PDF" targeting · AI-generated bulk posts · keyword-stuffed thin pages · summarizing the SERP without new information · programmatic category text · schema for nonexistent Q&A · launching > publishing cadence the founder can't sustain.
