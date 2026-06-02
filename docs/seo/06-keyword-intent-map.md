# WS-H — Keyword → Intent → Topic Map

**Positioning:** *The Builder's Library* — a curated, DRM-free boutique for builders & deep thinkers. **Public-domain titles are top-funnel + newsletter + authority, never commodity "free PDF" traffic.** SEO's job here = compounding **top-of-funnel discovery + email capture**, feeding the newsletter (the primary channel). This map is the source of truth for what to write and what NOT to chase. Cross-checked against `01-research-report.md` (the 3-cluster thesis) and the founder "freeze-features, content-first" mandate.

---

## 0. The one rule that governs every target

> **Match page purpose to query intent. Never sell a PD title on a page competing with free.**

PD-title queries (`"Meditations PDF"`, `"<classic> free download"`) are **NOT targets** — the SERP is owned by Gutenberg / Standard Ebooks / Internet Archive / Amazon, and the searcher wants *free*. We harvest the *adjacent* intent (which edition? where to start? is it worth it?) where a **curated boutique can win on quality signal**, and route it to newsletter / a curated edition.

Intent classes used below: **INFO** (informational) · **COMM** (commercial-investigation) · **TXN** (transactional) · **NAV** (navigational).

---

## 1. Topic clusters (pillar → supporting)

### Cluster A — Stoicism & deep-thinking (the "soul spine" top-funnel) 🥇
*Highest winnable volume; brand-defining; strongest email-capture engine.*

- **Pillar:** `/blog/stoicism-reading-guide` — "How to read the Stoics: a builder's reading order" (INFO/COMM).
- **Supporting spokes:**
  | Article | Target query | Intent | Why winnable |
  |---|---|---|---|
  | Best translation of *Meditations* (compared) | "best translation of meditations" | COMM | Edition/quality intent — boutique can out-signal scans |
  | Where to start with Stoicism | "where to start with stoicism" | INFO | Evergreen, snippet-friendly, low brand-authority barrier |
  | Marcus Aurelius / Seneca / Epictetus — who to read first | "seneca vs marcus aurelius vs epictetus" | INFO | Comparison = info-gain; entity-rich |
  | Is *Meditations* worth reading (and how) | "is meditations worth reading" | INFO | Decision intent → funnels to curated edition |
  | Stoicism for builders / founders / engineers | "stoicism for engineers/founders" | INFO | **Audience-fit wedge** — ties soul-spine to Builder's Library |

→ **CTA path:** spoke → pillar → *curated Meditations edition* (`/books/meditations`) **+ newsletter** (lead magnet: "The Builder's Stoic Reading Guide" PDF).

