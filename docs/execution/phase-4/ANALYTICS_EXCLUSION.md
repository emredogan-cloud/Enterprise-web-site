# Founder and internal-traffic exclusion from analytics

**Date:** 2026-09-03 · **Code:** `src/lib/internal-traffic.ts`, `src/components/analytics/analytics-gate.tsx`, `src/components/settings/analytics-exclusion-card.tsx`, `src/app/api/events/route.ts`.

## What Vercel supports — VERIFIED against the docs, 2026-09-03

Vercel Web Analytics has **no IP-based, account-based or team-based exclusion**. The only filtering mechanism it documents is the `beforeSend` hook on the `<Analytics>` component: return `null` and the event is never sent. Vercel's own documentation gives two uses of it — ignoring routes by URL, and a per-user opt-out that reads a `va-disable` key from `localStorage` (`vercel.com/docs/analytics/redacting-sensitive-data`, "Implement user opt-out"). Speed Insights has the same hook.

So nothing here claims Vercel ignores an IP. The exclusion happens where Vercel says it must: **in the browser, before the beacon leaves**.

## What was built

| Layer | Mechanism | Effect |
|---|---|---|
| Vercel Web Analytics + Speed Insights | `<AnalyticsGate>` mounts both with `beforeSend` returning `null` when `isInternalBrowser()` | page views and web-vitals from a marked browser are never sent |
| First-party funnel (`/api/events`, the `analytics_events` table) | the route answers 204 and **does not insert** when the request carries the `vp_internal=1` cookie or the `x-valice-internal: 1` header | `view_item`, `sample_read`, `add_to_cart`, `begin_checkout`, `companion_download`, `newsletter_signup` from a marked browser or a script are not recorded |
| Agent probes | every verification script sends `x-valice-internal: 1` (`validate-catalog.mjs`, `kdp-linkage-lint.mjs --check-urls`) | a probe cannot become a customer event. Page views from `fetch` never reach Vercel Analytics anyway — the beacon is client-side JavaScript that `fetch` does not run |
| Server-side purchase telemetry (`fulfillment.ts`) | **untouched** | a paid order is a real order whoever placed it; the e2e scripts delete their own rows |

## How the Founder activates it

Once per browser profile, signed in:

1. Open `https://valicepress.com/account/settings`.
2. In the **Analytics** card, press **Exclude my visits**. The card then reads "This browser is excluded from Vercel Analytics and the first-party funnel."

That sets `localStorage["va-disable"] = "1"` and a first-party cookie `vp_internal=1` (Path `/`, SameSite Lax, Secure, max-age one year). Both live only in that browser profile; neither identifies the visitor to anyone. Repeat in every browser used to check the site (phone, second laptop, private windows do not persist).

To count visits again: press **Count my visits again** on the same card, or clear site data for valicepress.com.

Without the UI, the equivalent in DevTools is `localStorage.setItem("va-disable", "1")` plus `document.cookie = "vp_internal=1; Max-Age=31536000; Path=/; SameSite=Lax; Secure"`.

## Properties, honestly stated

- **Persists** across sessions in the same profile for a year; survives deploys.
- **Does not** identify ordinary visitors — nothing is set unless the switch is pressed.
- **Does not** rely on a query parameter.
- **Does not** break real-user analytics — the hook returns the event unchanged for everyone else.
- **Does not** touch purchase records.
- **Limitation:** it is per browser, not per person. A new device or a cleared profile counts until the switch is pressed there. That is the limit of the supported mechanism, and it is stated rather than papered over.
- **Retroactive:** the 6 `view_item` and 1 `sample_read` rows recorded before this shipped (four of them from 2026-09-03 01:13 UTC, matching the Founder's screenshot session) are not deleted by this change; they are noted in the commercial results as probable internal traffic.

## Verification

- `npm test` covers `isInternalRequest` / `hasInternalCookie` paths through the events route contract.
- After deploy: press the switch, reload `/books/the-puzzles-of-henry-dudeney`, and confirm no new `view_item` row appears (`node scripts/strategy/commercial-dashboard.mjs --env scripts/tmp/.env.production`). Vercel's own dashboard shows page views with a delay; a marked browser produces none.
