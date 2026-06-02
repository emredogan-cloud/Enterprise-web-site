# WS-J — Newsletter-First Conversion Architecture

**Thesis:** the newsletter is the primary KPI and the only durable owned channel (per the founder strategy). Until inventory exists, **email capture — not purchase — is the conversion goal.** This is conversion *architecture*, built on the measurement layer (WS-D), the editorial map (WS-H/I), and the authority funnel (WS-K). **Existing UX only — no redesign, no growth-hack spam, no cosmetic CRO.**

---

## 1. Two funnels (one primary now)

```
PRIMARY (now):   discover → read editorial → value (lead magnet) → EMAIL → nurture → buyer
SECONDARY (inventory-gated):  PDP → add_to_cart → begin_checkout → PURCHASE
```
Every surface optimizes the **primary** funnel; the purchase funnel is solid already (cart → Paddle → entitlement) and is *not* the bottleneck — inventory is.

## 2. CTA hierarchy (one primary per surface)
| Priority | CTA | Where |
|---|---|---|
| **P1** | **Get the guide / Join the list** (lead-magnet email capture) | every pillar/spoke, `/about`, `/blog`, home newsletter band |
| P2 | **Browse the catalog / See the edition** (curated edition or `/books`) | home hero, end of editorial, PDP-adjacent |
| P3 | Add to cart / Checkout | PDP / cart (unchanged) |

**Rule:** never two competing P1 CTAs on a surface. Editorial pieces lead with P1 (email); PDPs lead with P3 (buy); the home hero keeps P2 (browse) + the newsletter band carries P1.

## 3. Conversion surfaces (existing UX, mapped)
| Surface | Today | Target (primary CTA) |
|---|---|---|
| Home `NewsletterSection` | ✅ real `/api/newsletter` | keep; make it value-backed (the guide), not generic |
| Editorial pillars/spokes | none | **add lead-magnet capture** (the highest-leverage gap) |
| `/about` | manifesto | add a calm capture (values → list) |
| `/blog` index | list | add a single capture band |
| PDP | buy panel | keep P3; light "join the list" footer only |
| Article `AuthorNewsletterStrip` | exists | wire to the same lead magnet |

## 4. Lead-magnet flow (the unlock)
`"The Builder's Stoic Reading Guide" (PDF)` → email field (single input) → `/api/newsletter` (already exists, Resend) → **deliver the PDF** (Resend transactional, like order-ready email) → tag `lead-magnet:stoic-guide` → nurture sequence (3–5 emails: guide → best-edition → DRM-free ethos → catalog). The asset is **founder content** (gates this).

## 5. Friction reduction (existing UX, surgical)
- **Single field** (email only) — already the case; keep.
- **Honest CTAs** — fix the home hero's **"Watch Demo"** (anchors to `#why`, no demo) → **"Preview a sample"** or **"How it works"**. Dishonest CTAs erode trust with this audience.
- **No interruptive popups** — off-brand for a calm-literary boutique; inline capture beats interstitials.
- **Clear value, not "subscribe"** — "Get the reading guide" > "Subscribe to our newsletter."
- **Above-the-fold value** on editorial — the answer first (AEO), capture after the value is delivered, not before.

## 6. Intent-aligned conversion paths (ties to WS-H)
| Intent | Surface | Path |
|---|---|---|
| INFO (Stoicism, DRM-free) | editorial | → **lead magnet (email)** |
| COMM ("best translation", "which edition") | comparison spoke | → **curated edition (PDP)** + email |
| TXN ("buy DRM-free ebooks") | `/books` | → PDP → checkout |
| NAV (author/category) | hubs | → PDP / their titles |

## 7. Measurement loop (WS-D → optimize)
Primary KPI = **`newsletter_signup` rate per surface** (segment by source via UTM). Secondary: `view_item → add_to_cart → begin_checkout → purchase`. Iterate copy/placement on the surface with the most traffic + lowest capture. Cookieless (no consent banner).

## 8. Implementation backlog (existing UX; ready to implement, deferred to a deps-ready pass)
> All small, additive, no-redesign. Specs are execution-ready.
1. **Honest CTA fix** — `src/components/home/hero.tsx`: "Watch Demo" → "Preview a sample" (or link to the book sample / a `#how-it-works`). 1-line copy + href.
2. **Lead-magnet capture component** — a reusable `<LeadMagnetCapture title slug>` wrapping the existing `subscribeToNewsletter` + `trackEvent("newsletter_signup", { source })`; drop into pillar/spoke templates, `/about`, `/blog`. No new API (reuse `/api/newsletter`).
3. **PDF delivery** — extend the Resend flow (mirror `order-ready`) to send the guide on signup with `source=lead-magnet:*`. Founder supplies the PDF.
4. **Source attribution** — pass `source` into the newsletter API + the `newsletter_signup` event (no PII).

## 9. Anti-patterns (hard no)
Interstitial/exit-intent popups · fake urgency/scarcity · "subscribe for updates" with no value · double CTAs competing · dark-pattern unsubscribe · redesigning the cinematic UI for CRO · buying email lists.
