# Asset map — what every surface shows, and where it comes from

**Date:** 2026-09-03 · **Source of truth:** `src/lib/asset-map.ts` (the conventions) and `src/lib/asset-manifest.json` (what exists, with measured pixel sizes; regenerate with `node scripts/assets/asset-manifest.mjs`, verify with `--check`). **Inventory:** `ASSET_INVENTORY.csv` — every file under `public/images` with its slot, entity, size and the source files that reference it.

Statuses are strict: **VERIFIED** = read from the file or rendered; **OBSERVED** = seen in the Founder's screenshot; **REMOVED** = deleted from the repository this phase.

---

## 1. The defect, and its cause

The Founder's screenshots of 2026-09-03 showed gradient rectangles where covers belong on `/`, `/account/library` and `/cart`, generic "genre world" paintings on `/categories`, silhouettes on `/authors`, and abstract vignettes on `/blog` — while `/ebooks` showed the real covers. **Every book already had a real cover in the repository** (`public/images/books/<slug>.webp`, nine files, all ≥ 1200 px tall, ingested by `scripts/covers/ingest-covers.mjs`).

The cause was not missing art. Three routes (`/books`, `/ebooks`, `/books/[slug]`) resolved the cover themselves with a filesystem check; the other seven routes never asked. There was no single answer to "what is this book's cover", so each surface had its own — and most had none.

## 2. The map

One rule: **an entity resolves to the same asset on every route.**

| Entity | Slot | Convention | Fallback when absent |
|---|---|---|---|
| book | cover | `/images/books/<slug>.webp` (portrait, 1.2–1.75 : 1; squarer large-trim covers letterbox rather than crop) | typographic stand-in — dark ground, the title, a spine highlight (`<CoverArt>`) |
| book | preview pages | `/images/previews/<slug>/p<n>.webp` | none shown |
| book | social card / JSON-LD image | the cover, absolutised on the site origin | R2 `cover_key` URL, else none |
| category | card art | `/images/categories/<slug>.webp` (bespoke, optional) | **a fan of the real covers filed in the category** (`<CategoryCoverStack>`) — self-updating |
| author | portrait | `/images/authors/<slug>.webp` (3:4; verified photograph or public-domain likeness only) | the designed identity mark — initials in the house serif inside an emerald ring, labelled "Valice Press author" |
| blog post | article image | `/images/blog/<slug>.webp` | procedural scene (kept for a post that ships before its picture) |
| page | atmosphere | `/images/<page>/<name>.webp` | procedural scene |

The query layer attaches `coverSrc` to every book row (`src/lib/db/queries/catalog.ts`, `account.ts`), and `toCatalogItems` does the same, so the homepage, catalog, ebooks, cart lines, cart and library recommendation shelves, owned-library tiles and list rows, related-books shelves, search results, order cover stacks and order item rows all draw through `<CoverArt>` or `<BookCover>` with the same path.

## 3. Real assets used — VERIFIED

