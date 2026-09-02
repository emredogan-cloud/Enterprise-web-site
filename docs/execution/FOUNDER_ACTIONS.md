# Founder Actions — the canonical handbook

**Updated:** 2026-09-02, end of Phase 4. This is the only list. Everything the agent could do with the repositories, the CLI, the Vercel / Paddle / R2 / Neon / Google APIs, the Amazon listings, the book build pipelines and the production runtime has been done and is **not** here — see `phase-4/PHASE_4_REPORT.md`.

Each item is here for one reason: an account the agent cannot enter, a signature only a person can give, a **physical object**, a credential that must never pass through an agent, or a provider that answers "no" to anyone but the account holder.

**Six items. Two of them take five minutes and unblock the only completed work in the phase that is sitting still.**

Format: what to do · why · exact value · how to check it worked.

---

## DO THESE TWO FIRST — the work is finished and waiting on an upload

### U1 · Re-upload the two World Games interiors
*≈ 10 minutes in KDP. Interior only — the covers do not change.*

- **What to do:** KDP → Bookshelf → The Great Book of World Games → paperback → *Edit print manuscript* → upload
  `MY-DİGİTAL-BOOK/THE-GREAT-BOOK-OF-WORLD-GAMES/08_OUTPUT/PAPERBACK/GreatBookOfWorldGames_interior_paperback.pdf`.
  Repeat for the hardcover with `08_OUTPUT/HARDCOVER/GreatBookOfWorldGames_interior_hardcover.pdf`.
  **Do not touch the covers and do not touch the large print.**
- **Why — two defects, one upload:**
  1. Both interiors now end on a companion page: 31 printable boards at full playing size, culture cards, score sheets, the index of all 56 games, and the URL. Until this ships, **a reader who buys this book on Amazon has no way of knowing valicepress.com exists.** Amazon does not share their address; the inside of the book is the only place we may speak to them again.
  2. Both were printing **"Emre is a puzzle designer, mythologist, and game archivist…"** — a biography nobody authorised, naming three occupations you have not claimed — on the imprint page *and* the back cover. The interior now carries your own words instead.
- **Why the covers are safe:** both editions are **still exactly 160 pages**. The companion page went onto the blank final page rather than a new one, so the spine width does not change. Adding a page would have taken it to 162 and forced a new cover and a new proof.
- **The back cover still has the old bio.** That is a cover rebuild and a separate decision; the interior is the urgent half.
- **Check:** `node scripts/factory/kdp-linkage-lint.mjs --slug the-great-book-of-world-games` — paperback and hardcover already read COMPLETE locally; after the upload, the KDP previewer should show page 160 as the companion page.

### U2 · Hangul: confirm the KDP interior, and bundle the companion page in
*≈ 5 minutes to check. Longer only if it turns into a re-upload.*

- **What to do:** open the Korean Hangul Handwriting Workbook in KDP and confirm the **currently uploaded paperback interior** is `09_OUTPUT/FINAL/paperback/paperback_interior_8.5x11_124pp.pdf`.
- **Why it needs you:** you replaced it and the agent cannot verify from outside. The stated test — page count 124 — **does not discriminate**: the pre- and post-remediation interiors are both 124 pages, and Amazon exposes nothing else. Everything else about the K46 remediation is confirmed in the files.
- **If it turns out to need re-uploading**, say so and the agent will add the companion page (`valicepress.com/companion/hangul`) to the interior first, so one upload does both jobs. This book has no blank final page, so the companion adds one — a spine change and a new cover — which is exactly why it should ride along with a change that is happening anyway rather than be done for its own sake.
- **Check:** `curl -s https://www.amazon.com/dp/B0HHHWXGG4 | grep -o "124 pages"`.

---

## REQUIRED

### F1 · Dudeney: settle the KDP AI declaration before the paperback is uploaded
*Not urgent. Nothing is blocked by it today.*

