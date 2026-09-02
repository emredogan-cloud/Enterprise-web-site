# Founder Actions — the canonical handbook

**Updated:** 2026-09-02, end of Phase 3. This is the only list. Everything the
agent could do with the repositories, the CLI, the Vercel / Paddle / R2 / Neon
/ Google APIs, the Amazon listings and the production runtime has been done and
is **not** here — see `phase-3/PHASE_3_REPORT.md`. Each item below is here for
exactly one reason: an account the agent cannot enter, a signature only a
person can give, a credential that must never pass through an agent, or a
provider that answers "no" to anyone but the account holder.

**Eight items. Five of them are one click.** Three finished products are
waiting behind them.

Format: what to do · why · where · exact value · how to check it worked.

---

## URGENT — each one is blocking a product

### F1 · Dudeney: sign the gates and say "publish"
*≈ 20 minutes. It is the only thing between a finished book and a shop that sells it.*

- **What to do:**
  1. Read `MY-DİGİTAL-BOOK/THE-PUZZLES-OF-HENRY-DUDENEY/RIGHTS.md` and
     `DECISIONS.md` (A1–A5). **A4 is now closed** — see below.
  2. Sign Gate 2 (rights):
     ```
     node scripts/factory/gate.mjs "/home/emre/Downloads/MY-DİGİTAL-BOOK/THE-PUZZLES-OF-HENRY-DUDENEY" \
       set 2 passed --evidence RIGHTS.md --evidence valice-house/rights/ledger.csv \
       --owner R6 --approved-by founder
     ```
  3. Sign Gate 5 (facts) — the evidence is complete and `claim-lint` passes
     clean, 18 claims, none pending:
     ```
     node scripts/factory/gate.mjs "…/THE-PUZZLES-OF-HENRY-DUDENEY" \
       set 5 passed --evidence CLAIMS.jsonl --owner R4 --approved-by founder
     ```
  4. Confirm the prices: **$9.99 direct**, **$14.99 paperback**. Both are argued
     from a live market sample in `phase-3/DUDENEY_REPORT.md` §4. **Do not make
     a hardcover** — no price in the band clears the margin target and the
     arithmetic is in that section.
  5. Decide the AI-disclosure answer (`project_config.json →
     compliance.aiDisclosure`) for Gate 10.
  6. Say **"publish"**. The agent flips `websiteStatus` to `published` and the
     ebook to `available` against the Paddle price that already exists, and
     loads the catalogue.
- **Already true, so do not redo it:** the Paddle product and price are live
  (`pri_01m1ha3tdx5bbyfqhe8k6qrep4`, $9.99, one-time, USD, active); the master
  is in the bucket production actually reads; previews are rendered; the
  companion is live; the interior and cover both pass preflight; **Gate 1
  passed today** on a 12-title live Amazon sample.
- **A4 is closed.** The unverified Frame–Stewart claim was verified against the
  primary source — Thierry Bousch, *"La quatrième tour de Hanoï"*, Bull. Belg.
  Math. Soc. Simon Stevin 21:5 (2014) 895–912. The claim was true; the
  attribution named the wrong mathematician and invented co-authors. Corrected
  in place, nothing cut. A second error was found and fixed while checking:
  Dudeney did **not** invent verbal arithmetic.
- **Check:** `npm run validate:catalog`, then buy it yourself once and confirm
  the PDF lands in `/account/library`.

### F1a · Hangul: confirm the KDP interior is the remediated file
*≈ 2 minutes, inside KDP.*

- **What to do:** open the Korean Hangul Handwriting Workbook in KDP and confirm
  the **currently uploaded paperback interior** is
  `09_OUTPUT/FINAL/paperback/paperback_interior_8.5x11_124pp.pdf`. Then sign
  Gate 2: set `05_APLUS_COVER/book_metadata.json → legal.a7_status` to
  `FOUNDER_REVIEWED_CLEARED` with `reviewed_on` / `reviewed_by`, after deciding
  the two open A7 items — the cover-art commercial licence and the KDP AI
  declaration.
- **Why it needs you:** you report having replaced it, and the agent cannot
  check from outside. The stated test — page count 124 — **does not
  discriminate**: the pre- and post-remediation interiors are both 124 pages,
  and Amazon exposes nothing else. Everything else about the remediation is
  confirmed in the files.
- **What changed without you:** the paperback was found **live on Amazon since
  29 August** (B0HHHWXGG4, $12.99, 124 pp) and the site was not linking to it.
  It is published now, with a four-page preview. Gate 2 still gates the
  **direct ebook**, which stays unavailable.