### Cluster B — DRM-free / ownership (the values + differentiator) 🥈
*Exactly the target audience (Tor/O'Reilly/Defective-by-Design ethos); competitors are utilitarian.*

- **Pillar:** `/blog/own-your-ebooks` — "Own your ebooks: a guide to DRM-free reading" (INFO/COMM).
- **Supporting spokes:** `"DRM-free ebook stores"` (COMM, listicle where we can be *the curated* entry), `"what is social DRM / watermarked PDF"` (INFO), `"ebooks not locked to Kindle"` (INFO), `"how to read a PDF on Kindle/iPad/e-reader"` (INFO, high-volume utility → soft brand intro), `"Leanpub / Gumroad alternative for readers"` (COMM, brand-adjacent).
- **CTA path:** spoke → pillar → `/about` (ownership manifesto) + newsletter.

### Cluster C — Builder / technical (the revenue engine; SEO = *supporting*) 🥉
*Low search volume; real distribution is X/HN. SEO is a durable secondary surface, not the primary play.*

- **Pillar:** the **founder's anchor book** landing page + `/blog/the-good-parts-of-<topic>` companion (INFO).
- **Supporting spokes:** specific systems/AWS/AI topics from the anchor book; author/topic queries; `"best DRM-free technical books"` (COMM). Volume is small — write these to *support* build-in-public, not to chase search.

---

## 2. Keyword → intent → owning page (master table)

| Query (representative) | Intent | Owning page (type) | Internal-link path → conversion |
|---|---|---|---|
| best translation of meditations | COMM | `/blog/best-meditations-translation` (editorial) | → `/books/meditations` (curated edition) + newsletter |
| where to start with stoicism | INFO | `/blog/stoicism-reading-guide` (pillar) | → spokes + `/categories/<stoicism>` + newsletter |
| stoicism for builders | INFO | `/blog/stoicism-for-builders` (spoke) | → pillar → anchor-book cluster |
| DRM-free ebook stores | COMM | `/blog/own-your-ebooks` (pillar) | → `/about` + newsletter |
| how to read a PDF on Kindle | INFO | `/blog/read-pdf-on-kindle` (utility) | → DRM-free pillar → newsletter |
| "<classic> free PDF" | INFO/"free" | **DO NOT TARGET** (lose to free) | — (harvest only via COMM-edition angle above) |
| buy DRM-free ebooks | TXN | `/books` (catalog) | → PDP → checkout |
| <author name> | NAV/INFO | `/authors/<slug>` (entity, WS-G ProfilePage) | → their titles |
| <category/genre> | NAV/INFO | `/categories/<slug>` (hub, breadcrumb WS-G) | → PDPs |

---

## 3. SERP opportunity assessment

| Opportunity | Verdict | Note |
|---|---|---|
| Stoic/deep-thinking INFO (Cluster A) | ✅ **Pursue first** | Real volume; quality+curation can rank; best email engine |
| "which edition / best translation" COMM | ✅ Pursue | Boutique out-signals scans; routes to a paid edition |
| DRM-free/ownership (Cluster B) | ✅ Pursue | Perfect audience fit; differentiated; mid volume |
| Utility ("read PDF on Kindle") | ◻︎ Selective | High volume but loose intent; 1–2 pieces as top-of-funnel nets |
| Builder/technical INFO (Cluster C) | ◻︎ Support only | Low volume; primary channel is X/HN; write to support BIP |
| PD-title "free PDF" TXN/INFO | ❌ **Do not target** | Lose to Gutenberg/SE/Amazon; intent mismatch |
| Generic "buy ebooks" head | ❌ Skip | Amazon/Kobo own it (per strategy: "don't enter general ebook") |

---

## 4. Cannibalization review

- **/books vs /categories/[slug] vs /genres** — three browse surfaces risk competing for the same head terms with thin content. **Resolution:** `/books` = full catalog (canonical browse); `/categories/[slug]` = the indexable, *content-bearing* taxonomy hub (gets `categories.description` once migrated — WS-F); `/genres` = a *discovery* surface that should **link into** `/categories/[slug]` and **not** target distinct head terms (keep it as UX discovery, lighter SEO weight). Avoid creating `/genres/[slug]` (already decided in code).
- **Pillar vs spokes** — each spoke targets a *distinct* long-tail; the pillar owns the head term. No two pages target the same primary query (enforced by the master table's one-owning-page rule).
- **Blog category vs tag hubs** — keep tag hubs `noindex`-able if they thin-duplicate categories; let blog *category* hubs be the indexable topic pages.

---

## 5. Content gap analysis (what's missing today)

1. **No editorial top-funnel** — only 3 brand posts; zero of the Cluster A/B intent above is written. **This is the single biggest growth gap.**
2. **No pillar pages** — no Stoicism or DRM-free pillar to anchor clusters + collect internal links.
3. **No edition/quality content** — the one place PD titles *can* win (best-translation/which-edition) is unwritten.
4. **Thin taxonomy hubs** — `/categories/[slug]` have no descriptive copy (fixed structurally by `categories.description`, now needs content).
5. **No author depth** — author pages have entity schema (WS-G) but sparse bios → weak E-E-A-T.
6. **No lead magnet** — newsletter (the primary KPI) has no value-backed capture asset.

---

## 6. Internal-link strategy map

```
            ┌──────────────── NEWSLETTER (primary KPI) ◀── lead magnet on every pillar
            │
  spoke ──▶ pillar ──▶ curated edition (PDP) ──▶ checkout
   │           │
   │           └──▶ taxonomy hub (/categories/[slug])
   └──▶ related spoke (same cluster)

  Cross-cluster bridges:
   Stoicism-for-builders (A) ──▶ anchor book (C)
   Own-your-ebooks (B)       ──▶ /about manifesto ──▶ any PDP
   Any PDP                   ──▶ author entity (/authors/[slug]) ──▶ their other titles
```

**Rules:** (a) every editorial piece links **up** to its pillar + **down**/across to ≥1 sibling spoke; (b) every pillar links to a **curated edition** *and* the **newsletter**; (c) PDPs link to the **author entity** (WS-G) and the related shelf; (d) breadcrumbs (WS-G/WS-F) provide the crawl-depth spine on every hub.

---

## 7. Execution order (feeds WS-I)

1. **Lead magnet** (Stoic reading-guide PDF) — unblocks newsletter capture on every future pillar.
2. **Cluster A pillar + 2 highest-intent spokes** (best-translation, where-to-start) — fastest winnable + best email engine.
3. **Cluster B pillar + "DRM-free stores" spoke** — audience-fit + differentiation.
4. **Taxonomy hub copy** (post `categories.description` migration).
5. **Author bios** (E-E-A-T) for live authors.
6. **Cluster C** — only alongside the founder's anchor book / build-in-public (support, not lead).