- **The situation.** You declared "Yapay zeka kullanılmadı", and that is **preserved verbatim** in `project_config.json → compliance.aiDisclosure.founderWording`. It is right for images (the cover is typographic geometry; the cost ledger records $0 of image generation) and right for translation (there is none).
- **For text it conflicts with what the repository records.** The editorial apparatus — the 2,000-word introduction, seven part introductions, 110 hints, the editor's notes, the glossary, the chronology, the concordance: **28.1% of the words** — was drafted by the agent in the Phase 2 session. Amazon's rule, re-read on 2026-09-02, requires disclosure of *"AI-generated"* text, meaning text an AI tool created from your prompts, and does **not** require it for *"AI-assisted"* text, meaning text you wrote with AI help for brainstorming, outlining, editing or grammar. On that definition the apparatus is AI-generated, and undisclosed AI-generated content can block a title or suspend an account.
- **What the agent did:** recorded `text: "generated"` — the fact — with your wording beside it and the conflict written out in `compliance.aiDisclosure.textConflict`. Going against your instruction on a compliance field is not something an agent should do quietly, so it is at the top of this list instead.
- **This does not affect the direct sale.** The Dudeney ebook is not a KDP product and declares nothing to anyone. It is live and selling now.
- **What to decide:** whether the KDP declaration for the eventual paperback says AI-generated text (with the apparatus named) or not. Yours to make; it is your account.

### F2 · Dudeney paperback: order a proof, then upload
*Gate 8's other half. A physical object nobody can delegate.*

- Built and preflight-clean: `OUTPUT/interior-main.pdf` (144 pp, 6 × 9, all fonts embedded) + `OUTPUT/cover-paperback.pdf`. Price confirmed at **$14.99**.
- Title on the listing must be **"The Puzzles of Henry Dudeney (Annotated)"** — KDP requires the tag on a differentiated public-domain edition, and it is also the strongest word available: no competing Dudeney edition in the market sample carries any annotation at all.
- **No hardcover.** Printing is $7.38 against a $12.30 KDP minimum and no price in the band clears the 35% margin target ($26.99 reaches 32.7%). The arithmetic refuses it.
- Depends on **F1**.

### F3 · Run the webhook end-to-end test once
*≈ 5 minutes. Needs `PADDLE_WEBHOOK_SECRET`, which is sensitive and correctly out of the agent's reach.*

```
npx vercel env pull scripts/tmp/.env.production --environment=production
# merge the local R2_* lines into that file as the agent does
node scripts/tmp/e2e-fulfillment.mjs scripts/tmp/.env.production \
  https://valicepress.com the-puzzles-of-henry-dudeney <your-email>
node scripts/tmp/e2e-cleanup.mjs      # removes the test order, entitlement and artifacts
```

- **Why:** the delivery half is proven in production on the real masters — PDF *and* EPUB, read, stamped, written, signed and fetched back byte-identical (`/api/admin/fulfillment-check`). The two links that test cannot reach are the **Paddle webhook signature** and the **Inngest trigger**, and both need that secret.
- Use Dudeney: it is the only book with two artifacts, so this is also the first exercise of the EPUB path through a real order.
- **Also proves** refund → entitlement revoke (`e2e-refund.mjs`), which nothing else covers.

### F4 · Paddle: request the `ebooks` tax category
*≈ 5 minutes to raise a ticket. Paddle grants it; nobody else can.*

- Paddle dashboard → Help / Support → new ticket. Ask for the **`ebooks` product tax category** on the account: you sell DRM-free ebook files as merchant of record and need the reduced ebook VAT treatment.
- The agent **tried the API again** on all six products and Paddle answered `400 product_tax_category_not_approved` on every one. It is a per-seller approval, not a setting.
- When they confirm, tell the agent: `node scripts/catalog/paddle-tax-category.mjs --env scripts/tmp/.env.production --commit` applies it to all six in one run.

### F5 · Amazon Ads: create the first campaign by hand
*≈ 10 minutes. Verified this phase as genuinely unreachable from here.*

- **Why the agent cannot** — established, not assumed: zero AMAZON/LWA/ADS/ATTRIBUTION credentials in the production environment; `api.amazon.com/auth/o2/token` returns **400** for want of a client id; `advertising-api.amazon.com/v2/profiles` returns **401** for want of a bearer token. The three things needed — a Login-with-Amazon security profile, a refresh token you mint through an OAuth consent screen, and a separately approved Ads API application — can only be created by the account owner.
- **The campaign — note it is the PAPERBACK, not the hardcover:**

  ```
  Sponsored Products · AUTOMATIC targeting
  Product    World Games paperback  B0HG3KMK9L
  Budget     $5.00 / day
  Bid        $0.35 default
  Duration   14 days; review on day 7 and day 14
  Purpose    harvest real search terms. Not to be profitable.
  ```

