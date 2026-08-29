# Direct Sales Business Model

## 1. Core question: how does Valice Press make money from the website while Amazon/KDP stays a major channel?

**RECOMMENDATION — direct answer:** Amazon stays the acquisition/discovery engine (its audience and organic search are irreplaceable at this catalog size); the website's job is to (a) capture a **first-party relationship** (email) with a slice of Amazon buyers via legitimate back-matter funnels, (b) sell **direct digital editions** at a better margin than KDP royalties, and (c) point print buyers back to Amazon rather than trying to compete with it on print. Model **D + C** below is the right starting shape; **F (subscription)** and **G (marketplace)** are explicitly not yet — see §12 and `PUBLIC_DOMAIN_CATALOG_STRATEGY.md`.

## 2. Channel-structure comparison

| Model | Revenue | Margin | Complexity | Customer ownership | Acquisition | Scalability | Risk | Policy constraints | Tech complexity | Capital |
|---|---|---|---|---|---|---|---|---|---|---|
| A. Amazon/KDP only | Low-mid, capped by 70%/35% royalty tiers | Amazon takes referral/delivery cost | Lowest | None — Amazon owns the buyer | Best-in-class (Amazon traffic + Ads) | High (Amazon's infra) | Low | None beyond KDP ToS | None | None |
| B. + website (brand only, no sales) | Same as A | Same as A | Low | Still none | Same as A | High | Low | None | Low (already done) | Low |
| C. + email list | A, plus compounding list value | Same as A on Amazon sales | Low-Med | Partial — email only | Same as A + owned re-engagement | High | Low | KDP link rules (§ policy report) | Low (already built) | Low |
| D. + direct digital sales | A + full-margin direct sales | **Much higher** (no 30-70% platform cut, only Paddle MoR fee) | Medium | Full, per direct buyer | Weak alone; strong paired with C | High (near-zero marginal cost) | Med (piracy, support) | KDP Select conflicts if mismanaged (§3 policy) | Medium — **already built** | Low (infra exists) |
| E. + direct print orders | Modest | Low-negative unless self-fulfilled carefully | High (physical ops) | Full | Weak | Low (inventory/shipping bound) | Med-High (fulfillment, tax by jurisdiction) | Amazon cannot fulfill these (verified, §5 policy report) | Medium-High | Medium (inventory capital) |
| F. + subscription | Speculative | High per-subscriber if it works, but needs volume | High | Full | None directly | Low until catalog is deep | High (churn, catalog-depth risk) | Must exclude KDP-Select-enrolled titles | Medium (mostly built already, unused) | Low |
| G. + catalog marketplace (3rd-party publishers) | Speculative, take-rate revenue | Variable | Very high | Diluted (multi-party) | Could be large long-term | High if it works | High (curation, quality control, legal) | Out of scope per locked ADR ("first-party catalog only") | Very high (rebuild) | High |
| H. Hybrid (A+B+C+D, selectively E) | Best realistic near-term revenue | Best realistic near-term margin | Medium | Best realistic near-term ownership | Best realistic combination | High | Low-Med | Manageable with per-title Select discipline | Medium (already 90% built) | Low |

**RECOMMENDATION:** Pursue **H, scoped to A+B+C+D now, E opportunistically per-title, F/G deferred.** This matches what's already built (D's entire pipeline exists in code) and avoids the two highest-capital, highest-risk models (E at scale, G) until there's real revenue proof.

## 3. Should we sell the same books on the site? — direct per-format answer

| Format | Answer | Why |
|---|---|---|
| **Kindle/ebook** | **HYBRID, title-by-title** | Sell direct ONLY for titles not enrolled in KDP Select (policy report §3). For those, direct sale is pure margin upside with an infrastructure that already exists (Paddle + R2 + watermark). For Select-enrolled titles: Amazon-only until enrollment lapses. |
| **Paperback** | **NO (not via direct fulfillment) — YES as an Amazon referral link** | Amazon cannot fulfill website orders (verified fact, policy report §5). Direct-print fulfillment means either self-warehousing bulk author copies or a second POD vendor — real operational cost with no code built for it. Until volume justifies that, every paperback CTA on the site should be **"Buy the paperback on Amazon"** linking out. |
| **Hardcover** | **Same as paperback: NO direct fulfillment, YES Amazon link** | Same reasoning; hardcover has thinner margin and heavier shipping cost, making self-fulfillment even less attractive at low volume. |

Pricing/licensing/ownership/margin/friction detail: direct ebook sale removes Amazon's cut entirely (Paddle's MoR fee is materially lower than Amazon's 30-65% effective take depending on price tier and delivery cost), at the cost of the publisher now owning tax compliance risk (mitigated — Paddle is MoR) and support/piracy risk (mitigated by watermarking). Print direct sale has *worse* unit economics than Amazon POD unless volume is high enough to justify bulk ordering, so friction/margin both favor **not** building print fulfillment yet.

