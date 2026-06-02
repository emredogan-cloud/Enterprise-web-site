# WS-D — Measurement Baseline

**Privacy-first, cookieless, no-PII, no GA4.** Instruments existing flows only — no new product features.

## 1. What shipped (code)

| Piece | File | Notes |
|---|---|---|
| Typed event layer | `src/lib/analytics.ts` | `trackEvent(event, props)` over Vercel Analytics custom events; SSR-safe no-op; never throws into a flow |
| Client beacon | `src/components/analytics/track-event.tsx` | `<TrackEvent>` fires once on mount, or on scroll-into-view (`onView`) |
| GSC verification hook | `src/app/layout.tsx` | emits `<meta name="google-site-verification">` **iff** `GSC_VERIFICATION` env is set |

## 2. Events → existing trigger → KPI

| Event | Where it fires (existing flow) | Props (PII-free) | KPI it feeds |
|---|---|---|---|
| `view_item` | `/books/[slug]` mount | `slug, priceCents, currency` | top landing pages / item interest |
| `add_to_cart` | "Add to cart" button (`book-add-to-cart`) | `bookId` | funnel: interest → intent |
| `begin_checkout` | "Checkout" button (`checkout-button`) on session OK | — | funnel: intent → checkout |
| `purchase` | `/order/[id]` mount | `valueCents, currency` | **purchases / revenue** |
| `newsletter_signup` | newsletter form on success (`newsletter-section`) | — | **email signups (primary launch KPI)** |
| `sample_read` | `/books/[slug]` sample scrolled into view | `slug` | content engagement |
| `search` | `/search` with a query | `resultCount` | internal-search demand |

> **No PII / no raw search text** by construction (see the doc-comment contract in `analytics.ts`). Vercel Analytics is cookieless → **no consent banner needed** under KVKK/GDPR.

## 3. KPI set + baseline

| KPI | Source | Baseline (pre-WS-D) |
|---|---|---|
| Email signups | `newsletter_signup` event | 0 tracked (now instrumented) |
| Purchases / revenue | `purchase` event | 0 tracked (now instrumented) |
| Top landing pages | Vercel Analytics pageviews + `view_item` | pageviews only, pre-WS-D |
| Query coverage / impressions | **Google Search Console** | **0 — GSC not yet verified (action below)** |
| Core Web Vitals (LCP/CLS/INP) | Vercel Speed Insights (already live) | field data accruing |

UTM convention for off-site inbound (X / HN / newsletter): `?utm_source=<x|hn|newsletter>&utm_medium=<social|email>&utm_campaign=<name>` — Vercel Analytics captures referrers/UTM automatically.

## 4. Google Search Console — owner action (cannot be done headlessly)

GSC verification needs the owner's Google account. Steps:
1. Add a property for `https://enterprise-web-site.vercel.app` in [Search Console](https://search.google.com/search-console) → **URL prefix** → **HTML tag** method → copy the `content` token.
2. In Vercel → project env → add **`GSC_VERIFICATION`** = that token (Production). Redeploy.
   - The site then emits `<meta name="google-site-verification" content="…">` sitewide (hook already shipped) → click **Verify**.
3. **Sitemap:** already auto-discoverable — `robots.txt` carries `Sitemap: …/sitemap.xml` (live). Optionally also submit `/sitemap.xml` in GSC → Sitemaps for explicit status.
4. When the brand domain lands later, re-verify it + use GSC **Change of Address** (per the domain-freeze plan, `02-execution-roadmap.md` WS-E). **Do not delay GSC now for the domain decision.**

## 5. Caveats (honest)

- **`purchase` refresh over-count:** `/order/[id]` is `force-dynamic`; re-viewing/refreshing the confirmation re-fires `purchase`. Acceptable for a directional baseline; a transaction-id dedup is a later refinement (not shipped — avoids over-engineering).
- **`search` carries no query text** (privacy) — query-level demand comes from **GSC** (real queries) once verified.
- **GA4 deliberately omitted** — cookieless Vercel events + GSC cover the need without consent-banner overhead. Revisit only if a specific need is consent-compatible and justified.