- **Why the recommendation moved from the hardcover:** Phase 3 costed this book at 6 × 9. It is **8.5 × 11**. Real print cost is $3.72 paperback and $8.37 hardcover, so the hardcover nets $12.62 at $34.99 — and **no lower price clears the 35% margin target** ($29.99 returns 32.1%). The competitor is the *Oxford History of Board Games* at **$24.95 for 400 pages**; ours is $34.99 for 160. The hardcover is squeezed from both sides and cannot be repriced out of it. Full reasoning and the stop rules: `phase-4/ADS_REPORT.md`.

### F6 · Two watching briefs — nothing to do yet

- **World Games large print.** Still not on the shelf; an author-wide Amazon search returns no such edition. When it appears, say "check" — the agent finds it by title and confirms it against price, page count and trim before writing the ASIN anywhere. **It still carries the old author biography and no companion URL**; both go in at its first revision *after* it goes live, never during review.
- **Hangul hardcover.** Not on the shelf. Catalogue holds `coming_soon` at $21.99 with no ASIN.

---

## OPTIONAL — improves the plan, blocks nothing

- **O1 · One review.** 18 live editions, **zero reviews between them**, while every competitor in both market samples has between 9 and 466. Ads send traffic to a page with no social proof, which is the most expensive traffic there is.
- **O2 · World Games back cover.** Still carries the invented biography. A cover rebuild, so it is a separate upload from U1 and a separate decision.
- **O3 · Monthly KDP report export** → `data/kdp/YYYY-MM.csv`. Still the only way the agent can see Amazon units.
- **O4 · Codex Bestiarium 120 → 112** on all four listings. Deferred by you on 2026-09-02; nothing has touched it.
- **O5 · Codex Mythologica, 3 November 2026.** The KDP Select term ends that day (enrolled 6 Aug; auto-renew already off, confirmed from the promotion manager). On that date its ebook becomes sellable here, and its three print interiors — which have no companion and no URL — should be revised in the same pass. **One calendar entry, two jobs.**
- **O6 · Five playtests for World Games** (unchanged).
- **O7 · Before You Cut: trademark clearance and testers** (unchanged).
- **O8 · Verify the live Myth Hunter's Field Book interior** (unchanged).
- **O9 · DMARC `p=NONE` → `p=quarantine`** once a few weeks of clean sends accumulate. One DNS record.
- **O10 · Deploy branch.** Production is promoted by CLI from `feat/production-readiness`; Vercel's production branch is still `main`. It works; it is one setting from being obvious.

---

## Closed since the last handbook — do not ask again

**By you, and confirmed by measurement:** the Dudeney gates (2, 5, 8, 12) and the AI declaration — Dudeney is **live and selling**; the Resend audience properties — a signup now returns `consentRecorded: true`; the Codex Mythologica Kindle price — the live page now reads **$6.99**; KDP Select auto-renew — off, term ends 2026-11-03.

**By the agent this phase:** EPUB delivery end to end (schema, worker, library, download, 15 tests, proven in production); the World Myths direct price moved to $6.99 following Kindle, with the old Paddle price archived; the World Games paperback and hardcover interiors rebuilt with a companion page and your own biography, still 160 pages; the linkage audit across all 18 print editions; `kdp-linkage-lint` as a production gate; four SEO utility pages live; the Amazon Ads blockage verified rather than assumed; the trim error in the World Games economics found and corrected; the author biography written into all eight book projects, replacing an invented one in three.

**Never ask again:** Resend domain verification or audience properties · Amazon Ads account creation · Author Central · Attribution registration · the Google service account · KDP Select cancellation · the World Games large-print upload · the Hangul paperback file replacement · Dudeney Gates 2 / 5 / 8 / 12 · the Dudeney AI declaration decision (recorded — only the KDP wording remains, F1).
