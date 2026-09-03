# Founder Actions — the canonical handbook

**Updated:** 2026-09-03, end of the Phase 4 finalization. This is the only list. Everything the agent could do with the repositories, the CLI, the Vercel / Paddle / R2 / Neon / Google APIs, the Amazon listings, the book build pipelines and the production runtime has been done and is **not** here — see `phase-4/PHASE_4_FINALIZATION_REPORT.md`.

Each item is here for one reason: an account the agent cannot enter, a signature only a person can give, a **physical object**, a credential that must never pass through an agent, or a provider that answers "no" to anyone but the account holder.

**Seven items. The first three are uploads of finished files and take about twenty minutes together.**

Format: what to do · why · exact value · how to check it worked.

---

## DO THESE FIRST — finished interiors waiting on an upload

### U1 · Re-upload the two World Games interiors *(unchanged from 2026-09-02)*
*≈ 10 minutes in KDP. Interior only — the covers do not change.*

- **What to do:** KDP → Bookshelf → The Great Book of World Games → paperback → *Edit print manuscript* → upload
  `MY-DİGİTAL-BOOK/THE-GREAT-BOOK-OF-WORLD-GAMES/08_OUTPUT/PAPERBACK/GreatBookOfWorldGames_interior_paperback.pdf`.
  Repeat for the hardcover with `08_OUTPUT/HARDCOVER/GreatBookOfWorldGames_interior_hardcover.pdf`.
  **Do not touch the covers and do not touch the large print.**
- **Why:** both interiors end on the companion page (31 printable boards, cards, score sheets, `valicepress.com/companion/world-games`) and carry your own biography instead of the invented one. Both are still exactly **160 pages**, so the spine and the covers at KDP stay valid.
- **Check:** `node scripts/factory/kdp-linkage-lint.mjs --slug the-great-book-of-world-games` — both read COMPLETE locally; the KDP previewer should show page 160 as the companion page.

### U2 · Upload the two rebuilt World Myths interiors — NEW
*≈ 10 minutes in KDP. Interior only — the covers do not change.*

- **What to do:** KDP → The Great Book of World Myths → paperback → *Edit print manuscript* → upload
  `MY-DİGİTAL-BOOK/THE-GREAT-BOOK-OF-WORLD-MYTHS/08_OUTPUT/paperback/interior.pdf`;
  hardcover → `08_OUTPUT/hardcover/interior.pdf`.
- **Why — two things in one upload:**
  1. Page 233 ("The map, full size") now carries the free companion — the map at full size, culture cards, every pronunciation, a Who's Who — with the address `valicepress.com/companion/world-myths` and a QR code. Until this ships, a buyer of the strongest companion case in the catalogue reaches the last page and is told nothing.
  2. Page 231 now prints your approved biography (the previous one was factual but not your text).
- **Why the covers are safe:** **234 pages before, 234 after.** Per-page text comparison against the 2026-08-12 build: only pages 231 and 233 differ. All fonts embedded; the project's own build gate passed 24 checks.
- **Check:** `node scripts/factory/kdp-linkage-lint.mjs --slug the-great-book-of-world-myths --check-urls` — COMPLETE (+ QR), and the printed address answers 200 on production. In the KDP previewer, page 233 shows the block and the code.

### U3 · Hangul: upload the rebuilt paperback interior (and the hardcover, if it is still in review) — supersedes the old U2
*≈ 5–10 minutes in KDP.*

- **What to do:** KDP → Korean Hangul Handwriting Workbook → paperback → *Edit print manuscript* → upload
  `MY-DİGİTAL-BOOK/KOREAN-HANGUL-HANDWRITING-WORKBOOK/09_OUTPUT/FINAL/paperback/paperback_interior_8.5x11_124pp.pdf`.
  If the hardcover is still editable (in review), replace its interior with `09_OUTPUT/FINAL/hardcover/hardcover_interior_8.25x11_124pp.pdf`; if it has gone live, do it at the first revision.
- **Why:** page 122 ("What this book does not cover") now ends with *Free practice sheets to print* and the address `valicepress.com/companion/hangul`. This is the same file replacement the old U2 asked you to confirm, so one upload settles both: the remediated K46 content **and** the route home.
- **Why the covers are safe:** **124 pages before, 124 after**; only page 122 differs; the NotoSans-Bold name font is embedded (the FINAL manifest carries the new hashes).
- **Check:** `node scripts/factory/kdp-linkage-lint.mjs --slug korean-hangul-handwriting-workbook` — paperback COMPLETE.

---

## REQUIRED

### F1 · Dudeney: settle the KDP AI declaration before the paperback is uploaded *(unchanged)*
- Your wording "Yapay zeka kullanılmadı" is preserved verbatim; the repository records the editorial apparatus (28.1% of the words) as agent-drafted, which is "AI-generated" under Amazon's definition. Decide the KDP form wording; nothing about the direct sale depends on it.

### F2 · Dudeney paperback: order a proof, then upload *(unchanged)*
- `OUTPUT/interior-main.pdf` (144 pp, 6 × 9) + `OUTPUT/cover-paperback.pdf`, $14.99, title "The Puzzles of Henry Dudeney (Annotated)". No hardcover (the arithmetic refuses it). Depends on F1.

### F3 · Run the webhook end-to-end test once *(unchanged)*
- Needs `PADDLE_WEBHOOK_SECRET`, which is correctly out of the agent's reach:
  ```
  npx vercel env pull scripts/tmp/.env.production --environment=production
  node scripts/tmp/e2e-fulfillment.mjs scripts/tmp/.env.production https://valicepress.com the-puzzles-of-henry-dudeney <your-email>
  node scripts/tmp/e2e-cleanup.mjs
  ```

