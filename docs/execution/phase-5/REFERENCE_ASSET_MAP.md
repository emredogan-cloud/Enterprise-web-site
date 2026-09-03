# Reference images → the live storefront: what matches, what does not, and what must never match

**Date:** 2026-09-03 · **Inputs:** the fifteen reference images in `images/`, the seven production screenshots in `images/now/`, and production itself, opened in a browser today at 1500 px.

Companion file: `REFERENCE_ASSET_INVENTORY.csv` (every image, measured). Prompt book for what is genuinely missing: `VALICE_PRESS_REFERENCE_ASSET_PROMPTS.html`.

---

## 1. The finding that governs every row below

**The fifteen reference images are an AI-generated mockup of a fictional bookstore called "Digital Bookstore". They are a layout reference. They are not, and must not become, a content reference.**

Opened one by one, they contain:

| What they contain | Why it cannot be copied |
|---|---|
| The wordmark **"Digital Bookstore"** | The pre-rebrand imprint name. `kdp-linkage-lint.mjs` lists it in `BANNED_COPY` — it is banned in print for the same reason it is banned on screen. |
| **50K+ Books · 10K+ Authors · 25K+ Readers · 2M+ Readers · 120+ Countries · 12,345 books** | Fabricated numbers. This press has **9 books, 1 living author, 0 recorded sales**. Phase 4 removed exactly this strip from `/authors` after it shipped. Re-adding it would be the largest single lie on the site. |
| Covers of **The Midnight Library, Dune, Atomic Habits, The Psychology of Money, Project Hail Mary, The Silent Patient, Thinking Fast and Slow, Sapiens, 1984, Brave New World, The Subtle Art…** | Other publishers' copyrighted covers, on books this press does not publish. |
| AI portraits captioned **Yuval Noah Harari, Jane Austen, Dan Brown, George Orwell, J.K. Rowling, Robert Kiyosaki**, with follower counts | Synthetic likenesses of real, mostly living people, presented as this store's authors. Not a design question. |
| **4.8 ★ (12,543) · 4.7 ★ · 4.9 ★** ratings on every card | There are **zero reviews** across nineteen live Amazon listings. Phase 4 removed the constant 4.7 ★ from search for this reason. |
| Painted genre worlds for **Fiction, Science Fiction, Personal Growth, Business, History** | Categories this press does not have, illustrated with art that depicts nothing it publishes. Phase 4 removed seventeen of these. |

So the target is **not** "98 % pixel fidelity to the reference". The target the reference can honestly serve is:

> **the composition, hierarchy, crop, aspect ratio, density and placement of the reference, carrying Valice Press's real books, real people and real numbers.**

Every row in §4 is scored on that. Where a reference row is scored "deliberately different", the reason is in the row and it is always one of the six lines above.

---

## 2. The second finding: `images/now/` is a loading state, and it is reproducible

The Founder's seven screenshots, taken 2026-09-03 04:27–04:30, show a site that looks broken in two specific ways. Both were investigated against production today rather than taken at face value, and they resolve differently.

### 2a · The empty category cards — real, reproducible, now fixed

`images/now/Screenshot from 2026-09-03 04-27-51.png` shows the homepage's five category cards as **empty gradient panels**. Opening the same page today and screenshotting immediately after load reproduces it; waiting three seconds resolves it to five cards fanned with their real covers.

The same thing on `/books` is worse and was the real defect. `catalog-book-card.tsx` painted **the per-book gradient stand-in underneath every card** and then laid the real cover on top as a lazy-loaded `next/image`. Until the image arrived — the whole of a slow connection, and about a second on a fast one — a visitor saw a grid of saturated green, blue, orange and red rectangles. That is a page of placeholder covers, which is precisely what Phase 4 set out to remove; it removed the *final* state and left the *first* one.

**Fixed today, in two lines of intent:**

- when a book has real art, the ground beneath it is now a neutral dark frame, not the per-book gradient. An empty dark frame says *loading*. A coloured panel says *this is the cover*, and that is a lie about a book whose cover exists;
- the first four cards in the grid — the row that is above the fold at every width this store is used at — carry `priority`, so they are not lazy-loaded at all.