- **Check:** `curl -s https://www.amazon.com/dp/B0HHHWXGG4 | grep -o "124 pages"`.

### F2 · Resend: declare four audience properties
*≈ 3 minutes, dashboard only — the API has no endpoint for this.*

- **Where:** Resend → Audiences → the Valice audience → **Properties** → Add.
- **Exact values** (all type *text*): `source`, `signup_purpose`,
  `consent_text`, `consent_at`.
- **Why:** every signup currently logs *"Resend rejected the consent properties
  … One or more properties do not exist"* and is stored with
  **`consentRecorded: false`**. You have subscribers with no record of what
  they agreed to.
- **Not needed any more:** the domain. **Sending is verified** — a welcome
  email was delivered from `hello@valicepress.com` today with dkim, spf and
  dmarc all passing, and one-click unsubscribe was proven working end to end.
- **Check:** a new signup returns `"consentRecorded":true`.

---

## REQUIRED — before or just after the first sale

### F3 · Run the webhook end-to-end test once
*≈ 5 minutes. Needs `PADDLE_WEBHOOK_SECRET`, which is sensitive and correctly out of the agent's reach.*

```
npx vercel env pull scripts/tmp/.env.production --environment=production
# merge the local R2_* lines into that file as the agent does
node scripts/tmp/e2e-fulfillment.mjs scripts/tmp/.env.production \
  https://valicepress.com meditations <your-email>
node scripts/tmp/e2e-cleanup.mjs      # removes the test order, entitlement and artifact
```

- **Why:** the **delivery half** is already proven in production on the real
  masters — master read → watermark → artifact → signed URL → correct bytes
  back, 4.9 s on the heaviest 8.8 MB book (`/api/admin/fulfillment-check`). The
  two links that test cannot reach are the **Paddle webhook signature** and the
  **Inngest trigger**, and both need that secret.
- **Also proves:** refund → entitlement revoke (`e2e-refund.mjs`), which no
  other test covers.
- **Check:** the script prints `entitlement: ready` and the order-ready email
  arrives.

### F4 · Paddle: request the `ebooks` tax category
*≈ 5 minutes to raise a ticket. Paddle grants it; nobody else can.*

- **What to do:** Paddle dashboard → **Help / Support → new ticket**. Ask for
  the **`ebooks` product tax category** to be enabled on the account. Say you
  sell DRM-free ebook PDFs as a merchant of record and need the reduced ebook
  VAT treatment. When they confirm, tell the agent — one command applies it to
  all six products.
- **Why:** the agent **tried the API** on all six products today and Paddle
  answered `400 product_tax_category_not_approved` on every one. It is a
  per-seller approval, not a setting. All six products are on `standard`, which
  over-collects VAT on ebook sales in jurisdictions that tax books at a reduced
  rate — wrong, but refundable, and better than a shop that cannot take money.
- **Check:** `node scripts/catalog/paddle-tax-category.mjs --env scripts/tmp/.env.production --commit`
  prints `standard → ebooks` instead of `REFUSED`.

### F5 · Codex Mythologica: the Kindle price is still $4.99
*≈ 2 minutes in KDP.*

- **What:** the live Amazon page today reads **"Kindle $0.00 or $4.99 to buy"**.
  The move to $6.99 either has not propagated (KDP takes up to 72 h) or was not
  saved. Check the KDP pricing page; if it says $6.99, this resolves itself and
  the agent will confirm on the next `verify-amazon.mjs` run.
- **The $0.00 half matters more:** it means the title is **still inside its
  Kindle Unlimited / KDP Select term**. Turning off auto-renew does not end the
  current term, so the exclusivity is still in force and Codex Mythologica's
  ebook still may not be sold on valicepress.com. Note the term's end date; the
  agent flips the catalogue the day it lapses.
- **Check:** `node scripts/market/verify-amazon.mjs --slug codex-mythologica`.

### F6 · World Games Large Print: it is not on the shelf
*Nothing to do yet — a watching brief.*

- **What the agent sees:** an author-wide Amazon search on 2026-09-02 returns
  Mythologica's and Bestiarium's large-print editions and **no World Games
  large print**. So it is in KDP review, or the submission did not complete.
  Worth one look at the KDP bookshelf to tell those two apart.
- **When it appears:** send the ASIN, or just say "check" — the agent finds it
  by title and confirms it against price, page count and trim before writing
  it anywhere. The catalogue, the CTA, the JSON-LD and the sitemap all follow
  from one edit. **No ASIN is invented in the meantime.**

