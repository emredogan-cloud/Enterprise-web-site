# Founder Configuration Manual — Valice Press

> Everything that must be done **outside this repository**, by you, because it needs an account, a credential, a payment method or a legal judgment that an agent cannot supply.
>
> **A note on provider UI paths.** Dashboards get redesigned. Where a click-path is given, it is the path as documented by the provider — if the screen does not match, look for the same *concept* (the setting name is far more stable than its location) rather than assuming the step is wrong. Steps that could not be verified against a live dashboard in this session are marked **[VERIFY CURRENT UI]**.

---

## Status at a glance — 2026-08-29

| # | Item | State | Blocks |
|---|---|---|---|
| **B0** | **Register `valicepress.com`** | ❌ **NOT DONE** | Codex Enigmatica printing — *see below, this is #1* |
| B1 | Paddle production account + real prices | ❌ sandbox only | All real sales |
| B2 | `RESEND_AUDIENCE_ID` in production | ❌ **missing** | **All newsletter signups (live now)** |
| B3 | Inngest production sync | ⚠️ keys set, sync unverified | Fulfillment after purchase |
| B4 | Production DB schema | ✅ **DONE** (this session) | — |
| B5 | Public site accessibility | ✅ **DONE** — verified 200 | — |
| B6 | Per-book KDP AI declarations | ❌ not made | Every KDP upload |
| B7 | Korean Hangul CC BY-NC licence review | ❌ unresolved | That title, in every channel |

---

## B0 — Register valicepress.com ⚠️ THE MOST TIME-CRITICAL ITEM

**What:** Register the domain `valicepress.com` and attach it to the Vercel project `valicepress-book-site`.

**Why this is first.** *Codex Enigmatica*'s entire design depends on it. The book's final answer is deliberately printed **nowhere in the book** — the reader is sent to a verification page whose address is printed on the last leaf:

```
valicepress.com/codex-enigmatica/verify
```

That page exists and works — but only at `enterprise-web-site.vercel.app`. `valicepress.com` currently resolves to nothing (verified: connection fails). **If a single copy is printed before this domain is live, every copy ships with a dead address and the book's central mechanic becomes unresolvable for the reader.** You cannot fix that after printing. The project's own config records `domainRegistered: false`.

**Where:** any registrar, then Vercel → project `valicepress-book-site` → Settings → Domains → Add.

**How to verify:** `curl -I https://valicepress.com/codex-enigmatica/verify` returns `200`. Then set `NEXT_PUBLIC_APP_URL=https://valicepress.com` in Vercel production env and redeploy, so canonical URLs, OG tags and email links all use the real domain.

**What failure looks like:** the URL times out or shows a registrar parking page.

**Also decide here:** the books print **"Vâliçe Press"**; this website now says **"Valice Press"**. Nothing is printed yet, so both are still open — but pick one and make them match.

---

## B1 — Paddle production

**What:** A live Paddle account, a real Price for each sellable book, and production credentials.

**Why:** Paddle is the Merchant of Record — it handles global VAT/sales tax and PCI scope. Without it there is no legal way to take money. The production database currently carries `pri_test_meditations_999` on *Meditations*, which is a **fake identifier**; a real checkout against it fails at the till.

**Steps:**

1. Create/complete a Paddle **production** account at `vendors.paddle.com`. **Expect this to take days** — Paddle verifies merchants before approving live selling. This is the longest lead time in the whole launch and should be started first.
2. In the live dashboard, create one **Product** and one **Price** per sellable book. Copy each Price ID (format `pri_01…`).
3. **Checkout settings → Default Payment Link.** Set this to your production URL. **[VERIFY CURRENT UI]** — but note it is not optional: without it, `paddle.transactions.create` fails outright. This exact trap already cost a debugging session once.
4. Create a **webhook destination** pointing at `https://<your-domain>/api/webhooks/paddle`, subscribed to at least `transaction.completed`, `transaction.payment_failed`, and `adjustment.created` (the last one drives refunds → entitlement revocation). Copy the signing secret.

**Environment variables** (Vercel → Settings → Environment Variables → Production):

| Variable | Value |
|---|---|
| `PADDLE_API_KEY` | live API key (**not** the `pdl_sdb…` sandbox one) |
| `PADDLE_ENVIRONMENT` | `production` |
| `PADDLE_WEBHOOK_SECRET` | signing secret from step 4 |

Then set each book's real Price ID — see the Operations Manual, "Set a book's Paddle price".

**How to verify:** add a book to the cart and start checkout — a real Paddle-hosted page loads. Then complete one low-value purchase and confirm the order, entitlement and email all appear.

**What failure looks like:** checkout errors immediately (missing/invalid price ID, or Default Payment Link unset); or the webhook returns 401 (`Missing Paddle-Signature header` means the request never carried a signature; a signature *mismatch* means the secret is wrong).

**Rollback:** deactivate the live Price, or clear `paddle_price_id` on the book — checkout then fails fast and no money moves.

---

## B2 — RESEND_AUDIENCE_ID ⚠️ BREAKING NEWSLETTER SIGNUPS RIGHT NOW

**What:** Create a Resend Audience and set its ID in production.

**Why:** `RESEND_API_KEY` is set, but `RESEND_AUDIENCE_ID` is **not** (verified against the live production env this session). The newsletter route requires both. Every signup on the live site today gets `503 provider-unavailable` and the form shows "Subscriptions are temporarily unavailable." **This is the cheapest fix on this list and it is currently losing you every subscriber.**