## 4. Digital delivery model comparison (§8 of the master prompt)

| Option | Verdict |
|---|---|
| A. Simple secure download | Already effectively subsumed by B |
| **B. Customer library (implemented)** | **This is what's built** — entitlement-gated library, signed short-TTL R2 URLs, unlimited re-download with audit logging |
| C. Account-based reading | Implemented alongside B (`/read/[bookId]`) |
| D. Browser reader | Implemented (pdf.js) |
| E. DRM-like controls | Deliberately rejected (ADR-3: social/watermark DRM, not hard DRM) — correct choice per `PAST_DECISIONS.md`, do not revisit without a publisher mandate |
| **F. Hybrid (B+C+D)** | **This is the actual implementation** — the right choice for a small first-party catalog: no re-engineering needed, just needs real inventory and a fixed Paddle price. |

**RECOMMENDATION:** Do not touch the delivery architecture. It is already the correct answer to §8. The blocking work is entirely business/data (real catalog, real prices), not code.

## 5. Print sales model comparison (§9)

| Option | Verdict |
|---|---|
| A. Direct website order + manual fulfillment | Viable only after volume justifies warehousing bulk author copies; not now |
| B. Print-on-demand third party (Lulu/IngramSpark) | Real option for a *dedicated* direct-print edition later; separate integration, separate cost structure |
| **C. Amazon product link / "Buy on Amazon"** | **Correct choice now** — zero build cost, zero fulfillment risk, Amazon already has the infrastructure and the buyer trust |
| D. Other print fulfillment integrations | Same bucket as B — later |
| E. Hybrid | End-state once volume exists: Amazon link is default, direct POD kicks in for special/limited/signed editions where a premium justifies the ops cost |

## 6. Kindle/ebook strategy (§10) — do not conflate

- **KDP publication ≠ KDP Select enrollment.** Publishing to Kindle carries no exclusivity; Select is the opt-in program that does.
- A direct-sale edition should not simply mirror the Kindle file. **RECOMMENDATION:** differentiate — e.g., a slightly higher-fidelity PDF/EPUB direct edition (fixed layout, better typography, no Kindle-format compression), possibly bundled with bonus material (the puzzle-book back-matter pattern generalizes well here) — this also sidesteps any appearance of undercutting the Kindle edition on the same platform.
- Pricing: direct edition can be priced at or slightly above Kindle price, since the value proposition is "own the PDF, no subscription, better fidelity, direct support of the author" rather than "cheaper than Amazon."

## 7. Page-read revenue idea (§11) — modeled, not recommended yet

| Model | Verdict |
|---|---|
| Pay per book | **Current model — keep.** Matches locked ADR (perpetual one-time purchase, no subscription). |
| Monthly subscription | Premature — see §12 threshold below |
| Unlimited catalog access | Same as above, requires deep catalog |
| Credits | Adds complexity without benefit at 1-book catalog; revisit only if bundle/multi-book demand is proven |
| Page-based internal reading | **Do not build.** Nothing in KDP policy blocks it (policy report §6), but it requires exactly the catalog depth and anti-abuse tooling a subscription needs, plus new metering infrastructure Amazon doesn't share and this codebase doesn't have. Building it "because it's technically possible" is explicitly what the master prompt (and general engineering hygiene) warns against. |

**RECOMMENDATION: do not build page-based billing.** It is solving a problem (locking in ongoing revenue) this catalog doesn't have yet, at real engineering cost, for a benefit (marginal engagement data) not worth the build.

## 8. Subscription model (§12) — direct answer: **NOW / LATER / NO?**

**LATER**, not now, not never. Reasoning:
- Current catalog: 1 real title. A subscription's entire value proposition ("access everything") is a punchline with one book.
- **Minimum viable catalog threshold, RECOMMENDATION:** at least **8–12 owned/licensed titles** across at least 2–3 genuinely different reader interests (so "everything" means something), *and* evidence from direct one-time sales that customers buy more than one book from Valice Press (repeat-purchase rate — see KPI report) — otherwise a subscription is a bet with no signal behind it.
- Until then, a subscription adds churn management, content-cost, and piracy-surface risk with no proven demand.

## 9. Technical architecture already sufficient for direct sales

**Digital:** Paddle (payment/tax) → `orders`/`order_items` (Neon, idempotent) → Inngest (fulfillment worker) → R2 masters/artifacts (private, signed URLs) → `entitlements` (customer account/library) → Resend (receipts/delivery email) → refunds via Paddle adjustment webhook → revocation. This is complete; do not redesign.

**Print (if ever built):** deliberately **separate** pipeline — order capture (could reuse Paddle/orders tables) + either (a) manual/bulk-author-copy fulfillment queue, or (b) a POD vendor webhook integration. Do not try to route print through the digital fulfillment pipeline; the failure modes (physical shipping, address validation, customs/tax-by-jurisdiction for physical goods) are different enough to warrant a separate module when the time comes.
