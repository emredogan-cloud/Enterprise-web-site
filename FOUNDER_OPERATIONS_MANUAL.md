# Founder Operations Manual — Valice Press

> How to run the store day to day, without needing to remember how it is built.
>
> Two things to know before anything else:
>
> 1. **There are two databases on the same Neon host.** `neondb` is production. `bookstore` is sandbox. Every script here prints which one it is about to touch — read that line every time. Mixing them is the worst mistake available in this project.
> 2. **The catalog lives in a file, not just in the database.** `scripts/catalog/valice-catalog.mjs` is the source of truth for book metadata. Edit it, then re-run the loader. It is idempotent, so re-running is always safe.

---

## Setup you do once

```bash
# Pull production credentials into an ignored temp file
npx vercel env pull scripts/tmp/.env.production --environment=production
```

`scripts/tmp/` is gitignored. Delete the file when you're done: `rm scripts/tmp/.env.production`.

Every command below that targets production takes `--env scripts/tmp/.env.production`. Leave that flag off and it targets whatever `.env.local` points at — currently the sandbox.

---

## Add a new book

1. Open `scripts/catalog/valice-catalog.mjs` and copy an existing entry in `BOOKS`.
2. Fill in: `slug` (URL-safe, permanent — changing it later breaks links), `title`, `subtitle`, `description`, `pageCount`, `categories`, `authors`, and one `formats` entry per edition.
3. For each format set:
   - `fulfillment: "direct"` for an ebook you sell here, `"amazon"` for print.
   - `availability`: `"available"` (buyable/linkable now), `"coming_soon"` (exists, not yet purchasable), or `"unavailable"` (deliberately not produced — hidden entirely).
   - `priceBasis` — write down *why* the price is what it is. Future-you will want to know whether a number was measured or guessed.
4. Add the cover: convert to WebP at ~1600px tall and save as `public/images/books/<slug>.webp`.

   ```bash
   convert /path/to/cover.jpg -resize 'x1600>' -quality 82 public/images/books/<slug>.webp
   ```

5. Load it:

   ```bash
   node scripts/catalog/load-catalog.mjs --env scripts/tmp/.env.production                    # dry run first
   node scripts/catalog/load-catalog.mjs --env scripts/tmp/.env.production --commit --i-know-this-is-production
   ```

6. Commit and deploy (`npx vercel --prod`). Covers ship with the deploy; database rows do not need one, but catalog pages are cached for an hour.

**The loader never publishes anything and never writes a Paddle price.** Both are deliberate — see below.

---

## Publish a book (make it visible in the shop)

Books load as `draft`. Draft books are invisible on the storefront. Before publishing, check that title's `blockers` list in the catalog file — that is where the reasons live.

**Before publishing anything, confirm all four:**

- [ ] You own or are licensed for everything in it (text, images, fonts, data sources)
- [ ] The KDP AI-content declaration is made, if it is also going to Amazon
- [ ] The price is one you have actually decided on, not a modelled estimate
- [ ] For a direct ebook: it has a real Paddle price ID, and a master file in R2

Then:

```sql
-- with psql, or Drizzle Studio (npm run db:studio)
update books set status = 'published', published_at = now() where slug = '<slug>';
```

To unpublish, set `status = 'draft'`. Nothing is deleted; entitlements of anyone who already bought it are unaffected.

> **Why the loader won't do this for you.** Publishing is a commercial and legal act. Three books in the catalog are currently marked `directSaleEligible: false` for real reasons — an unresolved CC BY-NC content licence, a book whose subtitle promises "Ready to Play Tonight" with zero playtests behind it, and one that is 101 unverified drafts. A script cannot weigh those.

---

## Set a book's Paddle price

1. In the Paddle dashboard, create a Price for the book. Copy the ID (`pri_01…`).
2. ```sql
   update books set paddle_price_id = 'pri_01...' where slug = '<slug>';
   ```

**Never invent one.** *Meditations* in production currently carries `pri_test_meditations_999`, which is fake, and any real checkout against it fails at the till. That row is a reminder, not a template.

---

## Change a price

- **Direct ebook:** update the Price in Paddle, then update `book_formats.price_cents` so the displayed price matches what the customer will actually be charged. A mismatch between the two is the worst kind of pricing bug.
- **Print:** update `book_formats.price_cents` to match the Amazon listing. This is display-only — Amazon controls what is actually charged.

```sql
update book_formats set price_cents = 1499
 where book_id = (select id from books where slug = '<slug>')
   and format = 'paperback';
```

---

## Link a print edition to Amazon

Once a title is genuinely live on Amazon:

```sql
update book_formats
   set amazon_asin = 'B0XXXXXXXX',
       availability = 'available'
 where book_id = (select id from books where slug = '<slug>')
   and format = 'paperback';
```

The "Buy on Amazon" button appears only when **both** an identifier and `availability = 'available'` are present. Without an identifier there is nowhere for the button to go, so the page shows "Not yet available" instead of a link that 404s on Amazon. **Set the ASIN only after you have opened the listing yourself and seen it live.** Every ASIN column in the catalog is currently null, because no Valice Press book is on Amazon yet.

Prefer `amazon_asin` over `amazon_url`; the URL is built from it. Use `amazon_url` only for a non-`.com` storefront.

---

## Replace a cover

Overwrite `public/images/books/<slug>.webp` and deploy. Same filename, so nothing else changes. Front cover only — if you only have a full print wrap (back + spine + front), crop the front panel first:

```bash
# For a wrap W inches wide with an S-inch spine, the front panel is
# (W - S) / 2 wide and starts at W - that width from the left.
convert wrap.png -crop <fw>x<h>+<x>+0 +repage -resize 'x1600>' -quality 82 out.webp
```

---

## Update a description or add preview pages

Descriptions live in `valice-catalog.mjs` → edit → re-run the loader. The loader overwrites title, subtitle, description, language and page count on every run, but **never** overwrites price or status — so a routine re-load cannot silently unpublish a book or revert a price you set by hand.

Samples come from `books.sample_key` (an R2 object). Upload the sample to the masters bucket and set the key. Keep samples short and never upload the full book as a sample.

---

## Look at orders, entitlements and downloads

`npm run db:studio` opens Drizzle Studio against whatever `DATABASE_URL` points at. Useful queries:

```sql
-- Recent orders
select o.mor_order_ref, o.status, o.total_cents, u.email, o.created_at
  from orders o join users u on u.id = o.user_id
 order by o.created_at desc limit 20;

-- Anyone stuck waiting for a file (the symptom of Inngest not being synced)
select u.email, b.title, e.status, e.created_at
  from entitlements e
  join users u on u.id = e.user_id
  join books b on b.id = e.book_id
 where e.status = 'pending';

-- Fulfillment jobs that failed or never ran
select * from watermark_jobs where status in ('queued','failed') order by created_at desc;

-- The commerce audit trail (refunds, chargebacks, revocations)
select type, mor_order_ref, reason, created_at
  from commerce_events order by created_at desc limit 50;
```

---

## Refund a customer

**Do it in Paddle, not in the database.** Paddle sends an `adjustment.created` webhook; the app then marks the order `refunded`, revokes the entitlement (which immediately cuts off download and reader access), and writes a `commerce_events` row.

Refunding directly in the database would leave the customer with a working download and Paddle with no record. If a webhook is ever missed, `revokeEntitlementsForOrder` is the manual path — but fix the webhook rather than making manual revocation routine.

---

## Diagnose "I bought it but can't download it"

Work down this list — it is ordered by how often each cause is the real one.

1. **Is the entitlement `ready`?** If `pending`, fulfillment never completed → go to 2.
2. **Is there a `watermark_jobs` row?** No row at all means the event was never consumed → **Inngest is not synced** (Configuration Manual B3). This is the most likely cause and it fails silently.
3. **Row stuck at `queued` or `failed`?** Read its `error` column. A missing `master_file_key` on the book is the usual culprit — the worker cannot watermark a file that isn't there.
4. **Entitlement `ready` but the download fails?** Check R2 credentials and that the artifact exists. Download URLs are short-lived by design; an expired link is normal and re-requesting fixes it.
5. **Entitlement `revoked`?** The order was refunded or charged back. Check `commerce_events` for which.

---

## Check newsletter signups

Subscribers live in Resend, not in this database. `resend.com/audiences` → your audience. Each contact carries `source` (which form), `signup_purpose`, `consent_text` (verbatim what they agreed to) and `consent_at`.

**If signups are failing with "Subscriptions are temporarily unavailable":** `RESEND_AUDIENCE_ID` is missing from the production environment. It is missing right now — see Configuration Manual B2.

Never import addresses you collected elsewhere, and never add a buyer to the marketing list because they bought something. Buying a book is not subscribing to a newsletter. The purchase triggers a transactional email; the newsletter requires its own opt-in.

---

## Deploy

```bash
npm run lint && npx tsc --noEmit && npm test && npm run build   # all four must pass
npx vercel --prod
```

**Rolling back is fast:** Vercel dashboard → Deployments → pick the previous one → Promote to Production. Do that first and diagnose afterwards.

**Env var changes require a redeploy** — they do not apply to deployments that already exist.