The gradient and the typographic stand-in remain exactly as they were for a book that genuinely has no art. That is a real state and it should look designed.

### 2b · The fabricated stats strip on `/authors` — already gone; the screenshot is stale

`images/now/Screenshot from 2026-09-03 04-28-04.png` shows `/authors` with **10K+ AUTHORS · 50K+ BOOKS · 2M+ READERS · 120+ COUNTRIES** and an "Apply Now" button, and shows Emre Doğan and Henry Dudeney as identical grey silhouettes.

Production today shows none of that: no stats strip, no Apply Now, a designed **ED** monogram for the Founder, Dudeney's real 1910 photograph, and the Glyptothek Marcus Aurelius. `curl` confirms the strings are absent from the served HTML. **That screenshot is of a cached page from before the 2026-09-03 02:36 deployment.** Phase 4's claim holds; nothing needs doing.

This is worth stating plainly because it cuts both ways: one of the two "the site looks wrong" screenshots was a real defect and one was a stale cache, and only opening production settles which.

---

## 3. What the storefront actually draws today

Measured from `public/images/` and `src/lib/asset-map.ts`:

| Slot | Path pattern | Present | State |
|---|---|---|---|
| Book covers | `images/books/<slug>.webp` | **9 / 9** | every book this press has |
| Preview pages | `images/previews/…` | 34 | sample spreads |
| Author portraits | `images/authors/<slug>.webp` | 2 of 3 | Dudeney (PD, c. 1910), Marcus Aurelius (Glyptothek, PD). **`emre-dogan.webp` absent by rule** |
| Article images | `images/blog/<slug>.webp` | **7 / 7** | one per post, none missing |
| Category art | `images/categories/<slug>.webp` | **0 / 5** | intentional — see §4 |
| Route scenes | `about`, `authors`, `homepage`, `library` ×2, `order`, `settings` ×2 | 8 | decorative atmospheres |

**Nothing on the storefront resolves to a missing file.** The gaps below are gaps of ambition, not of correctness.

---

## 4. Route by route

Scored on composition, not on content. "Fidelity" is a judgement of how close the live route is to the reference's *structure*.

### `/` — homepage · reference `ana-sayfa-referans-image.png` (962 × 1635)

| Element | Reference | Live | Verdict |
|---|---|---|---|
| Hero: left headline stack, right floating book, badge above | ✓ | ✓ | **match** |
| Stats card floating over the hero art (50K/10K/25K) | ✓ | absent | **deliberately different** — fabricated numbers |
| Trust row of four icon+label pairs under the CTA | ✓ | ✓ | match |
| "Scroll to explore" cue | ✓ | ✓ | match |
| Four "why readers love us" cards, one row | ✓ | ✓ | match |
| Category strip, six cards, 3:4, image-filled, label bottom-left | six | **five**, image-filled, label bottom-left | match in form; five because there are five categories |
| Category card imagery | painted genre worlds | **the category's own real covers, fanned** | **deliberately different, and better** — the card shows what is actually on that shelf |
| Featured books, six across, cover + title + author + price | ✓ | ✓ | match |
| Rating under each featured card | 4.8 ★ etc. | absent; **"Ebook · direct" / "Print · Amazon"** instead | **deliberately different** — zero reviews exist; the format line is information the reader can use |
| Newsletter band | ✓ | ✓ | match |
| Footer, five columns | ✓ | ✓ | match |
| **Vertical rhythm** | dense; sections ~80–120 px apart | **~250–350 px of empty ground between sections** | **gap** — the live page is roughly a third longer than it needs to be, and on a 1100 px window "Why readers love us" arrives after a screen of nothing. Spacing, not assets. |

### `/books` — catalogue · reference `all_books_referans_image.png` (1536 × 1024)

