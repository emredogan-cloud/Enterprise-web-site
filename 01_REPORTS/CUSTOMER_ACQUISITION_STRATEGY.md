# Customer Acquisition Strategy

## 1. Amazon → website: what's allowed, what's not (see full sourcing in `KDP_WEBSITE_POLICY_RESEARCH.md`)

| | |
|---|---|
| **AMAZON ALLOWS** | Author-website link in ebook "About the Author" back matter (live link in ebook, plain text in print); a utility page (like `/codex-enigmatica/verify`) that a physical/printed book's back matter points readers to for legitimate book-related value |
| **AMAZON RESTRICTS** | Links to other ebook stores; links to forms requesting customer info; anything Amazon judges as primarily promotional rather than reader-value-adding |
| **REQUIRES CAREFUL WORDING** | Any back-matter CTA should read as reader utility ("check your answer," "download the bonus chapter," "see the full Valice Press catalog") — not as "sign up to my mailing list" as the headline ask |
| **NEVER DO** | Put a raw email-capture form as the sole purpose of a book-linked page; imply Amazon shares or endorses the data collection; use back matter primarily to route sales off-Amazon while the ebook is still KDP-Select-enrolled |

## 2. Channels, ranked by realistic fit for this catalog size

| Channel | Acquisition cost | Effort | Conversion potential | Time to results | Fit |
|---|---|---|---|---|---|
| **Amazon back-matter funnel (Codex Enigmatica pattern)** | ~$0 (already built) | Low — replicate per new title | High (self-selected, already-paying readers) | Immediate once live | **Best fit — already proven pattern** |
| **SEO on curated PD/classics content** | Low (time only) | Medium (needs real book pages + real content depth) | Medium, compounds over months | Months | Strong fit — matches the "differentiated PD edition" moat |
| Newsletter (existing infra) | ~$0 | Low | High for repeat purchase | Immediate | Strong — infra exists, needs automations |
| Google Search (organic) | Low | Medium | Medium | Months | Same bucket as SEO above |
| Pinterest | Low | Medium-High (visual asset production) | Medium — good for illustrated/PD classics with strong covers | Months | Plausible fit given illustrated-edition strategy, not proven yet |
| Puzzle/free-sample content (printable puzzle teaser) | Low | Medium | Medium-High for puzzle-book audience specifically | Weeks | Good fit for Codex line specifically |
| YouTube / social content | Medium-High (time-intensive) | High | Low-Medium without a track record | Months+ | Weak fit right now — no evidence of founder capacity/interest here; don't force it |
| Libraries / educators / museums / collectors | Low direct cost, high relationship effort | High (sales-cycle) | Medium, high LTV per institutional sale | Quarters | Good long-term fit for World Games/Myth Hunter/Codex once catalog is proven — not now |
| Affiliates/partnerships | Low | Medium | Low-Medium, unproven | Months | Minor, opportunistic only |

**RECOMMENDATION:** the two highest-confidence, lowest-cost channels are (1) replicate the Codex Enigmatica back-matter funnel on every future puzzle title, and (2) turn the existing curated-PD-edition selection diligence into actual long-form book-landing content that can rank organically (the *Meditations* translation-selection story itself is good SEO content — "why we chose this translation" is a real article). Everything else is secondary until those two prove out.

## 3. Amazon Ads (§18) — careful framing

**INFERENCE/RECOMMENDATION:** Amazon Ads' primary value here is **Amazon-native**: driving Amazon sales rank and reviews, which is what actually grows KDP visibility (Amazon's own algorithm rewards Amazon-side conversions, not off-platform ones). Do not expect Amazon Ads to be a meaningful *website* traffic source — Amazon does not want to fund traffic leaving its platform, and ad-click tracking to an external site from Amazon Ads is limited/discouraged by design. Treat Amazon Ads purely as an Amazon-sales lever; treat the website funnel as a **post-purchase** discovery mechanism (back matter, verification pages), not an ad-driven one.

## 4. Conversion funnel design (site-side)

```
Discovery (Amazon back matter / SEO / newsletter)
  → Book landing page (hero, positioning, formats, price, sample, reviews, related titles)
  → Value / preview (sample pages — component exists: cinematic-sample-section.tsx)
  → Trust (author credibility, reviews — cinematic-reviews-list.tsx exists)
  → Format choice (ebook now; "Buy on Amazon" for print)
  → Purchase (Paddle checkout)
  → Delivery (entitlement → library → download/read)
  → Optional email opt-in (post-purchase, not pre-purchase — never gate delivery behind it)
  → Next book / cross-sell (related-books-shelf.tsx exists, needs real data)
  → Repeat customer (newsletter automation)
```

Every stage already has a real component in the codebase; the funnel is a data/content problem, not a build problem.

## 5. Website merchandising per book page

Each book page should carry: hero + one-line positioning statement, all available formats with clear pricing, a real sample (not a placeholder), trust signals (author bio, real reviews once any exist), related titles, a bundle offer where applicable, and a post-purchase (not pre-purchase) email capture moment. Cross-sell path: **Book A → Book B (same category) → Collection/Bundle → (later) subscription**, matching the priority order in `DIRECT_SALES_BUSINESS_MODEL.md`.