### F7 · Hangul hardcover
Same watching brief. Not on the shelf. Catalogue holds `coming_soon` at $21.99
with no ASIN.

### F8 · Amazon Ads: create the first campaign yourself
*≈ 10 minutes. The API genuinely cannot be reached from here.*

- **Why the agent cannot:** the Ads API needs a Login-with-Amazon security
  profile, a refresh token you mint by completing an OAuth consent screen, and
  a **separately approved** Ads API application. None is a credential in this
  environment and none can be created on your behalf. If you complete all three
  and put the refresh token in Vercel, campaign creation and reporting both
  become automatable.
- **The campaign — and note it is not the one the brief proposed:**

  ```
  Sponsored Products · AUTOMATIC targeting
  Products   World Games paperback B0HG3KMK9L  +  hardcover B0HG41F21F
  Budget     $5.00 / day
  Bid        $0.35 default
  Duration   14 days; review on day 7 and day 14
  Purpose    harvest real search terms. Not to be profitable.
  ```

- **Why automatic and why not hardcover-first:** a live check of the three
  proposed keywords found the closest hardcover competitor is the *Oxford
  History of Board Games* at **$24.95 for 400 pages**. Ours is **$34.99 for
  160**. The hardcover has the best contribution per unit and the worst
  conversion odds in the catalogue. And there is no click history at all, so a
  manual campaign on guessed keywords spends the budget proving they were
  guesses. Full reasoning, break-even ACOS per format and the stop rules:
  `phase-3/ADS_REPORT.md`.
- **Worth more than the first $70 of ad spend:** repricing that hardcover to
  **$29.99** (still nets $10.42) so the comparison shopper does not close the
  tab. Your call, not the agent's.

---

## OPTIONAL — improves the plan, blocks nothing

- **O1 · One review.** Eighteen live listings, **zero reviews between them**,
  while every competitor in both market samples has between 12 and 466. Ads
  send traffic to a page with no social proof, which is the most expensive
  traffic there is. Anything legitimate that produces the first honest review
  is worth more than the ad budget.
- **O2 · Companion URL in the next print revision.** Every printed interior
  predates the companions, so no reader of a Valice paperback has ever been
  told they exist. `valicepress.com/companion/world-games` (and the Hangul and
  Dudeney equivalents) in the next interior upload is the only thing that turns
  an Amazon buyer into someone the store can reach again. Bundle it with F1a's
  Hangul interior so it is one upload, not two.
- **O3 · Monthly KDP report export** → `data/kdp/YYYY-MM.csv`. Still the only
  way the agent can see Amazon units.
- **O4 · Codex Bestiarium 120 → 112** on all four listings. Deferred by you on
  2026-09-02; nothing has touched it.
- **O5 · Five playtests for World Games** (unchanged).
- **O6 · Before You Cut: trademark clearance and testers** (unchanged).
- **O7 · Verify the live Myth Hunter's Field Book interior** (unchanged).
- **O8 · DMARC `p=NONE` → `p=quarantine`** once a few weeks of clean sends
  accumulate. One DNS record.
- **O9 · Deploy branch.** Production is currently promoted by CLI from
  `feat/production-readiness`; Vercel's production branch is still `main`. It
  works; it is one setting away from being obvious.

---

## Done since the last handbook — no action needed

**Closed by the agent in Phase 3:** the R2 production-bucket question (settled
by asking the running function: production uses `bookstore-masters-dev`, all
masters present, artifact write proven — the `-prod` buckets were never
created); the production catalogue load; the Hangul paperback found live and
published with a preview; the Dudeney Gate 1 market sample; two factual errors
in the Dudeney edition; the Dudeney cover's missing PDF author; the Paddle
description that promised an undelivered EPUB; the unsubscribe link that was a
literal template variable; the author biography, live and correctly paragraphed;
eleven pre-rebrand author portraits removed from the public site; a Google
service-account **private key** that was sitting un-ignored in the repository
root; the Search Console baseline and URL-inspection export; the commercial
dashboard.

**Closed by you before Phase 3, and confirmed by measurement:** the Resend
sending domain (delivery verified in an inbox, dkim/spf/dmarc all pass); the
Amazon Ads account, Author Central and Attribution; the Google Cloud service
account (it already has `siteFullUser` on the property); the World Games
large-print upload; the Hangul paperback replacement; the Paddle production
provisioning and the earlier catalogue load.

**Never ask again:** Resend domain verification · Amazon Ads account creation ·
Author Central · Attribution registration · the Google service account · KDP
Select cancellation · the World Games large-print upload · the Hangul paperback
file replacement.
