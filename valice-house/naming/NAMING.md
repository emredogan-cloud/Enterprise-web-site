# Naming and Asset Conventions

**Status:** ACTIVE · v1 (2026-09-02) · **Read by:** `scripts/factory/new-project.mjs`, `scripts/covers/ingest-covers.mjs`, `scripts/factory/cover-check.mjs`

## 1. Identifiers

| Thing | Form | Example |
|---|---|---|
| **Slug** (the one identifier everything derives from) | lower-kebab, ASCII, permanent — changing it breaks printed addresses and links | `greek-alphabet-handwriting-workbook` |
| Project directory in `MY-DİGİTAL-BOOK/` | UPPER-KEBAB of the slug (existing convention) | `GREEK-ALPHABET-HANDWRITING-WORKBOOK` |
| Companion slug | short, human-typeable, permanent; printed in books | `hangul`, `greek`, `codex-puzzles` |
| Newsletter source tag | `<companion-slug>-companion`, or `codex-verify` for verification pages | `greek-companion` |
| Series key | `valice-script`, `codex`, `the-great-book-of`, `field-book`, `valice-classics` | — |
| Format keys | `ebook`, `paperback`, `hardcover`, `large_print`, `kindle`, `companion` | catalogue enum + `kindle`/`companion` for the factory |
| Version | `v<n>`, integers from 1; **a version is never overwritten** — bump | `front-v2.png` |

## 2. Asset tree (per book, inside the project directory)

```
ASSETS/
  cover/        front-v<n>.png · paperback-wrap-v<n>.pdf · hardcover-wrap-v<n>.pdf · kindle-v<n>.jpg
  interior/     source figures, plates (SVG/PNG), fonts (licence file beside each font)
  paperback/    interior-v<n>.pdf
  hardcover/    interior-v<n>.pdf
  large-print/  interior-v<n>.pdf
  ebook/        digital-v<n>.pdf   (150 DPI direct edition — the file that goes to R2)
  kindle/       <slug>-v<n>.epub
  companion/    <asset-id>.pdf (generated companion sheets are built by the site, not stored here)
  aplus/        module-01.png … module-06.png
```

The storefront repository mirrors only what it serves: `assets/<slug>/cover/front-v<n>.png` (source for ingest) → `public/images/books/<slug>.webp`.

## 3. Storefront and cloud keys

| Asset | Key |
|---|---|
| Cover (web) | `public/images/books/<slug>.webp` (height 1600, q82, ≤ 400 KB) |
| Preview pages | `public/images/previews/<slug>/01.webp … 04.webp` |
| Direct master (R2, private) | `books/<slug>/master/v<n>/master.pdf` — `books.master_file_key` |
| Watermarked artifact (R2, private) | `<orderId>/<entitlementId>.pdf` (existing worker convention) |
| Companion sheets | route `/companion/<companion-slug>/sheets/<asset-id>.pdf` |

## 4. Printed addresses

- Human-typed form on the last leaf: `valicepress.com/companion/<companion-slug>`; verification pages `valicepress.com/<slug>/verify`.
- QR encodes the same URL with `?src=qr`. Never a `.vercel.app` host, never a third-party dynamic QR, never on the cover.
- A printed address is a permanent contract: the route must resolve forever (`companions.ts` rule) and the domain's auto-renew stays on.

## 5. Project files

`project_config.json` (single source of truth) · `DECISIONS.md` (`K##` decided, `A#` awaiting founder) · `.gate` (phase) · `gates.json` (12 gates with evidence) · `MARKET.md` · `RIGHTS.md` · `SPEC.md` · `OUTLINE.md` · `CLAIMS.jsonl` · `CONTENT/` · `DESIGN/` · `ASSETS/` · `OUTPUT/` · `QA/`. Existing projects keep their numbered directories; the template is for new projects.

## 6. Data files in `valice-house/`

`verified-facts/facts.jsonl`, `rejected-facts/rejected.jsonl` (one JSON object per line; ids `F-000001`, `R-000001`) · `rights/ledger.csv` (ids `RT-0001`) · `cost/ledger.jsonl` (per project) · `workflows/gates.json`, `workflows/state-machine.json` (definitions, versioned).
