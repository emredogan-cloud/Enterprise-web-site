# SUB-PR 2.1 — Online Reader (PDF.js) — Report

> **Phase:** P2 Reading & Accounts · **Unit:** SUB-PR 2.1 — *the first unit of Phase 2.*
> **Scope (verbatim):** *"ReaderShell rendering the watermarked artifact via signed URL with range requests (ADR-4)."*
> **Date:** 2026-05-29 · **Status:** ✅ Complete — verification gate green; SSG invariant preserved.
> **Roadmap references consulted:** §7 (UI/Brand), §8 / ADR-4 (reader = PDF.js), §11 (signed-URL + AuthZ discipline).

---

## 1. What was accomplished

| Deliverable | Result |
|---|---|
| `pdfjs-dist` installed | v5.7.284 — the current major. |
| Worker setup | Copied to `public/pdf.worker.min.mjs` by `scripts/copy-pdf-worker.mjs` (postinstall-hooked). Same-origin → CSP `worker-src 'self' blob:` unchanged. |
| `ReaderShell` Client Component | `src/components/reader-shell.tsx` — full-viewport reader with toolbar (Back · page nav · zoom), canvas rendering at devicePixelRatio, ResizeObserver, keyboard shortcuts. |
| `/read/[bookId]` protected route | `src/app/read/[bookId]/page.tsx` — reuses the SUB-PR 1.7 AuthZ discipline + generates a short-TTL signed URL for the watermarked artifact. |
| CSP relaxed for client→R2 fetches | `connect-src` now includes `https:` in dev too (was prod-only). Production behavior unchanged. |
| Verification | lint · tsc · build — all green; `/read/[bookId]` is `ƒ Dynamic`; every other classification unchanged. |

---

## 2. PDF.js worker configuration — the tricky bit

The user flagged this as the trickiest piece. I evaluated three options and committed to one:

| Option | Pros | Cons | Verdict |
|---|---|---|---|
| **CDN** (e.g., jsDelivr) | Zero setup | Adds `worker-src https://cdn.jsdelivr.net` to CSP; version drift between npm install and CDN cache; cross-origin worker. | ❌ — loosens CSP, external dep |
| **Bundler asset import** (`?url`) | Clean, no copy step | Turbopack support for `?url` is not universal; harder to debug if it breaks | ❌ — fragile across bundler versions |
| **Postinstall copy → `public/`** | Same-origin, version-pinned to installed pdfjs-dist, deterministic in every environment | One npm script | ✅ |

**Implementation:**

```js
// scripts/copy-pdf-worker.mjs
import { copyFile, mkdir } from "node:fs/promises";
// … find node_modules/pdfjs-dist/build/pdf.worker.min.mjs → copy to public/
```

```jsonc
// package.json
"scripts": {
  …
  "postinstall": "node scripts/copy-pdf-worker.mjs",
  …
}
```

```ts
// in ReaderShell, inside useEffect
const pdfjsLib = await import("pdfjs-dist");
pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
```

```
.gitignore
+ /public/pdf.worker.min.mjs   // derived artifact; regenerated on every install
```

**Why this is the right call:**
- **CSP `worker-src 'self' blob:` unchanged** — the worker is served from our origin (Next.js static assets), no allowlist needed.
- **Version-pinned** — the copied file matches the *exact* `pdfjs-dist` in `node_modules`, so a CDN cache miss / version skew can never desync our main thread and worker code.
- **Deterministic** — CI, Vercel, and local all run `npm ci` → postinstall → copy. Same bytes everywhere.
- **No bundler magic** — works the same whether we ever swap Turbopack for webpack or vice versa.

The script soft-fails (`process.exit(0)` with a warning) if `pdfjs-dist` isn't in `node_modules` yet — so a fresh `npm install` lifecycle where pdfjs-dist hasn't been extracted at the moment postinstall fires never aborts the whole install.

---

## 3. CSP update — `connect-src` `https:` in dev

The dev CSP previously allowed `ws:`/`wss:` only (for Turbopack HMR). Fetching the signed R2 URL from the browser would have been blocked.

**Before:**
```ts
`connect-src 'self'${isDev ? " ws: wss:" : " https:"}`
// dev:  connect-src 'self' ws: wss:
// prod: connect-src 'self' https:
```

**After:**
```ts
`connect-src 'self' https:${isDev ? " ws: wss:" : ""}`
// dev:  connect-src 'self' https: ws: wss:
// prod: connect-src 'self' https:
```

Production CSP is identical. Dev gains `https:` so PDF.js can fetch the signed URL from R2. We were going to need this anyway for any future client-side fetch to an external API; the reader just made it urgent.

---

## 4. Canvas rendering — memory profile + cancellation

The reader renders **one page at a time** onto a single `<canvas>`. Memory discipline:

