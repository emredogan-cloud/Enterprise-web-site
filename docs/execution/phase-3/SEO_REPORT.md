# SEO — Phase 3

**Zero pages indexed. Zero impressions. Zero clicks.** That is the measurement,
taken through the Founder's service account, and it is the most useful sentence
in this document.

---

## 1. The baseline

`node scripts/seo/gsc-export.mjs --key <service-account.json> --days 28 --out docs/seo/gsc-baseline-2026-09-02.json`

The service account `gsc-export@valice-press-seo.iam.gserviceaccount.com`
already holds **`siteFullUser`** on `sc-domain:valicepress.com`. The script
signs its own JWT with `node:crypto` rather than adding a Google SDK for one
read; the key file is git-ignored and its contents are never printed.

| | |
|---|---|
| Window | 2026-08-03 → 2026-08-31 |
| Clicks | **0** |
| Impressions | **0** |
| Top pages / queries / countries | none — no impressions in the window |
| Sitemap | `https://valicepress.com/sitemap.xml`, submitted 2026-09-02 07:10 UTC, downloaded 07:10, **0 errors, 0 warnings** |
| URLs submitted | 23 |
| **URLs indexed** | **0** |

### URL inspection

| URL | Coverage | Last crawl |
|---|---|---|
| `/` | Discovered — currently not indexed | never |
| `/books` | Discovered — currently not indexed | never |
| `/books/the-great-book-of-world-games` | Discovered — currently not indexed | never |
| `/ebooks` | **URL is unknown to Google** | never |
| `/companion/world-games` | **URL is unknown to Google** | never |
| `/books/korean-hangul-handwriting-workbook` | **URL is unknown to Google** | never |

"Discovered — currently not indexed, never crawled" is what a site looks like
nine hours after its first sitemap submission. It is the expected state, not a
fault. It is also, unambiguously, why nobody has visited: **there is no organic
path to this site today.**

Baseline saved as JSON so the next run is a diff and not an impression.

---

## 2. Technical state — verified, and it is fine

| Check | Result |
|---|---|
| `robots.txt` | serves; allows `/`, disallows `/api/ /admin/ /account/ /order/ /read/ /cart`; names the sitemap and the canonical host |
| Sitemap | 31 URLs, all three companions included; Search Console downloaded it clean |
| Canonical host | `www.valicepress.com/books` → **308** → `valicepress.com/books` |
| Retired `.vercel.app` alias | **404** — no longer serving the catalogue, so no duplicate index risk |
| Product pages | all 7 published book pages return 200 with a valid canonical and parseable JSON-LD (`validate-catalog.mjs`: 8 pass, 0 warn, 0 error) |
| Book JSON-LD | `workExample` carries the live print editions |
| Author page | `/authors/emre-dogan` 200, biography now rendering as four paragraphs and feeding the meta description as one collapsed line |
| New page | `/books/korean-hangul-handwriting-workbook` 200 with the real ASIN, $12.99 and a four-image preview |
| `/unsubscribe` | 200, `noindex, nofollow` at page level — correct: it must be crawlable enough to be seen, and never indexed |

Nothing technical is blocking indexation. The site is simply new.

---

## 3. What was fixed

- **Eleven author portraits from the pre-rebrand catalogue** — Rowling, Orwell,
  Asimov, Austen, Herbert, Kahneman, Clear, Kiyosaki, Harari, Kleppmann, Brown
  — were being served from `public/images/authors/` on valicepress.com. They
  were referenced by nothing. Deleted.
- The **author biography** shipped as a single `<p>`, which glued four written
  paragraphs into one block, and its meta description was sliced without
  collapsing the newlines. Both fixed.
- The stale duplicate of the Founder handbook in `docs/execution/PHASE-REPORT/`
  was replaced by a pointer — a second handbook that disagrees with the first
  is worse than no second handbook.

### Brand audit

Clean. `Digital Bookstore` survives in exactly one place: the Inngest app id
`digital-bookstore` in `src/lib/inngest/client.ts`. It is an internal
registration key, never customer-facing, and changing it would create a new
Inngest app and orphan the existing function history. **Left deliberately.**

`Vâliçe Press` appears on `/codex-enigmatica/verify` and in the World Games
companion manifest — both surfaces a reader reaches *from a printed page*,
which is the Founder's rule (books print VÂLİÇE). No conflict.

No fake ASIN, no test product, no `.vercel.app` reference outside the redirect
logic and its tests.

---

## 4. What to do next, in order

The instinct after "zero indexed" is to publish content. That is the second
step, not the first.

1. **Wait, and check.** The sitemap is hours old. Re-run the baseline in 72
   hours; "Discovered" should become "Crawled" and then "Indexed". If it has
   not moved in a week, that is a real finding worth chasing.
2. **Then write four pages that answer a question someone types.** Not category
   pages, not thin variants — four, each tied to a product that exists:

   | Page | Query it answers | Product it serves |
   |---|---|---|
   | How to play Senet, Nine Men's Morris and Mancala — the rules, sourced | "how to play senet rules" | World Games (+ companion) |
   | Hangul stroke order: all 40 letters, in order, with the source for each | "hangul stroke order chart" | Hangul workbook (+ companion) |
   | Dudeney's Haberdasher's puzzle: the cut, and why it works | "haberdasher puzzle solution" | Dudeney (+ companion) |
   | Who is who in world mythology: 19 traditions, one page | "norse egyptian aztec gods list" | Codex Mythologica, World Myths |

   Each is genuinely useful on its own, each has a companion download to hand,
   and each has a product to click through to. That is the whole design: free
   utility first, product second.
3. **Do not generate a batch.** Four pages that rank beat forty that do not,
   and forty thin pages on a domain with no authority is how a new site earns a
   quality problem instead of traffic.

---

## 5. Companion pages and measurement

`/companion/world-games`, `/companion/dudeney` and `/companion/hangul` are all
200, all in the sitemap, and all indexable — correctly, because they are the
most linkable thing the site has. Their PDFs serve as `application/pdf` and
`companion_download` fires per file.

**Downloads to date: 0. Visits to date: 0.** Nothing links to them yet: the
printed interiors of every book predate the companions, so no reader of a
Valice paperback has been told they exist. Putting `valicepress.com/companion/…`
into the next interior revision of each title is the single highest-leverage
SEO and funnel action available, and it costs one KDP upload per book.
