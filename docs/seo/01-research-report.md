# SEO Deep Research Report — Phases 1–7

**Author:** Senior Technical SEO Architect (agent)
**Inputs:** Phase 0 discovery + validation; the founder strategy memo (`BOOKSTORE_STRATEGY_ROADMAP_TR.md`); live SERP validation; codebase ground-truth.
**Mode:** Research only. No implementation. No decisions executed.

---

## 0. Strategic spine (read this first — it governs every phase)

Three facts reframe *all* SEO work here. Ignoring them produces generic, wrong advice.

**(A) This is not a generic bookstore. It is "The Builder's Library."**
Per the founder's own strategy: a curated, DRM-free *boutique* ("Criterion of ideas") with four content layers — a **technical/systems/AI revenue engine**, a **deep-work/mental-models bridge**, a **hard-SF cultural bridge**, and a **public-domain Stoic "soul spine"** (Meditations, Seneca, Epictetus). The moat is **curation + presentation + ownership experience + founder credibility**, explicitly *not* the content itself.

**(B) The PD soul spine is a brand/top-funnel asset, NOT an SEO revenue target.**
Live SERP for *"Meditations Marcus Aurelius free PDF"* is wall-to-wall **free**: Internet Archive, Standard Ebooks, Project Gutenberg, Scribd, AliceAndBooks. Competing transactionally for PD book titles is unwinnable (you lose to free *and* to Amazon). The strategy doc says the same: *"PD felsefe ~zero marginal WTP; ruh/lansman, gelir değil."* → **SEO must route PD-title intent into editorial/top-funnel/email, never a buy-now PDP.**

**(C) The founder's strategist mandates: FREEZE features, build content + the newsletter.**
Risk #5 ("technical over-build") is marked *"already happened."* Risk #4 ("discoverability — SEO/distribution") and #2 ("solo burnout") are the top threats. **Implication for us:** the right SEO program is **lean enabling-infrastructure → then editorial + measurement**, sequenced to feed *the newsletter* (named "the only real distribution channel"). Any recommendation that amounts to "build more product features" is **out of policy** and is flagged as such below.

**SEO's realistic role here:** not a primary acquisition channel at launch (a new `.vercel.app` domain with ~zero authority won't rank fast). It is **(1)** the discoverability *substrate* (crawlable, structured, measurable) so that when content + audience arrive they compound, and **(2)** a **top-of-funnel + email-capture** engine for evergreen informational intent (Stoicism, DRM-free/ownership, "which edition", builder topics). Primary distribution remains build-in-public (X/HN) + newsletter, per strategy. SEO is the compounding long-game underneath it.

---

## Phase 1 — Search Strategy + Search Intent

**1. Current state.** Catalog is effectively empty (1 real book: *Meditations*; the rest are `DEMO_BOOKS` fallbacks). FTS is `'english'`. Discovery surfaces exist (`/books`, `/categories/[slug]`, `/genres`, `/authors/[slug]`, `/search`) but carry no keyword-targeted copy. Three brand blog posts. No keyword→intent→page map exists. There is no demonstrated targeting of any query.

**2. Risks.**
- **SERP intent mismatch (severe):** PDPs for PD titles target buyers who actually want *free* → high bounce, no ranking, wasted crawl. Selling *Meditations* on a page that competes with Gutenberg is a structural mismatch.
- **Cannibalization / thin-overlap:** `/categories` vs `/genres` are two discovery taxonomies (memory: distinct but confusable); `/books` + `/categories/[slug]` + `/genres` can compete for the same head terms with near-identical thin content. `/search?q=` is correctly `noindex`.
- **No demand validation:** building landing pages before validating any query repeats the over-build trap.

