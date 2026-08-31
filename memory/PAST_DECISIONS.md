# Past Decisions — Locked Architectural Constitution

> Source of truth: `WEB_SITE_ROADMAP.md` (§2 facts, §8–§12 ADRs). **Consult this file before proposing or changing any architectural direction.** These decisions are **locked**; reopen only if a listed assumption is invalidated (see roadmap §2.2 and §19 "what would change the plan").

## Complexity tier
Tier 2 — mid-complexity transactional content platform. Build a **modular monolith** on managed/serverless infrastructure. Do not over-engineer.

## Locked product decisions (Phase-0 gate)
- **Supply model:** First-party catalog — we own/license the titles. No multi-vendor marketplace.
- **Monetization:** One-time purchase per book (à la carte, perpetual ownership). No subscription.
- **Content protection:** Social DRM — per-buyer PDF watermarking. No hard DRM.
- **Market:** B2C, global (English-first, i18n-ready).
- **Delivery:** Downloadable PDF **and** online reading.

## Locked architectural decisions
- **Frontend — Next.js (App Router), SSG/ISR-first.** Catalog pages are statically rendered for SEO (the growth engine); account/reader surfaces are dynamic and auth-gated. (ADR-1)
- **Database — PostgreSQL on Neon (serverless) via Drizzle ORM + drizzle-kit.** Relational + ACID for fulfillment correctness; schema per the §10 ERD. *(Committed in SUB-PR 0.3.)* (§10)
- **Authentication — Clerk via `@clerk/nextjs`.** Hosted identity (social + email/magic-link) and route protection via `clerkMiddleware`. The Postgres `users` table holds the commercial relationships; a future Clerk-webhook syncer reconciles identity into the local row. *(Committed in SUB-PR 0.5.)* (ADR-8)
- **File storage — Cloudflare R2 (zero egress).** Selling downloads = sustained egress; R2's $0 egress makes cost near-fixed. S3-compatible, so portable. (ADR-6)
- **Payments — Paddle as Merchant of Record (MoR).** Offloads global VAT/sales-tax, PCI scope, and much fraud/chargeback liability. **Not** raw Stripe; Paddle chosen over Lemon Squeezy for broader tax-jurisdiction coverage. *(Committed in SUB-PR 1.5.)* (ADR-2)
- **Content-protection pipeline — async Social DRM.** On the MoR purchase webhook, an idempotent worker (Inngest / Vercel Queues) stamps a per-order watermarked PDF, stores it privately in R2, and serves it via short-lived signed URLs. (ADR-3)

## Explicit rejections
- **Microservices** — rejected at this tier. Enforce module boundaries inside one deployable app to preserve the option to extract a service later. (ADR-7)
- **Hard DRM** (Readium LCP/Adobe), **self-hosted infrastructure**, **custom tax/payments stack**, and **multi-region active-active DB** — out of scope (see roadmap right-sizing).

## Re-open triggers
A publisher hard-DRM mandate (→ Readium LCP), a funded team / high volume (→ revisit Stripe-direct), or a shift to subscription/marketplace would reopen these. Until then, treat as fixed.

---

## Phase 4 — catalog and channel decisions (2026-08-31)

These are commercial and data decisions, not architectural ones, but they
constrain code and were being re-derived (and re-got-wrong) each phase.

- **Publication is data, not an action.** A book reaches `published` only
  because `websiteStatus: "published"` sits next to its blockers in
  `scripts/catalog/valice-catalog.mjs`, where the decision is reviewable in a
  diff. The loader applies that decision and demotes as well as promotes.
  Never publish or unpublish by editing the database directly.

- **Three statuses, never conflated.** `websiteStatus` (do we list it),
  `format.kdp` (what Amazon holds), `directSale` (may we sell the digital
  edition ourselves). They move independently. A book can be live on Amazon
  and unsellable here.

- **KDP Select is exclusivity and is enforced in code.** *Codex Mythologica*'s
  Kindle edition is enrolled. Its digital edition may not be sold anywhere but
  Amazon while that stands. A test fails if a Select-enrolled book is ever
  flagged for direct sale — do not "fix" that test.

- **A price of 0 means "not sold here", never "free".** Amazon-only titles
  carry `price_cents = 0`. Use `formatCatalogPrice`, and emit **no** JSON-LD
  Offer. Rendering it as `$0.00` advertised a free download of a $4.99 book.

- **An Amazon link requires a verified ASIN, and an ASIN requires
  `kdp: "live"`.** Amazon issues an ASIN at publication, so an ASIN on a title
  in review or never created is by definition invented. Gated in the loader
  and in tests.

- **The digital edition is a separate artifact from the print interior.**
  Print interiors are 40–121 MB; the fulfillment worker reads the whole file
  into memory in a serverless function. `build-digital-editions.mjs` cuts a
  150 DPI edition (108 MB → 4.6 MB). Never point `master_file_key` at a print
  interior.

- **`books.master_file_key`, not just `book_formats.master_file_key`.** The
  watermark worker is handed a bookId and has no format in scope. Writing only
  the format row leaves the book unfulfillable — purchase completes,
  entitlement sticks at `pending` forever.

- **Public-domain editions are direct-first.** KDP caps public-domain content
  at the 35% royalty tier; this store nets ~90% after Paddle. A PD edition
  earns more than double here. The original-contribution work is still what
  makes the edition worth buying — see `PUBLIC_DOMAIN_BATCH_1_PLAN.md`.

- **Never invent a rating.** Zero reviews renders as no stars at all — not
  `0.0`, and not a "decorative" constant. `rating: 0` means absent everywhere.

- **Provider credentials are verified by use, never by presence.** Four of the
  five integrations were configured with a wrong-but-plausible value that a
  presence check passed: a docs placeholder, a notification-setting id in
  place of a signing secret, an invalid signing key, and stale R2 keys. Assert
  behaviour, not `process.env.X !== undefined`.