### F4 · Paddle: request the `ebooks` tax category *(unchanged)*
- A per-seller approval Paddle grants by ticket. When granted: `node scripts/catalog/paddle-tax-category.mjs --env scripts/tmp/.env.production --commit`.

### F5 · Amazon Ads: create the first campaign by hand *(unchanged, re-verified 2026-09-03)*
- Still no credential the agent can use: zero AMAZON/LWA/ADS variables; the token endpoint answers 400 for want of a client id; the Ads API answers 401. A Login-with-Amazon security profile, an OAuth consent and an approved Ads API application can only be created by the account holder.
- **The campaign — the PAPERBACK:**
  ```
  Sponsored Products · AUTOMATIC targeting
  Product    World Games paperback  B0HG3KMK9L
  Budget     $5.00 / day
  Bid        $0.35 default
  Duration   14 days; review on day 7 and day 14
  Purpose    harvest real search terms. Not to be profitable.
  Stop       ACOS above 43.8% · $20 spend on a target with no order · 20 clicks, 0 orders
  ```
  Full reasoning and stop rules: `phase-4/ADS_REPORT.md`. **Do U1 first** — an ad sends strangers to a listing; the companion page in the book is what turns a buyer into someone you can reach again.
- **Amazon Attribution:** when you have five minutes in the Attribution console, create one tag for the World Games paperback and paste the whole tracking URL into `valice-catalog.mjs` → `amazonUrl` (keep the ASIN). It takes effect on the next catalogue load. No tag exists today and none is claimed.

### F6 · Turn on the analytics exclusion in each browser you use — NEW, 1 minute
- Sign in → `https://valicepress.com/account/settings` → **Analytics** card → **Exclude my visits**. Repeat in every browser profile you use to check the site (phone included).
- This is the only exclusion Vercel supports (a `beforeSend` opt-out in the browser); there is no IP setting to flip, and the agent cannot press the button in your browser. Details: `phase-4/ANALYTICS_EXCLUSION.md`.

### F7 · Two watching briefs — nothing to do yet
- **World Games large print** — in KDP review since 2026-09-02, not on the shelf. When it appears, say "check"; the agent confirms it by title, price, page count and trim before any ASIN is written. It still carries the old biography and no companion URL; both go in at its first revision after it is live, never during review.
- **Hangul hardcover** — in review, not on the shelf. Catalogue holds `coming_soon` at $21.99 with no ASIN.

---

## OPTIONAL — improves the plan, blocks nothing

- **O1 · One review.** 18 live editions, zero reviews between them. Ads send traffic to a page with no social proof, which is the most expensive traffic there is.
- **O2 · World Games back cover** still carries the invented biography. A cover rebuild, separate from U1.
- **O3 · Monthly KDP report export** → `data/kdp/YYYY-MM.csv`. Still the only way the agent can see Amazon units.
- **O4 · Codex Bestiarium 120 → 112** on all four listings. When you do it, the interior revision that adds `valicepress.com/companion/codex-bestiarium` (the companion is live) rides along — say the word and the agent builds it.
- **O5 · Codex Mythologica, 3 November 2026.** The KDP Select term ends; the ebook becomes sellable here; the three interiors get the companion URL (`valicepress.com/companion/codex-mythologica`, live) in the same pass. One calendar entry, two jobs.
- **O6 · A photograph of you, if you want one on the site.** No real portrait has ever been supplied, and the AI-generated one that stood in for it was removed. Drop a real photo at `public/images/authors/emre-dogan.webp` (3:4, ≥ 900 px tall) and every author surface uses it; without one, the designed initials mark stays, which is honest.
- **O7 · Five playtests for World Games** (unchanged).
- **O8 · Before You Cut: trademark clearance and testers** (unchanged).
- **O9 · Verify the live Myth Hunter's Field Book interior** (unchanged) — and note its PDF carries no title/author metadata; the next build fixes that and adds the companion URL (`valicepress.com/companion/myth-hunters-field-book`, live).
- **O10 · DMARC `p=NONE` → `p=quarantine`** once a few weeks of clean sends accumulate.
- **O11 · Deploy branch.** Production is deployed from `feat/production-readiness` by CLI; Vercel's production branch is still `main`.

---

## Closed since the last handbook — do not ask again

**By the agent this pass:** the four missing companions (World Myths, Codex Bestiarium, Codex Mythologica, the Field Book) built from the books' own data and live; the World Myths and Hangul interiors rebuilt with the route home at unchanged page counts; the KDP linkage audit rebuilt to read metadata, biographies, every URL and false claims, wired into Gate 10; every storefront surface now shows the real cover; the fabricated stats strip, the constant 4.7 rating, the AI-generated portraits and the fake genre paintings removed; public-domain likenesses for Dudeney and Marcus Aurelius with their licences read from the Commons API; real article images from the books; the analytics exclusion built on the mechanism Vercel documents; the sitemap re-submitted to Google; all 19 Amazon listings re-verified against the catalogue.

**Never ask again:** Resend domain verification or audience properties · Google service account · Amazon Ads account creation · Author Central · Attribution registration · KDP Select cancellation · the World Games large-print upload · the Hangul paperback file replacement of 2026-09-02 (superseded by U3, which is the *rebuilt* file) · Dudeney Gates 2 / 5 / 8 / 12 · the Codex Mythologica Kindle price change.