| Element | Reference | Live | Verdict |
|---|---|---|---|
| Centred "CATALOG" eyebrow + serif H1 + one-line sub | ✓ | ✓ | match |
| **Left filter rail**: search, categories with counts, formats, price slider, rating | ✓ | search, categories with counts, price slider | **match, minus rating** — a rating filter over zero reviews would filter nothing |
| "Showing 1–12 of 50,231" | ✓ | "Showing 1–9 of 9 books" | match in form, honest in content |
| Sort control + grid/list toggle, right-aligned | ✓ | ✓ | match |
| 5-up cover grid, 2:3, wishlist heart, lock glyph | ✓ | 4-up at this width, 2:3, heart, lock | match |
| BESTSELLER / NEW badges | ✓ | present, from real catalogue state | match |
| Star rating + price under each card | ✓ | price only | **deliberately different** |
| Pagination | 4,186 pages | absent (9 books) | correct |
| **Cover loading state** | n/a | **was coloured placeholder panels** | **fixed today** — §2a |

### `/authors` · reference `authors_sekmesi_referans_image.png`

| Element | Reference | Live | Verdict |
|---|---|---|---|
| "AUTHORS" eyebrow, "Voices that **inspire**" with the accent word in green | ✓ | ✓ — same words, same accent | match |
| Hero art | a reading-room scene **bleeding off the left edge**, figure at a desk | a **centred arch-and-silhouette glow** behind the heading | **gap** — the live hero reads as a generic decoration and puts a dark shape directly behind the sub-heading, hurting legibility. The one asset on this page worth commissioning: see prompt **A-01** |
| Author search field | ✓ | ✓ | match |
| Genre filter chips | ✓ | absent | **not appropriate** — three authors |
| Author cards: portrait fills the card top, scrim, name, role, works, count | 6-up | 3-up, same anatomy | match |
| Follower counts (12.5K) and FEATURED badge | ✓ | absent | **deliberately different** — invented |
| Card consistency | six identical portraits | **ED monogram / Dudeney photograph / Aurelius bust — three different crops and croppings** | **gap** — the row does not read as a set. The monogram card also carries an extra "VALICE PRESS AUTHOR" eyebrow the other two lack, so the three cards are different heights. CSS, not an asset. |
| Stats strip + "Are you an author? Apply Now" | ✓ | **removed** | correct — see §2b |

### `/categories`, `/blog`, `/blog/[slug]`, `/cart`, `/search`, `/account/library`, `/account/orders`, `/order/[id]`, `/account/settings`, `/about`

All ten follow their reference's anatomy — eyebrow, serif H1, one-line sub, then the route's own content in cards on the same glass — and all ten differ from it in exactly the same three ways: no invented counts, no invented ratings, real Valice books rather than other publishers'. Every one of them resolves its images from `asset-map.ts` and none has a missing file.

Two references map to nothing and should be retired rather than built:

- `notes_sekmesi_referans_image.png` — a reading-notes feature. **This store has no notes feature.** Building the page before the feature would be a storefront advertising something that does not exist.
- `genres_sekmesi_referans_image.png` — `/genres` was removed in Phase 4 (eight hard-coded genres with ~44,000 invented titles against a catalogue of eight) and 308-redirects to `/categories`. The reference documents the page that was deleted, on purpose.

---

## 5. Where the reference is right and we are not

Three things, in order of what they are worth:

1. **Density.** The reference is a tight page. The live homepage puts a quarter-screen of empty ground between every section. Nothing needs generating; the spacing scale needs one pass.
2. **The `/authors` hero.** The reference bleeds a scene off the left edge behind the heading, which reads as editorial. The live centred glow reads as a template and sits behind the sub-heading. One asset — prompt **A-01**.
3. **Author-card consistency.** Three cards, three different image treatments, one with an extra label. This is CSS and a crop rule, not new art.

## 6. Where we are right and the reference is not

Recorded so that a future pass does not "fix" these back:

