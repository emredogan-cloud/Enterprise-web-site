# SEO Execution Roadmap

**Optimized for:** a Claude-CLI agent workflow — each workstream is a self-contained `branch → PR → validate (lint+tsc+test+build) → merge` unit (the project's established pattern; Vercel prod = `main`).
**Governing constraints:** founder mandate "**freeze features, build content + newsletter**"; confirm-before-prod; additive-and-reversible by default. Every workstream below is classified **on-policy** (infra/measurement/content/schema — *not* new product features) or flagged otherwise.

## Execution governance (MANDATORY — phase-gated)

Execution is **phase-gated** and **starts at Phase 1 = Wave 0** (Phase 0 is validated/complete — see `00-phase0-validation-gate.md`). After completing **each Execution Phase / workstream cluster**, the agent **STOPS** and emits a **short report** (what was completed · validation result · files changed · risks/issues · expected impact · readiness for next phase), then **WAITS for explicit owner approval**. Do **not** chain phases or auto-continue. The single source of truth for execution order + status is **`04-phase-execution-tracker.md`**. This rule overrides any automatic-continuation behavior.

## Sequencing logic

Cheapest, highest-EV, catastrophe-reducing work first (measurement + env safety), then the one architectural decision that unblocks two phases (metadata factory), then a business gate (domain), then content-enabling schema, then the actual growth engine (editorial + entity authority). Traffic is content- and founder-time-gated, so growth waves are paced, not front-loaded.

| Wave | Workstream | Serves phase(s) | Priority | On-policy? | Gate |
|---|---|---|---|---|---|
| 0 | **A** — Env safety hardening | 2 | **P0** | ✅ infra | — |
| 0 | **B** — Metadata factory (resolves OG fork) | 2, 7 | **P0** | ✅ infra | — |
| 0 | **C** — Merge Phase 0 wins | 2 | **P0** | ✅ infra | needs approval (prod) |
| 1 | **D** — Measurement (GSC + cookieless events) | 6 | **P0** | ✅ instrumentation | — |
| 1.5 | **E** — Brand domain: research & plan **only** | 2, 5, 6 | **P1** | ⚠️ owner decision | **plan only — no purchase/DNS/prod** |
| 2 | **F** — On-page enablers (schema, thin-page fixes) | 3 | **P1** | ✅ content-enabling | DB migration |
| 2 | **G** — Entity / AI-search schema | 7 | **P1** | ✅ schema | — |
| 3 | **H** — Keyword→intent→page map | 1 | **P1** | ✅ content | — |
| 3 | **I** — Editorial cluster production | 1, 3, 7 | **P1** | ✅ content | founder-gated |
| 4 | **J** — Newsletter-first CRO/UX | 4 | **P2** | ✅ CRO/content | — |
| 5 | **K** — Authority (founder-led) | 5 | **P2** | ✅ off-site | founder-gated |

---

## Wave 0 — Infrastructure & Safety (do first; cheap, high-EV, reversible)

### WS-A — Environment-safety hardening
- **Order:** 1 (unblocks safe builds everywhere). **Priority:** P0. **Serves:** Phase 2.
- **Dependencies:** none (can precede or accompany WS-C).
- **Scope:** (1) `layout.tsx` `??`→`||` (R1); (2) single `siteUrl` config module imported by layout/seo/robots/sitemap/email; (3) build-time validation of `NEXT_PUBLIC_APP_URL` (valid absolute `https`) — fail build in CI/prod, warn in dev; (4) fallback to `VERCEL_PROJECT_PRODUCTION_URL` before `localhost`.
- **Expected impact:** Low normal-case, **eliminates a catastrophic tail risk** (sitewide canonical/OG corruption). High EV.
- **Risk level:** Low (additive guards; the `||` fix is a one-char correctness fix already proven on another branch).
- **Validation checkpoints:** `npm run lint`, `tsc --noEmit`, `npm test` (add a unit test: empty/malformed/valid env → correct origin), `npm run build` with (a) env set, (b) env empty → build **fails loudly** (desired), (c) `VERCEL_PROJECT_PRODUCTION_URL` only → resolves.
- **Rollback:** revert PR; pre-existing behavior restored (guards are isolated).
- **Success criteria:** empty/malformed `NEXT_PUBLIC_APP_URL` can no longer silently emit `localhost` URLs; one source of truth for origin; documented env contract.

### WS-B — Metadata factory (resolves the OG scope fork)
- **Order:** 2. **Priority:** P0. **Serves:** Phase 2 + 7.
- **Dependencies:** WS-A (factory consumes the `siteUrl` module).
- **Scope:** `buildPageMetadata({ title, description, path, type?, image?, robots? })` returning a `Metadata` with **un-droppable** defaults (siteName, locale, default OG+Twitter image `/opengraph-image`, canonical from `path`). Migrate the 17 indexable pages to call it (book PDP keeps cover override; book-without-cover gains the branded default). Keep `app/opengraph-image.tsx` as the generator.
- **Expected impact:** Medium SEO (correct OG/Twitter + `og:site_name` on *every* shared URL → social/AI previews; consistent entity signals) + high maintainability (kills the drift class).
- **Risk level:** Low-medium (touches ~17 files but mechanical + uniform; fully additive to output).
- **Validation checkpoints:** **Before/after metadata regression snapshots (NOT grep alone).** Capture the full resolved `<head>` metadata for **homepage, `/about`, `/books` (hub), and one PDP (`/books/meditations`)** *before* the factory migration and *after*, then diff. The after-state must prove, per page: canonical **preserved-or-improved**; `og:image` correct; `twitter:image` correct; `og:site_name` **present**; `og:locale` preserved; overall output **byte-equivalent-or-superior** (no tag lost — only additions/corrections). Plus: `books/meditations` uses cover when R2 set / branded default when not; unit + snapshot test for `buildPageMetadata`; full `lint`/`tsc`/`test`/`build` green.
- **Rollback:** revert PR (pages return to current per-page metadata; no data risk).
- **Success criteria:** all indexable pages emit a default OG+Twitter image and `og:site_name`; new pages get defaults automatically; the drift bug cannot recur.

### WS-C — Merge Phase 0 wins (robots.txt + home JSON-LD)
- **Order:** 3 (after B folds the OG fork in, so OG ships complete). **Priority:** P0. **Serves:** Phase 2. **Needs approval (prod deploy).**
- **Dependencies:** WS-B (so OG is sitewide, not home-only); R1 fix present on the branch.
- **Scope:** the existing `feat/seo-p0-discoverability` changes, rebased to include WS-A/B.
- **Expected impact:** `/robots.txt` served (sitemap pointer + crawl control); brand entity graph on home; sitewide OG.
- **Risk level:** Low (additive; verified).
- **Validation checkpoints:** post-deploy: live `/robots.txt` 200 with correct rules; `/opengraph-image` 200 PNG; home JSON-LD validates (Rich Results Test); GSC fetch.
- **Rollback:** revert merge commit; Vercel instant rollback to prior production deployment.
- **Success criteria:** prod `/robots.txt` no longer 404s; Rich Results detects Organization/WebSite; social debuggers (X/FB) render the OG card.

---

## Wave 1 — Measurement (first thing after infra; you can't optimize what you can't see)

### WS-D — GSC + cookieless event layer + KPI baseline
- **Order:** 4. **Priority:** P0. **Serves:** Phase 6.
- **Dependencies:** **None — explicitly NOT gated on WS-E (domain).** RULE: if the brand domain is undecided, verify GSC on the **current canonical domain** (`enterprise-web-site.vercel.app`) immediately and **begin data collection now**, while preparing migration notes (GSC Change-of-Address) for a later domain move. Measurement must not stall. The event layer needs only existing action points.
- **Scope:** (1) GSC verification (meta/DNS) **on the current canonical domain, immediately** + submit `/sitemap.xml` (migration-capable — GSC Change-of-Address on a later domain move); (2) typed wrapper over `@vercel/analytics` `track()` for `view_item`, `add_to_cart`, `begin_checkout`, `purchase`, `newsletter_signup`, `sample_read`, `search` at existing action points; (3) KPI set (email signups, purchases, top landing pages, query coverage, CWV); (4) UTM conventions for X/HN/newsletter.
- **Expected impact:** **Foundational/high-EV** — enables every later before/after proof and the funnel view (esp. newsletter, the key channel). Directly serves Risk #4.
- **Risk level:** Low (instrumentation; cookieless → no consent banner under KVKK).
- **Validation checkpoints:** events visible in Vercel Analytics; GSC ownership verified + sitemap "Success"; a test purchase/signup fires the right events; no PII in event props.
- **Rollback:** remove `track()` calls (no behavioral impact); GSC verification is inert.
- **Success criteria:** funnel measurable from launch; GSC reporting coverage/queries; KPI dashboard exists.

---

## Wave 1.5 — Business gate

### WS-E — Brand domain: RESEARCH & MIGRATION PLAN ONLY ⚠️ OWNER DECISION
- **Order:** 5 (research early; **execution deferred until explicit owner approval**). **Priority:** P1. **Serves:** Phase 2/5/6.
- **Dependencies:** an owner-level **business decision** (brand name + domain ownership). Blocks clean GSC *migration*, authority, entity-URL permanence — **but NOT initial GSC verification** (WS-D verifies the current domain now).
- **Scope — DELIVERABLES ARE DOCUMENTS, NOT ACTIONS.** Produce: (1) a **recommendation** (brand-aligned domain options; note the test fixture `kitabevi.com.tr` is *not* registered); (2) a **migration runbook** (add domain → set `NEXT_PUBLIC_APP_URL` → 301 `.vercel.app`→brand → origin auto-updates via `siteUrl` → resubmit sitemap → GSC Change-of-Address → update `sameAs`); (3) a **risk analysis**; (4) an **implementation plan**. **NOT ALLOWED without explicit owner approval:** purchasing a domain, migrating, any Vercel domain change, any DNS action, any production-domain modification, any env change.
- **Expected impact:** High long-term (brand/trust/authority permanence); planning now avoids a costly re-canonicalization later.
- **Risk level:** **None for the research/plan itself (documents only).** The *future* migration is Medium-risk (redirect/canonical correctness) — contained if executed, post-approval, before authority accrues.
- **Validation checkpoints (of the PLAN):** runbook covers the full 301 / canonical / GSC Change-of-Address / sitemap / `sameAs` chain with no gaps; risk analysis enumerates redirect-loop, mixed-origin, and authority-loss cases; plan is reversible (`.vercel.app` stays reachable via 301).
- **Rollback:** n/a (no production change is made in this workstream).
- **Success criteria:** an approval-ready recommendation + runbook + risk analysis + implementation plan exist. **No domain / DNS / Vercel / prod action taken.**

---

## Wave 2 — On-page & schema enablers

### WS-F — On-page content enablers
- **Order:** 6. **Priority:** P1. **Serves:** Phase 3. **DB migration involved.**
- **Dependencies:** WS-B (breadcrumbs via factory/schema consistency).
- **Scope:** (1) fix `legal-shell` double-H1 (R5); (2) add `categories.description` column (`db:generate`/`db:migrate`) + admin field + render unique curation copy; (3) populate author bios for live authors; (4) shared breadcrumb UI + `BreadcrumbList` on catalog/category/author/blog; (5) AVIF in `next.config` images; (6) alt-text audit on `CoverImage`/`AssetImage`.
- **Expected impact:** Medium-high once content exists (unique hub copy is how a curation boutique out-signals thin PD vendors); duplicate-H1 = small correctness.
- **Risk level:** Low-medium (one additive DB column — non-destructive default null; rest additive).
- **Validation checkpoints:** `db:generate` diff reviewed; migration applied to a branch DB; lint/tsc/test/build; breadcrumb JSON-LD validates; Lighthouse for AVIF/LCP.
- **Rollback:** column is nullable/additive (safe to leave); revert UI/schema PRs independently.
- **Success criteria:** live category/author hubs carry unique copy; one H1 per page; breadcrumbs visible + structured; covers serve AVIF with alt.

### WS-G — Entity / AI-search schema
- **Order:** 7 (parallelizable with F). **Priority:** P1. **Serves:** Phase 7.
- **Dependencies:** WS-B (emit via factory for consistency); founder/author identity for `Person`/`sameAs`.
- **Scope:** `Person`/`ProfilePage` on author pages; `FAQPage` on editorial/help/PDP; `ItemList`/`CollectionPage` on catalog/category; explicit, generous AI-crawler policy documented in `robots.ts` (allow reputable bots; keep private-path disallows).
- **Expected impact:** Medium-high for AI-answer/entity visibility (the audience lives in dev/AI surfaces); high leverage (schema muscle already exists).
- **Risk level:** Low (additive typed `schema-dts`).
- **Validation checkpoints:** Rich Results / schema validator on each type; robots policy reviewed; no schema for nonexistent data (reuse the AggregateRating-style guards).
- **Rollback:** revert schema PRs (inert).
- **Success criteria:** author entities + FAQ + collection schema validate; AI-crawler stance explicit and intentional.

---

## Wave 3 — Search strategy & editorial (the growth engine; content-gated)

### WS-H — Keyword → intent → page map
- **Order:** 8. **Priority:** P1. **Serves:** Phase 1.
- **Dependencies:** WS-D (so cluster performance is measurable).
- **Scope:** a living artifact mapping the three clusters (Stoic/deep-thinking editorial; DRM-free/ownership values; builder topics) → intent → intent-correct page type → internal-link path ending at **newsletter or a curated edition**. Explicitly label PD-title "free PDF" intent **do-not-target-transactionally**. Validate top ~20 terms with a keyword tool before writing.
- **Expected impact:** Directs all editorial ROI; prevents intent-mismatch waste.
- **Risk level:** None (document).
- **Validation checkpoints:** every target term has one owning page + intent classification; no two pages target the same head term (cannibalization check).
- **Rollback:** n/a.
- **Success criteria:** an approved map exists; writing is map-driven, not ad hoc.

### WS-I — Editorial cluster production
- **Order:** 9 (ongoing). **Priority:** P1. **Serves:** Phase 1/3/7. **Founder-time-gated.**
- **Dependencies:** WS-H map; WS-F/G (so posts link into rich hubs/entities); founder cadence.
- **Scope:** produce hub-and-spoke editorial against the map — start with 3–5 pieces (e.g., Stoicism reading order / "best translation of Meditations"; "DRM-free ebook stores / own your books"; a builder-topic piece). Answer-extractable structure (Q→A, comparisons, provenance). Each links to a curated edition + the newsletter.
- **Expected impact:** The compounding evergreen + AI-citation layer; primary email-capture top-funnel. Slow but durable.
- **Risk level:** Low (content). The real risk is *cadence* (founder burnout — keep it small/ritualized).
- **Validation checkpoints:** each post maps to a target term; internal links present; FAQ schema where apt; CWV unaffected; indexed in GSC.
- **Rollback:** unpublish/redirect a post if off-strategy.
- **Success criteria:** a small set of intent-correct, interlinked, indexed pieces driving signups; measurable in WS-D.

---

## Wave 4 — CRO / UX (newsletter-first)

### WS-J — Newsletter-first CRO
- **Order:** 10. **Priority:** P2. **Serves:** Phase 4.
- **Dependencies:** WS-D (measure capture); a lead-magnet asset (founder).
- **Scope:** make **email capture the primary CRO goal** (value-backed: a curated reading guide / anchor-book sample via Resend); fix "Watch Demo"→"Preview a sample"; decide categories-vs-genres (merge or sharpen); surface ownership/DRM-free trust higher. Keep the purchase path unchanged.
- **Expected impact:** High on signups (the launch metric); medium on eventual purchase (inventory-gated).
- **Risk level:** Low (copy/CRO config, not features).
- **Validation checkpoints:** `newsletter_signup` event lift; no regression in CWV/build; honest CTA copy.
- **Rollback:** revert copy/IA PRs.
- **Success criteria:** measurable signup-rate improvement; no dishonest CTAs; clearer discovery IA.

---

## Wave 5 — Authority (founder-led, ongoing)

### WS-K — Authority program
- **Order:** 11 (continuous). **Priority:** P2. **Serves:** Phase 5. **Founder-time-gated.**
- **Dependencies:** WS-E (brand domain) + the founder's anchor book + presence.
- **Scope:** anchor book as a linkable flagship asset + build-in-public (X/HN "Show HN"); values/provenance content as citable assets; `sameAs` entity wiring (X/GitHub/book); blog RSS; newsletter-driven community. **No** paid links / guest-post farms.
- **Expected impact:** High but slow; the anchor book + build-in-public is the highest-leverage authority asset (Vassallo precedent).
- **Risk level:** Low (off-site) + burnout risk (Risk #2) — keep ritualized.
- **Validation checkpoints:** referring domains trend (GSC links); entity graph coherent (`sameAs` resolves); newsletter growth.
- **Rollback:** n/a (off-site).
- **Success criteria:** a real linkable asset exists; topical authority + entity identity strengthen over time.

---

## Phase → Workstream coverage map

| Phase | Covered by |
|---|---|
| 1 — Search strategy/intent | WS-H, WS-I |
| 2 — Technical SEO expansion | WS-A, WS-B, WS-C, WS-E (+ AVIF in F) |
| 3 — On-page | WS-F, WS-I |
| 4 — UX/CRO | WS-J |
| 5 — Off-page/authority | WS-K, WS-E |
| 6 — Analytics/measurement | WS-D, WS-E |
| 7 — AI/modern search | WS-G, WS-B, WS-I |

## Critical path & approval gates

```
WS-A ─▶ WS-B ─▶ WS-C(merge, APPROVAL) ─▶ WS-D ─▶ [WS-E domain: PLAN ONLY] ─▶ WS-F/G ─▶ WS-H ─▶ WS-I ─▶ WS-J ─▶ WS-K
                                   └▶ (WS-D can start in parallel once C is mergeable)
```

**Hard approval gates (do not pass without explicit owner sign-off):** WS-C (first prod deploy of Phase 0+factory); **any actual domain / DNS / Vercel / production-env change** — WS-E delivers research + a migration *plan* ONLY, and the migration itself is a separate, post-approval action (no purchase/DNS/migration without sign-off); and any WS-F DB migration. Additionally, **every Execution Phase is phase-gated** — STOP + short report + WAIT for approval after each (see `04-phase-execution-tracker.md`). Everything else is additive/reversible and can proceed branch→PR with standard validation.