**Steps:**

1. Go to `resend.com/audiences` and create one audience. Name it something durable — `Valice Press` — because you get **one master audience**, segmented by tags, not one list per book. (A second list is a second unsubscribe surface; someone who opts out of "the newsletter" but keeps getting "the Codex list" has been ignored, not segmented.)
2. Copy its ID (a UUID).
3. Vercel → Settings → Environment Variables → add `RESEND_AUDIENCE_ID` for **Production** (and Preview if you want signups to work there).
4. Redeploy — env changes do not apply to existing deployments.

**Also verify while you are there:** `EMAIL_FROM` should be an address on a **domain you have verified in Resend** (`resend.com/domains` → add domain → add the DKIM/SPF DNS records it gives you). Until a domain is verified, Resend only reliably delivers from its shared `onboarding@resend.dev` sender, which is throttled and visibly not you.

**How to verify:** subscribe with a real address on the live site. You should get `200`, a contact appears in the Resend audience with `source`, `signup_purpose`, `consent_text` and `consent_at` properties, and a welcome email arrives.

**What failure looks like:** `503` (env still missing), or a `200` with no email (domain not verified — check the Resend logs).

---

## B3 — Inngest production sync

**What:** Confirm the fulfillment function is registered with Inngest Cloud.

**Why:** This is the step whose failure is *silent*. `INNGEST_EVENT_KEY` and `INNGEST_SIGNING_KEY` are both already set in production. But if the app has never been synced, a purchase still writes the order and entitlement, then fires an event that **nothing consumes** — the buyer's entitlement sits at `pending` forever and no watermarked file is ever produced. Nothing errors. The `watermark_jobs` table exists specifically to make this visible.

`GET /api/inngest` currently returns **401**, which is inconclusive on its own and needs checking against the dashboard.

**Steps:**

1. Go to `app.inngest.com` → your production environment → **Apps** → **Sync new app** (or re-sync the existing one). **[VERIFY CURRENT UI]**
2. Give it `https://<your-domain>/api/inngest`.
3. Confirm the function **`process-fulfillment-transaction`** appears in the dashboard function list.

**How to verify:** the function is listed, and after a test purchase a run appears with the steps `watermark-<bookId>` and `email-order-ready-<bookId>`.

**What failure looks like:** no function listed; entitlements stuck at `pending`; rows in `watermark_jobs` stuck at `queued`, or no rows at all.

---

## B4 — Production database ✅ DONE

Migrations `0004` (commerce_events) and `0005` (book_formats) were applied this session and verified — production now has 15 tables. The seven real books are loaded as drafts.

**One thing to know for the future:** `npm run db:migrate` is **broken on this project**. Production was built with `db:push`, so its migration journal is empty; drizzle-kit therefore replays `0000` and collides with the existing schema. Use the direct-driver script instead:

```bash
npx vercel env pull scripts/tmp/.env.production --environment=production
node scripts/apply-migration.mjs drizzle/<file>.sql --env scripts/tmp/.env.production          # dry run
node scripts/apply-migration.mjs drizzle/<file>.sql --env scripts/tmp/.env.production --commit
```

It prints the target database name before doing anything. **Always read that line.** Production (`neondb`) and sandbox (`bookstore`) sit on the same Neon host, and confusing them is the highest-consequence mistake available in this project.

---

## B5 — Public accessibility ✅ DONE

Verified this session: the production site returns `200` to an anonymous request with no SSO wall. Admin, account, order and reader routes remain protected by Clerk. Private R2 buckets remain private.

---

## B6 — KDP AI-content declaration (per book)

**What:** When uploading each title, KDP asks whether AI was used for text, images or translation. You must answer it.

**Why:** It is a legal declaration about your own process. No agent can make it for you, and none of the book projects has — every one records `aiDisclosure.founderConfirmed: false`.

**Where:** KDP Bookshelf → the title → the content/details step, during upload. **[VERIFY CURRENT UI]**

**Note:** *The Great Book of World Myths* already had an upload **rejected** (2026-08-12) for a placeholder author bio that KDP read as template text. Write a real author bio before re-submitting. The same placeholder is why `AUTHORS.bio` is null in the site catalog — it is deliberately blank rather than invented.

---

## B7 — Korean Hangul: content licence review ⚠️ LEGAL

**What:** Resolve whether dictionary source S-0019, which is **CC BY-NC licensed**, can be used in a book you sell.

**Why:** "NC" means non-commercial. Selling the book is commercial use. This is not a formatting problem, it is a question of whether you have the right to sell this title **at all, in any channel** — it blocks direct sale exactly as much as it blocks KDP. That is why the title is marked `directSaleEligible: false` in the catalog.

**Options:** replace the source with a permissively-licensed or public-domain equivalent and re-derive the affected content; obtain a commercial licence from the rights holder; or confirm through review that the usage falls outside what the licence covers. The project's own A7 review flagged this — it has not been closed.

**Two further A7 items on the same title:** the ownership terms of the AI-generated cover art, and the KDP AI declaration.

---

## Recommended order

**B0 and B2 first** — B0 because it is irreversible once printing starts and costs a few dollars today; B2 because it takes ten minutes and is actively losing subscribers.

**B1 next**, because Paddle's merchant approval is the longest external wait and everything commercial queues behind it.

**B3 alongside B1** — quick, but must be confirmed working *before* the first real sale, not after.

**B6 and B7 per title**, as you decide to publish each one.