1. **Category cards built from the category's own covers.** The reference paints a forest for "Fiction". Ours fans the three real books on the Myth & Folklore shelf. The reference's version is prettier and says nothing true.
2. **Format lines instead of star ratings.** "Ebook · direct $12.99" / "Print · Amazon · On Amazon" tells a reader how to get the book. A 4.7 ★ on a book with no reviews tells them a lie.
3. **A monogram where no photograph exists.** The AI-generated "founder portrait" that stood here was removed in Phase 4. A designed ED mark is honest; a synthetic face of a real person is not. Handbook **O6** stands: drop a real photo at `public/images/authors/emre-dogan.webp` (3:4, ≥ 900 px tall) and every author surface picks it up with no code change.
4. **No stats strip.** It comes back the day the numbers are real, and not before.

---

## 7. What is genuinely missing

Four items. Two can be generated, one must be photographed, one is a decision.

| ID | Asset | Destination | Why | Route |
|---|---|---|---|---|
| **A-01** | Authors hero atmosphere, bleed-left | `public/images/authors/authors_hero_bleed.webp` | replaces a centred glow that sits behind the sub-heading | `/authors` |
| **A-02** | Companion page share card | `public/images/companion/og-default.webp` | seven companion pages are printed inside books and will be shared; none has a preview image, so every share renders as a bare link | `/companion/*` |
| **A-03** | Category ground textures ×5 | `public/images/categories/<slug>.webp` | **optional and deliberately restrained** — abstract paper/ink grounds *behind* the real covers, never illustrations of a genre. Only worth doing if the fanned-cover cards are judged too plain; they are honest as they stand | `/`, `/categories` |
| **—** | A photograph of the Founder | `public/images/authors/emre-dogan.webp` | **cannot be generated.** A synthetic portrait of a real person presented as that person is the thing Phase 4 removed. Handbook O6. | `/authors`, `/about` |

Prompts for A-01, A-02 and A-03, with exact filenames, destinations, dimensions and negative constraints, are in `VALICE_PRESS_REFERENCE_ASSET_PROMPTS.html`.

**Nothing was generated in this phase. `OPENAI_API_KEY` is absent from this environment — $0.00 spent, as in Phase 4.** The prompts are written so the Founder can run them anywhere and drop the result in; §8 is why that is all it takes.

---

## 8. Ingestion: why a file drop is the whole procedure

`src/lib/asset-map.ts` resolves every slot by convention against a committed manifest:

```
bookCoverSrc(slug)      → /images/books/<slug>.webp        or null
authorPortraitSrc(slug) → /images/authors/<slug>.webp      or null
categoryArtSrc(slug)    → /images/categories/<slug>.webp   or null
blogImageSrc(slug)      → /images/blog/<slug>.webp         or null
```

Each returns `null` when the file is absent, and every consumer already has a designed state for `null`. So the Founder's procedure is:

1. copy the prompt from the HTML;
2. generate the image;
3. save it under the exact filename the prompt names;
4. put it in the exact folder the prompt names;
5. `node scripts/assets/asset-manifest.mjs --write` — the manifest picks the file up;
6. commit.

No component is edited, no route is touched, no code changes. `npm test` fails if the manifest is stale, which is how a forgotten step 5 is caught rather than shipped.

---

## 9. Visual regression, run today

Production, Chrome, 1500 × 1100:

| Route | Result |
|---|---|
| `/` | hero, trust row, why-cards, **five category cards fanned with real covers**, six featured books with real covers and honest format/price lines, newsletter, footer. No broken image, no 404, no wrong crop. Excess vertical space noted in §4. |
| `/books` | filter rail, 9 books, real covers, honest counts. **Placeholder-colour loading state found and fixed.** |
| `/authors` | three cards — ED monogram, Dudeney photograph, Aurelius bust. **No stats strip, no Apply Now.** Crop inconsistency noted in §4. |
| `/companion/*` | all seven answer 200 (`validate-catalog`, `kdp-linkage-lint --check-urls`) |

Not screenshotted from this session: `/account/library`, `/account/orders`, `/order/[id]`, `/account/settings` — they need a signed-in session the agent does not have. They draw covers through the same `asset-map` path as the public routes and are covered by the asset-map tests and the production validator, which is evidence, not a screenshot. Stated rather than glossed.

Mobile was not re-run this pass. The components are the same and the breakpoints did not change, but that is a reason to expect it to be fine, not a measurement — recorded as **UNVERIFIED**.