| Concern | How it's handled |
|---|---|
| **Peak pixel-buffer memory** | One page × `devicePixelRatio` — typical ~7 MB at 1×, ~30 MB at 2× zoom. Bounded to one page regardless of book size. |
| **Parsed-PDF memory** | `PDFDocumentProxy` stays in memory for the session (compressed page structures, ~20-30 MB for a 10 MB book). `.destroy()` is called on unmount. |
| **In-flight render races** | A `RenderTask` ref tracks the active render; we `cancel()` it before starting a new one (a re-zoom mid-render must NOT corrupt the canvas). |
| **Per-page cleanup** | `page.cleanup()` in `finally` releases the page's intermediate buffers. |
| **High-DPI** | Canvas pixel size = `viewport × devicePixelRatio`; CSS size = unscaled. Renders crisp on Retina without doubling layout space. |
| **Resize re-render** | A `ResizeObserver` on the canvas container (debounced 200 ms) bumps a `renderToken` state, which is in the render effect's deps — the page re-renders at the new fit-width. |
| **HTTP range requests** | We pass the signed URL to `pdfjs.getDocument({ url })`; pdf.js fetches it via byte-range requests by default. R2 supports range requests; we never download the full file just to show page 1. |

```ts
const task = page.render({ canvas, canvasContext: ctx, viewport });
renderTaskRef.current = task;
await task.promise;
```

`RenderingCancelledException` is the expected error when we cancel mid-render; the code catches and swallows it explicitly.

---

## 5. Reader UX — full-viewport overlay, focus mode

A reader is a *focus-mode* surface. Rather than try to fit a reader UI beneath the global `<SiteHeader />`, the `<ReaderShell />` renders as a `fixed inset-0 z-50` overlay:

- `z-50` covers the `z-40` `SiteHeader`, so the user sees only the reading column + the reader's own toolbar.
- The "Back to Library" button (and the `Esc` keyboard shortcut) navigates out, which restores the normal site chrome on the next page.
- **No layout-tree changes were needed.** Avoiding parallel routes / route groups kept the rest of the app simple.

**Toolbar (per the brief — exactly the three pieces requested):**
- `← Library` link (asChild + `next/link` for client-side navigation).
- `«` / `1 / 240` / `»` page navigation (with `tabular-nums` to keep the counter from jumping).
- `−` / `100%` / `+` zoom (clamped 50%–300%).

**Keyboard shortcuts (small polish, big UX):**
- `←` / `→` — previous / next page.
- `Esc` — return to `/account/library`.

All controls are `aria-label`'d and `aria-live="polite"` for the page counter so screen readers announce transitions calmly.

---

## 6. AuthZ — reusing the SUB-PR 1.7 discipline

The route handler intentionally **duplicates** the AuthZ pattern from `downloadBook` rather than abstracting it. Reader and downloader are two separate read paths to the same private artifact; each runs the same disciplined check:

```ts
const userCtx = await loadAuthenticatedLocalUser();        // 1. AuthN
if (!userCtx.ok) return <UnprovisionedNotice {…} />;

const entitlement = await db.query.entitlements.findFirst({
  where: (e, { and, eq }) =>
    and(eq(e.userId, userCtx.localUserId), eq(e.bookId, bookId)),  // 2. AuthZ
  columns: { id: true, status: true, watermarkedKey: true },
  with: { book: { columns: { id: true, slug: true, title: true } } },
});
if (!entitlement) notFound();

if (entitlement.status !== "ready" || !entitlement.watermarkedKey) {   // 3. State
  return <PreparingPage />;
}

const signedUrl = await generateSignedDownloadUrl({              // 4. Short-TTL
  bucket: ARTIFACTS_BUCKET,
  key: entitlement.watermarkedKey,
});

return <ReaderShell bookTitle={…} signedUrl={signedUrl} />;
```

**What's different from `downloadBook`:**
- No `download_logs` insert here. Reader access is *opens-per-session*, which is a different velocity signal than downloads. A future SUB-PR can add `reader_opens` tracking if needed — same pattern, different table.
- Returns a page render (with `<ReaderShell signedUrl={...} />`) rather than the URL itself; the URL flows to the Client Component as a prop.

**What's the same:**
- Ownership via SQL `WHERE` (the DB enforces it through `entitlements_user_book_uk`).
- State guard (`ready` + `watermarkedKey`).
- Short-TTL signed URL via the SUB-PR 0.4 helper (10-min default, 15-min hard ceiling).

---

## 7. Two verification cycles caught two SDK quirks

| Cycle | Error | Fix |
|---|---|---|
| **1st** | ESLint fanned out across `public/pdf.worker.min.mjs` (a 1.2 MB minified file) and reported 1,584 warnings. | Added `"public/**"` to `eslint.config.mjs` `globalIgnores()`. `public/` is for static assets, not source we author. |
| **1st** | `tsc` error on `page.render({ canvasContext, viewport })` — *"Property 'canvas' is missing in type '…' but required in type 'RenderParameters'"*. | pdf.js v5 changed the render-params shape — `canvas` is now required alongside `canvasContext`. Added `canvas` to the call. |