**3. Opportunities (the actual play).**
- **Editorial top-funnel around the soul spine** — high-volume informational intent the brand *can* win and that feeds email: *"best translation of Meditations"*, *"Stoicism reading order"*, *"Marcus Aurelius / Seneca / Epictetus — where to start"*, *"is Meditations worth reading"*. These are commercial-investigation/informational, snippet-friendly, and **funnel a free-seeking audience into a curated edition + newsletter** rather than fighting them head-on.
- **"DRM-free / own your books" values cluster** — *"DRM-free ebook stores"*, *"Leanpub/Gumroad alternative for readers"*, *"own your ebooks forever"*, *"ebooks that aren't locked to Kindle"*. Low-to-mid volume but **exactly the audience** (Tor/O'Reilly/Defective-by-Design ethos), and competitors here are utilitarian (the boutique angle differentiates).
- **Builder/technical revenue-engine cluster** — once the founder's anchor book + indie titles exist: topic + author + "the good parts of X" style queries. **Caveat:** low search volume; real distribution is X/HN, so SEO is *supporting*, not primary.
- **Curation/edition-quality angle** — "which edition", "best PDF edition of [classic]", provenance — where a *curated premium edition* can out-signal free scans on quality intent.

**4. Technical implications.** Needs: (a) a keyword→intent→page map artifact; (b) editorial content infrastructure (blog already supports categories/tags — sufficient, do not build more); (c) intent-correct page typing — informational pages must *not* masquerade as PDPs; (d) internal-link wiring from editorial → curated editions + newsletter. No schema/route changes required to *start* — this is a content + mapping exercise.

**5. Estimated impact.** Foundational/compounding. Near-term traffic ≈ low (domain authority ~0). 6–12 mo upside is real but **content-gated**: a handful of well-targeted Stoicism/DRM-free informational pieces can earn long-tail + AI-answer citations and email signups. The dominant KPI is **email capture**, not sessions.

**6. Dependencies.** Founder content cadence (Phase 5/roadmap); measurement (Phase 6 — to see which clusters convert); the "freeze features" mandate (this phase is *content*, which is on-policy).

**7. Recommended direction.** Produce a **keyword→intent→page map** with three priority clusters (Stoic/deep-thinking editorial; DRM-free/ownership values; builder topics) — each mapped to *intent-correct* page types and an internal-link path ending at **newsletter or a curated edition**. Explicitly classify PD-title "free PDF" intent as **do-not-target-transactionally**. Validate the top ~20 terms with a keyword tool before writing (don't mass-produce on guesses).

**8. Alternatives considered.** (i) *Programmatic PDP-per-classic for SEO* — rejected (loses to free; thin-content + intent-mismatch risk). (ii) *Compete for generic "buy ebooks"* — rejected (Amazon/Kobo dominate; strategy says "don't enter general ebook"). (iii) *No SEO content, pure X/HN* — rejected as the *only* plan (forfeits the compounding evergreen layer the strategy itself lists under Risk #4 mitigation: "editorial SEO").

---

## Phase 2 — Technical SEO Expansion

**1. Current state (strong foundation).** SSG/ISR-first; per-page `generateMetadata`; textbook canonical + `robots` noindex discipline; typed JSON-LD (Book/Product/Offer/Breadcrumb on PDP, BlogPosting on posts); dynamic sitemap; native CSP + security headers; Next/Image + WebP; self-hosted fonts. Phase 0 added robots.txt + home Organization/WebSite. **This is well above median.**

**2. Risks.**
- **Metadata architecture fragility (active finding):** `openGraph` is *replaced per-segment*, so the 17 indexable pages silently dropped `og:site_name` and the default OG image. This is a **drift class**, not a one-off — any future metadata default will leak the same way.
- **Env-safety landmine (R1):** the `??` empty-string trap; no build-time validation of `NEXT_PUBLIC_APP_URL`. A single bad env value silently corrupts *all* canonical/OG/JSON-LD/robots/sitemap URLs.
- **Domain (R2):** `.vercel.app` is non-brandable, accrues authority you can't fully migrate cleanly later, and is a weak trust signal.
- **Crawl shape:** `/books?category=…` client-filtered (canonical `/books` ✓, safe), but as catalog grows, faceted state + thin `/categories` vs `/genres` overlap could create low-value near-duplicates.

**3. Opportunities.** Centralized metadata factory (kills the drift class); BreadcrumbList on *all* hubs (only PDP has it); `Person`/`ProfilePage` on author pages; `ItemList`/`CollectionPage` on catalog/category; `FAQPage` on editorial/help; AVIF; env-validation as reusable infra; brand-domain migration done *once, early, correctly*.

**4. Technical implications — Metadata architecture decision (you asked for a 6-option comparison).**

The constraint: Next.js merges metadata **shallowly across segments**; a child `openGraph` **replaces** the parent's. So site-wide OG/Twitter/locale defaults cannot live only in the root layout once pages define their own `openGraph` (they all do).

| # | Approach | Maintainability | Scalability | Review complexity | Upgrade resilience | SEO correctness | Cleanliness |
|---|---|---|---|---|---|---|---|
| 1 | **Explicit per-page** `images:[…]` line | Low (drift returns) | Poor (every new page must remember) | Low per-diff, high in aggregate | Medium | Fragile (easy to forget → silent gaps) | Low (copy-paste) |
| 2 | **Shared metadata abstraction** (constants + helper) | High | Good | Low | High | Strong (one source of truth) | High |
| 3 | **Hybrid** (factory for templated pages; explicit for bespoke) | High | Good | Medium | High | Strong | High |
| 4 | **Helper factory** `buildPageMetadata({title,description,path,type,image?})` | **High** | **Strong** | **Low (uniform call-site)** | **High** | **Strongest** (defaults can't be forgotten) | **High** |
| 5 | **Layout-inheritance only** (root `openGraph.images`) | n/a | n/a | n/a | n/a | **Broken here** (segment replacement defeats it — proven) | n/a |
| 6 | **Superior synthesis →** factory (#4) + typed config + incremental adoption | **Highest** | **Highest** | Low after rollout | **Highest** | **Strongest** | **Highest** |

**Recommendation: Option 6 — a typed `buildPageMetadata()` factory, adopted incrementally (hybrid rollout).** It (a) makes the default OG image and `siteName`/locale *un-droppable* (fixes the proven drift), (b) gives every page one uniform, reviewable call-site, (c) centralizes future schema/metadata changes (one edit, all pages), (d) survives Next upgrades (the merge semantics are encapsulated). Option 1 (explicit line) is *faster this week* but re-introduces the exact bug class and still leaves `og:site_name` missing — **rejected as the long-term answer** (acceptable only as a stopgap on 2–3 pages if speed is critical). Option 5 is **eliminated by evidence**.

**Technical implications — Env safety as a first-class dependency (you flagged this; it is high-impact).**
URL generation is the spine of canonical/OG/JSON-LD/robots/sitemap. Current robustness: **partial** — `getBaseUrl()` guards empty (`if (!fromEnv)`), but `layout.tsx` (`??`) and `email.ts` (`?? ""`-adjacent) do not, and nothing validates the *shape* of the env value. Recommended hardening, in order:
1. **Fix `??`→`||`** in `layout.tsx` (R1) — land the existing feature-branch fix or apply it.
2. **Single source of truth:** one `siteUrl` config module that all of `layout`, `seo.ts`, `robots`, `sitemap`, `email` import — no scattered `process.env` reads.
3. **Build-time validation:** assert `NEXT_PUBLIC_APP_URL` is a valid absolute `https` URL at build (zod or a 5-line guard); **fail the build** in CI/prod when absent/malformed, *warn* in dev. This converts a silent sitewide SEO outage into a loud build error.
4. **Self-healing fallback:** when unset, derive from `VERCEL_PROJECT_PRODUCTION_URL` (stable prod alias) before localhost — so a forgotten env degrades gracefully instead of emitting `localhost` canonicals.
5. Optional: a `register()` assertion in `instrumentation.ts` for runtime visibility.

**5. Estimated impact.** Metadata factory: medium SEO (correct OG/Twitter everywhere → social/AI previews on every shared URL; consistent entity signals) + high maintainability. Env hardening: low *normal-case* impact but **eliminates a catastrophic tail risk** (sitewide canonical corruption) — high expected value. AVIF: minor LCP/bytes. Domain migration: high long-term (brand/authority/trust) if done before content scales.

**6. Dependencies.** Factory rollout touches ~17 files (bounded, mechanical) — schedule against the OG scope fork. Env validation depends on R1 fix. Domain migration depends on a *business* decision (brand name/domain) and must precede large content/authority investment to avoid a costly re-canonicalization later.

**7. Recommended direction.** (a) Resolve the OG fork *via* the factory (one decision solves both). (b) Ship env hardening (1→4) as a small, high-EV infra PR. (c) Add BreadcrumbList/Person/ItemList schema as hubs gain content. (d) **Research and plan** the brand-domain move **now** (recommendation + runbook + risk analysis) — but **execution is owner-gated**: no purchase, DNS, Vercel, or production change without explicit approval; when approved, migrate with 301s + canonical update **before** authority accrues. (e) Add AVIF.

**8. Alternatives considered.** Explicit-line OG (rejected as long-term — drift). `vercel.json`/`vercel.ts` headers vs in-config (current native `headers()` is fine — keep). Nonce-based CSP (defer — already noted by the team; not blocking). Keeping `.vercel.app` (rejected for a real storefront — weak trust/brand, harder later).

---

## Phase 3 — On-Page SEO

**1. Current state.** One `<h1>` per page-type hero (good) — **except `legal-shell.tsx` emits 2 `<h1>`** (R5). Home `<h1>` is a brand slogan ("Find it. Own it. Read it anywhere.") — brand-correct, keyword-light. Content is **thin/nascent**: `categories` has **no description column** (category hubs = heading + grid), author `bio` exists but is sparsely populated, 3 blog posts total. Cinematic scenes are **CSS backgrounds** (decorative, correctly alt-less); content images go through `CoverImage`/`AssetImage`. Internal linking = header nav + footer + related-books shelf + explore strip + home category/featured sections.

**2. Risks.** Thin/duplicate hub pages (category vs genre vs catalog) under-deliver and can be filtered as low-value; sparse content gives crawlers/LLMs little to extract; duplicate-H1 on legal pages; keyword-light H1s forgo on-page signal (minor); no visible breadcrumb trail (UX + crawl-context loss).

**3. Opportunities.** Add a `categories.description` field → unique editorial copy per hub (curation voice = the moat, on-page). Populate author bios (E-E-A-T + entity). Editorial blog as the content engine (hub-and-spoke: post → book → author → category). Visible breadcrumbs (UX + BreadcrumbList). AVIF + verified alt on covers/portraits. Make the soul-spine pages *editorial* (reading guides, provenance) rather than thin PDPs.

**4. Technical implications.** A schema change (`categories.description`) → migration (`db:generate`/`db:migrate`) — small, but a DB change (sequence in roadmap, respects "freeze *features*" since this is content-enabling, not a new feature). Breadcrumb UI = one shared component + JSON-LD. Alt-text audit on `CoverImage`/`AssetImage` props. None are large.

**5. Estimated impact.** Medium-high *once content exists* — unique hub copy + editorial depth is what lets a curated boutique out-rank thin PD vendors on quality/intent queries. Low if pages stay thin. Duplicate-H1 fix = small correctness win.

**6. Dependencies.** Phase 1 keyword map (what each hub should say); founder editorial cadence; Phase 2 schema additions.

**7. Recommended direction.** (1) Fix `legal-shell` double-H1. (2) Add `categories.description` + write curation copy for live categories. (3) Populate author bios for live authors. (4) Stand up the editorial engine against the Phase 1 map (start with 3–5 Stoic/DRM-free pieces). (5) Add visible breadcrumbs + alt audit. Defer keyword-tuning H1s (low ROI now).

**8. Alternatives considered.** Programmatic thin category text (rejected — looks auto-generated, hurts a *curation* brand). Leaving categories description-less (rejected — guarantees thin hubs). Heavy H1 keyword-stuffing (rejected — off-brand, low value).

---

## Phase 4 — UX / CRO / SEO

**1. Current state.** Clean cinematic UX; header nav + footer; discovery via `/books` (client filter/sort/page, canonical-safe), `/categories`, `/genres`, `/authors`, `/search`. Conversion path: cart → Paddle (MoR) → entitlement → library/reader. Trust: moderated reviews, DRM-free/ownership messaging, secure-checkout copy. Home has a `NewsletterSection` + `/api/newsletter`. Hero CTAs: "Browse Catalog" (→/books) and "Watch Demo" (→`#why`, **no actual demo**).

**2. Risks.** **No inventory = nothing to convert** (the dominant CRO problem; demo books route to `/search`, not real PDPs → dead-ends/confusion). Two overlapping discovery taxonomies (categories vs genres) add decision friction. "Watch Demo" is a slightly dishonest CTA (anchors to a section, no demo). Newsletter — the strategy's #1 channel — should be the *primary* conversion, but competes with buy CTAs for attention.

**3. Opportunities.** Make **email capture the primary CRO goal** at launch (lead magnet: a curated Stoic reading guide / sample of the founder's anchor book). Strengthen information scent from editorial → curated edition → newsletter. Consolidate or clearly differentiate categories vs genres. Honest CTA ("Preview a sample" instead of "Watch Demo"). Surface ownership/DRM-free trust higher (it's the differentiator the target audience cares about).

**4. Technical implications.** Mostly content/CRO config, not new features (on-policy). Newsletter capture + lead magnet delivery (Resend already wired). Minor copy/IA edits. No heavy build.

**5. Estimated impact.** High on the metric that matters now (**email signups**); medium on eventual purchase conversion (gated on inventory). Reducing discovery-taxonomy friction = small-medium.

**6. Dependencies.** Inventory (founder); lead-magnet asset; Phase 6 event tracking (to measure capture + funnel).

**7. Recommended direction.** Re-orient CRO around **newsletter capture** (prominent, value-backed) until inventory exists; fix the "Watch Demo" CTA; decide categories-vs-genres (merge or sharpen); keep the purchase path as-is (it's solid). Treat reviews/ownership as primary trust surfaces.

**8. Alternatives considered.** Pushing purchase-CRO now (rejected — no inventory; premature). Removing genres entirely (deferred to a data-informed call). Aggressive popups (rejected — off-brand for a calm-literary boutique; one tasteful capture beats interruptive).

---

## Phase 5 — Off-Page / Authority

**1. Current state.** New `.vercel.app` domain; ~zero backlinks/authority; no PR; no founder-brand presence wired to the site. The strategy doc names authority sources explicitly: **build-in-public (X/HN), founder credibility (AWS/systems), the founder's own anchor book, the newsletter, and indie-author relationships.**

**2. Risks.** Authority is the slowest lever and the site starts at zero on a weak domain (R2 compounds this). Traditional link-building/PR is off-strategy and burnout-inducing for a solo founder (Risk #2). Without the anchor book/founder presence, there's no linkable, citable asset.

**3. Opportunities.** **Founder-led topical authority** in "builder's library / DRM-free curated technical books": (a) the anchor book as a flagship *linkable asset* + "Show HN" / X build-in-public; (b) values-content on DRM-free/ownership that the ethos community (Defective-by-Design, Tor/O'Reilly readers, r/selfpublishing) naturally links/shares; (c) edition-provenance/transparency pages (the *Meditations* source report is already a citable trust artifact) that earn references; (d) curated "drops" as PR-able events; (e) `sameAs` entity links (founder X/GitHub, the book) for a coherent brand graph.

**4. Technical implications.** Mostly off-site + a few on-site enablers: `sameAs` in Organization/Person schema; a clean, linkable `/about` (E-E-A-T); shareable OG images (Phase 0/2); RSS for the blog (citation/syndication). Brand domain (R2) should precede serious authority investment.

**5. Estimated impact.** High but slow and **founder-time-gated**. The single highest-leverage authority asset = the founder's anchor book + build-in-public (matches the Vassallo precedent the strategy cites). Generic backlinking = low/negative ROI here.

**6. Dependencies.** Founder content/presence; brand domain decision; newsletter; the anchor book.

**7. Recommended direction.** Forgo traditional link campaigns. Invest authority in: anchor book + build-in-public, values/provenance content as linkable assets, `sameAs` entity wiring, and newsletter-driven community. Plan the brand-domain move (owner-gated; research/plan only until approval) before this compounds.

**8. Alternatives considered.** Paid links / guest-post farms (rejected — risk + off-brand). Generic digital-PR agency motion (rejected — wrong audience, founder-time sink). Waiting for organic links with no asset (rejected — links need a *reason*; build the asset first).

---

## Phase 6 — Analytics / Measurement

**1. Current state.** **Vercel Analytics + Speed Insights only** (cookieless pageviews + field CWV). **No GA4, no GTM, no Search Console verification, no ecommerce events** (view_item/add_to_cart/begin_checkout/purchase), no newsletter-signup event, no funnel, no attribution. The business whose #1 risk is *discoverability* currently **cannot measure SEO impact, funnel, or which content pillar converts.**

**2. Risks.** Flying blind: post-launch you can't tell which cluster/pillar earns traffic or revenue, can't prove SEO ROI, can't see the newsletter funnel (the key channel). Attribution blind spots for X/HN/newsletter inbound. Without GSC, no query/index/coverage data — *you can't run SEO at all.*

**3. Opportunities.** A **lightweight, privacy-respecting measurement layer**: GSC (verification + sitemap submit) = non-negotiable; a typed event layer on Vercel Analytics **custom events** (cookieless — fits KVKK + the privacy-valuing audience) for `view_item`, `add_to_cart`, `begin_checkout`, `purchase`, `newsletter_signup`, `sample_read`, `search`; UTM discipline for X/HN/newsletter; pipe Speed Insights field CWV into the SEO loop. GA4 only if consented (KVKK) — likely **skip** in favor of cookieless custom events.

**4. Technical implications.** GSC verification = one meta tag or DNS record (trivial; works with current metadata). Event layer = a small typed wrapper around `@vercel/analytics` `track()` at existing mutation points (cart actions, checkout, newsletter) — *instrumentation, not features* (on-policy). No cookie banner needed if cookieless. Sitemap already submittable.

**5. Estimated impact.** **Foundational and high-EV** — every later optimization's measurability depends on this. It is the cheapest high-leverage work in the entire program and directly serves Risk #4. Arguably the **first** thing to do after the metadata/env infra.

**6. Dependencies.** **None blocking — do NOT wait for the domain decision (R2).** Verify GSC on the **current canonical domain** (`enterprise-web-site.vercel.app`) immediately and begin data collection *now*; GSC supports a later **Change-of-Address**, so a brand-domain move is migration-capable (re-verify + change-of-address then). The event layer needs only the existing action points (already present). Measurement must not stall.

**7. Recommended direction.** (1) **Immediately** verify GSC on the *current canonical domain* + submit sitemap — **measurement must not stall on the domain decision**; treat collection as immediate, foundational, and migration-capable (GSC Change-of-Address later). (2) Add the cookieless typed event layer at existing funnel points. (3) Define a tiny KPI set: email signups, purchases, top landing pages, query coverage, CWV. (4) UTM conventions. Prefer cookieless; defer/skip GA4 unless consented.

**8. Alternatives considered.** GA4 + GTM as default (deprioritized — cookie/consent burden under KVKK, heavier, and Vercel custom events cover the need). Bespoke analytics DB (rejected — over-engineering, violates "freeze features"). No measurement until traffic (rejected — you must measure *from* launch to learn).

---

## Phase 7 — Modern / AI-Search Readiness

**1. Current state.** Clean SSG HTML + JSON-LD (Book/Product/Offer/Breadcrumb/BlogPosting; Organization/WebSite/SearchAction pending from Phase 0) = a solid machine-readable baseline. Authors appear as `Person` only *inside* book graphs (no standalone author entity). No `FAQPage`. No explicit AI-crawler policy (current `User-agent: *` allow-all covers them by default). Edition-provenance transparency exists as prose (the *Meditations* source report).

**2. Risks.** Without entity consolidation (`sameAs`, Person/Organization) the brand has no coherent knowledge-graph identity → weak in AI answers and knowledge panels. Thin content gives answer engines little to cite. No FAQ/structured Q&A → missed snippet/answer extraction. If AI crawlers were blocked, the new brand forfeits free AI-answer visibility (it shouldn't be — for a discovery-starved brand, *being cited by AI is distribution*).

**3. Opportunities.** **Entity SEO for a builder brand:** Organization + founder `Person` with `sameAs` (X/GitHub/anchor book) = a strong, coherent graph (the founder's real credibility is the asset). `ProfilePage`/`Person` on author pages. `FAQPage` on editorial/help/PDP ("is this DRM-free?", "what formats?", "best translation?"). `ItemList`/`CollectionPage` on catalog/category. **Provenance as citable trust** — surface edition sourcing (PD edition reports) as structured, citable content (LLMs and E-E-A-T both reward it). **AEO/snippet content** for the informational clusters (Stoicism, DRM-free, "which edition"). Deliberate, generous AI-crawler policy = free answer-engine reach.

**4. Technical implications.** All additive schema + content; no architecture change. Best delivered *through* the Phase 2 metadata factory (so entity defaults are consistent). FAQ/Person/ItemList are small typed `schema-dts` additions (the codebase already does this well). AI-crawler stance = a documented `robots.ts` decision (allow reputable bots; keep private-path disallows).

**5. Estimated impact.** Medium-high and **increasingly the point** — for a brand whose audience lives in dev/AI communities, AI-answer citations + a clean entity graph may matter more than classic blue-link rank. High leverage per unit effort because the structured-data muscle already exists.

**6. Dependencies.** Founder identity/credentials surfaced (about/author entity); content for FAQ/AEO (Phase 1/3); entity consistency via Phase 2 factory; brand domain (entity URLs should be permanent).

**7. Recommended direction.** (1) Land Phase 0 Organization/WebSite. (2) Add founder/author `Person` + `sameAs` once profiles/anchor book exist. (3) `FAQPage` on editorial + PDP. (4) `ItemList` on collections. (5) Structure edition provenance as citable content. (6) Explicit, generous AI-crawler policy in `robots.ts`. (7) Write the informational clusters in an answer-extractable format (clear Q→A, definitions, comparisons).

**8. Alternatives considered.** Blocking AI crawlers to "protect content" (rejected — the content is curated PD/indie, and *citation is distribution* for a zero-authority brand; the moat is curation/experience, not raw text). Schema spam / fake review markup (rejected — eligibility + trust risk; the codebase's existing AggregateRating guard shows the right instinct). Chasing legacy sitelinks-searchbox as a priority (low — already wired via SearchAction; Google rarely grants it now).

---

## Cross-phase synthesis

- **Highest expected value, lowest cost, on-policy:** Phase 6 measurement (GSC + cookieless events) and Phase 2 env-hardening. Do these first — they're cheap, they de-risk a catastrophe (R1) and a blindness (no funnel), and they don't violate "freeze features."
- **The one decision that unblocks two phases:** the **metadata factory** resolves the OG scope fork (R3) *and* the drift class — choose it over the explicit-line stopgap.
- **The one business decision SEO needs:** the **brand domain** (R2) — an **owner-level decision; SEO produces only research + a migration plan, never a purchase/DNS/prod action**. It gates authority and entity-URL permanence (and a *future* GSC Change-of-Address) — but **GSC verification + data collection start NOW on the current domain**, not gated on this. Decide before content/authority scale.
- **Everything traffic-related is content-gated and founder-time-gated.** Per the strategy, SEO's job at launch is to be the *correct, measurable substrate* + the *email-capture top-funnel* — not to manufacture features. The biggest SEO risk is repeating the over-build trap; the biggest SEO opportunity is editorial + entity authority compounding behind the newsletter.