| Surface | Asset | Provenance |
|---|---|---|
| Book covers, all routes | `public/images/books/*.webp` (9) | ingested from each book project's `ASSETS/cover/front-v<n>.png` via `ingest-covers.mjs`; validated by `validate:catalog` |
| `/authors`, `/authors/henry-dudeney` | `authors/henry-dudeney.webp` | Wikimedia Commons *File:Henry Dudeney.jpg*, photograph c. 1910, **public domain** (PD-old; Commons extmetadata `LicenseShortName: Public domain`, `AttributionRequired: false`), 556 × 681, cropped 3:4, not upscaled |
| `/authors`, `/authors/marcus-aurelius` | `authors/marcus-aurelius.webp` | Wikimedia Commons *File:Marcus Aurelius Glyptothek Munich.jpg*, photograph of the Glyptothek bust, **public domain** (`LicenseShortName: Public domain`, `AttributionRequired: false`), 1909 × 2987 source, cropped 3:4 to 900 × 1200 |
| `/blog` · board-game origin myths | `blog/board-game-origin-myths.webp` | the Nine Men's Morris board from the book's own vector diagram (companion boards pack, page 22) on a paper ground |
| `/blog` · Hangul stroke order | `blog/hangul-stroke-order.webp` | Lesson 3 stroke-order plate from the remediated paperback interior (p. 10) |
| `/blog` · Haberdasher's puzzle | `blog/haberdashers-puzzle.webp` | Dudeney's own dissection figure, *The Canterbury Puzzles* (Project Gutenberg #27635, image 178), **public domain** |
| `/blog` · nineteen traditions | `blog/world-mythology-traditions.webp` | the sigil wheel from the Codex Mythologica cover (the book's own art) |
| `/blog` · why we built Valice Press | `blog/why-we-built-valice-press.webp` | existing `about/about_hero_scene.webp` (decorative scene, no claim) |
| `/blog` · designing for readers | `blog/designing-for-readers-not-algorithms.webp` | existing `library/library_atmosphere.webp` (decorative scene, no claim) |
| `/blog` · how to choose your next book | `blog/how-to-choose-your-next-book.webp` | existing decorative scene |
| `/categories`, home category cards | composed from the covers above | no file; `<CategoryCoverStack>` reads `CategorySummary.coverSrcs` |
| `/about` founder card | none — the initials mark | see §4 |

## 4. Removed — fabricated or orphaned

| File | Why |
|---|---|
| `about/founder_portrait.webp` | AI-generated (visual prompt inventory, item 15.2) and rendered on `/about` with `alt="Emre Doğan"` — a fabricated photograph of a real person. **No real portrait has been supplied.** If one is, it belongs at `public/images/authors/emre-dogan.webp` and every author surface and the About card will use it; until then the designed mark renders. |
| `authors/marcus-aurelius.webp` (old) | AI-rendered bust ("marble + torchlight, stoic", inventory row) presented as the author's likeness. Replaced by a public-domain photograph of an actual bust. |
| `homepage/homepage_hero_main_cover.webp` | a fictional book, "The Luminous Library", never referenced by code. |
| `genres/*.webp` (17) + `genres_explore_scene.webp` | genre paintings for Fantasy, Romance, Horror, Business, Science Fiction… — categories this press does not have. None matched a real slug, so `/categories` fell through to the same procedural castle for every card. The `/genres` route itself was removed in an earlier phase. |
| `components/categories/demo-categories.ts`, `category-scene.tsx` | the keyword matcher and the ten procedural "worlds" (a castle for anything containing "myth"). |
| `components/authors/stats-strip.tsx` | "10K+ authors · 50K+ books · 2M+ readers · 120+ countries" and an "Apply Now" link to `#apply`. None measured; the catalogue has three authors and nine books. |
| the constant `4.7 ★` on `/search` results | an invented rating on every result; nothing in the catalogue has a review. |

## 5. Generated with OpenAI — none

`OPENAI_API_KEY` is **not present** in this environment (checked in the shell environment, `.env`, `.env.local` and the pulled production environment). No image was generated; **$0.00 of the $4.00 budget was spent**; the image ledger (`assets/.image-ledger.json`) is untouched. Every asset added this phase is real material from the books, a public-domain likeness with its licence read from the Commons API, or an existing decorative scene.

The category cards therefore compose real covers instead of bespoke paintings. Should the Founder want bespoke category art later, the slot exists (`/images/categories/<slug>.webp`) and `generate-cover.mjs` carries the budget-capped generator; nothing in the code needs to change.

## 6. Remaining gaps — stated, not hidden

- **Founder portrait:** none. The identity mark is a designed state, not a photograph, by rule (§21 of the brief).
- **`/genres` images for the old route:** gone with the route.
- **Order and library surfaces** were fixed by the same `coverSrc` plumbing but could not be screenshotted signed-in from this session; the code path is covered by `orders-filtering.test.ts` types and the shared `<CoverArt>` primitive, and the production check `validate-catalog.mjs` covers the public routes.