Both fixed; the second cycle ran clean.

---

## 8. Verification (this run)

| Check | Command | Result |
|---|---|---|
| Lint | `npm run lint` | ✅ Pass — zero warnings (after the `public/**` ignore add) |
| Typecheck | `npx tsc --noEmit` | ✅ Pass (after the pdf.js v5 render-params fix) |
| Build | `npm run build` | ✅ Pass — `/read/[bookId]` is `ƒ Dynamic`; every other route classification unchanged |

Full route table (only new entry is `/read/[bookId]`):

```
┌ ○ /
├ ƒ /account/library
├ ƒ /admin
├ ƒ /api/cart/count
├ ƒ /api/inngest
├ ƒ /api/webhooks/paddle
├ ● /authors/[slug]
├ ○ /books                        1h      1y
├ ● /books/[slug]
├ ƒ /cart
├ ● /categories/[slug]
├ ƒ /order/[id]
├ ƒ /read/[bookId]                            ← NEW
└ ƒ /search
```

Every catalog / static classification holds. ADR-1 intact across 14 routes.

---

## 9. Files created / modified

```
scripts/copy-pdf-worker.mjs                       (new — postinstall worker copy)
src/components/reader-shell.tsx                   (new — Client Component reader)
src/app/read/[bookId]/page.tsx                    (new — protected dynamic route)
package.json                                      (+ postinstall, + pdfjs-dist)
package-lock.json                                 (updated)
eslint.config.mjs                                 (+ "public/**" to globalIgnores)
next.config.ts                                    (CSP: connect-src https: in dev too)
.gitignore                                        (+ /public/pdf.worker.min.mjs)
sub-pr-report/SUB_PR_2.1_REPORT.md                (new — this report)
```

---

## 10. Decisions / deviations worth surfacing

1. **Worker copy over CDN or bundler import.** Same-origin → strict CSP unchanged; version-pinned to installed pdfjs-dist; deterministic across CI / Vercel / local. The single most consequential decision in this SUB-PR.
2. **`fixed inset-0 z-50` overlay** for the reader rather than a separate route layout. Avoided refactoring the root layout / parallel routes; reader stays a single component swap.
3. **Cancellation discipline.** A `RenderTask` ref is cancelled before every new render — overlapping renders would corrupt the canvas. The `RenderingCancelledException` is caught and swallowed explicitly.
4. **High-DPI rendering.** Pixel buffer at `devicePixelRatio`, CSS size unscaled — renders crisp on Retina without doubling layout space.
5. **ResizeObserver debounced at 200 ms.** Continuous drags don't trigger N renders; only the settled width fires.
6. **Keyboard shortcuts** (`←`, `→`, `Esc`). Tiny additions, big UX wins for any reader.
7. **CSP `connect-src` gains `https:` in dev** to allow client → R2 fetches. Prod CSP unchanged. Match to prod simplifies behavior.
8. **AuthZ is duplicated, not abstracted.** Reader and downloader are *two read paths*; abstracting away the shape of the check would hide the very thing §11 says to be loud about. Each path enforces the same discipline; both are auditable from a single grep.

---

## 11. Definition-of-done vs. SUB-PR 2.1 scope

- [x] `pdfjs-dist` installed; worker configured (same-origin via `public/`, copied at install time).
- [x] `<ReaderShell />` Client Component — toolbar (Back, page nav, zoom), canvas rendering, resize handling, keyboard shortcuts.
- [x] `/read/[bookId]` protected route — AuthN + AuthZ + state + short-TTL signed URL + `<ReaderShell />`.
- [x] pdf.js uses HTTP range requests against the signed URL natively (no extra client-side wiring needed).
- [x] Local verification — lint (zero warnings), tsc, build — all green; `/read/[bookId]` correctly `ƒ Dynamic`.

**Out of scope (correctly deferred):**
- Reading-progress sync — SUB-PR 2.2.
- Reader opens / pages-read analytics — would mirror `download_logs` (SUB-PR 2.2 or later).
- Text selection / search inside the PDF — pdf.js supports a text layer; UI for it lands in a polish SUB-PR.
- Continuous (scroll) page layout — currently one page at a time; book-style spreads / scroll modes are future polish.
- Page thumbnails sidebar — future polish.

---

## 12. Next unit (NOT started — awaiting approval)

**SUB-PR 2.2 — Reading-progress sync.** Persist / restore `ReadingProgress` per `(user, book)` so the reader opens to the last page the user reached. The `reading_progress` table already exists from SUB-PR 0.3 (composite unique on user_id + book_id, with `page` and `percent` columns). Execution is **halted pending your explicit approval.**
