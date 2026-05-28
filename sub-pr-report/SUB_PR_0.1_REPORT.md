# SUB-PR 0.1 — Repository & Tooling Scaffold — Report

> **Phase:** P0 Foundations · **Unit:** SUB-PR 0.1 (`roadmap/WEB_SITE_ROADMAP.md` §18)
> **Scope (verbatim):** *"Next.js App Router + TypeScript app scaffold, Tailwind + shadcn/ui, lint/format, and the design-token skeleton (§7, ADR-1)."*
> **Date:** 2026-05-28 · **Status:** ✅ Complete — verification gate green.
> **Branch:** `main` · **Remote:** `origin` → `github.com/emredogan-cloud/Eterprise-web-site`

---

## 1. What was accomplished

| Area | Delivered |
|---|---|
| **App scaffold** | Next.js **16.2.6** (App Router, Turbopack) · React **19.2.4** · TypeScript **5** (strict) · Tailwind CSS **v4**, scaffolded in-place via `create-next-app` while preserving the existing git repo + remote. `src/` dir, `@/*` import alias. |
| **UI system** | **shadcn/ui** initialized (`components.json`, `src/lib/utils.ts`, `src/components/ui/button.tsx`). Style set to **`new-york`** and the Button rebuilt on **Radix** (`@radix-ui/react-slot`) per the explicit "Radix primitives" requirement (§7 / `memory/PAST_DECISIONS.md`). |
| **Design-token skeleton** | Full light + dark token system in `src/app/globals.css` (color, radius, fonts, motion) — see §3. |
| **Typography** | Serif display (`Fraunces`, via `next/font/google`) for headings + `Geist` sans for body/UI, wired through CSS variables and the font-family token map in `tailwind.config.ts`. |
| **Tailwind config** | `tailwind.config.ts` created and made **functional** under Tailwind v4 via the `@config` directive in `globals.css` (owns content sources, font-family tokens, reading-measure `max-w-prose`). |
| **Landing placeholder** | `src/app/page.tsx` replaced the boilerplate with a minimal branded hero that exercises the tokens (serif display, accent button, muted text, generous spacing). |
| **CI/CD** | `.github/workflows/ci.yml` — GitHub Actions pipeline running lint → typecheck → build (§2). |
| **Repo hygiene** | `.gitignore` extended to exclude machine-local `.claude/settings.local.json`. |

---

## 2. CI/CD & verification standard (established)

`.github/workflows/ci.yml` runs on every push to `main` and every PR targeting `main`, with `concurrency` cancellation and least-privilege (`contents: read`):

```
npm ci  →  npm run lint  →  npx tsc --noEmit  →  npm run build
```

- Node **24** (matches local dev), npm cache enabled.
- These are the **exact three checks** mandated for every SUB-PR.

**Local pre-merge contract (enforced from now on):** at the end of every SUB-PR I run `npm run lint && npx tsc --noEmit && npm run build` via Bash and only conclude when all three pass. This run's results are in §4.

---

## 3. Design / theme decisions (Roadmap §7)

**Direction:** typography-forward, *calm-literary-but-modern*. Warm **"paper & ink"** neutrals, generous whitespace, high contrast, and **one confident accent**.

| Token group | Decision |
|---|---|
| **Accent** | **Evergreen** (`oklch(0.45 0.085 158)` light / `oklch(0.72 0.11 158)` dark) — a calm "reading-room" green, deliberately chosen as a *single* confident accent and kept **distinct in hue from the destructive red** so "buy" and "danger" never read alike. |
| **Neutrals** | Warm near-white paper (`oklch(0.993 0.004 95)`) + warm ink foreground in light; warm charcoal + paper-white in dark. |
| **Radius** | `0.5rem` — moderate; calm/literary, not pill-shaped. |
| **Type** | Serif (`Fraunces`) headings via `--font-serif`; `Geist` sans body via `--font-geist-sans`; both exposed as `font-serif`/`font-sans` utilities through `tailwind.config.ts`. |
| **Light/Dark** | Both fully tokenized. Dark mode uses the `.dark` class strategy (`@custom-variant dark`). A theme **provider/toggle is intentionally deferred** to a later SUB-PR to keep dependencies minimal — the token layer is ready for it now. |
| **Motion / a11y** | `prefers-reduced-motion` block neutralizes animations/transitions (§7 motion philosophy, WCAG 2.2). Palette targets **WCAG 2.2 AA** contrast (final tuning to be validated with tooling). |

---

## 4. Verification results (this run)

| Check | Command | Result |
|---|---|---|
| Lint | `npm run lint` (`eslint`) | ✅ **Pass** — no errors/warnings |
| Typecheck | `npx tsc --noEmit` | ✅ **Pass** — no errors |
| Build | `npm run build` (`next build`) | ✅ **Pass** — compiled in ~5.5s; TypeScript validated; 4 static pages generated; route `/` prerendered as **○ Static** (SSG) |

**Build route table:**
```
Route (app)
┌ ○ /
└ ○ /_not-found
○  (Static)  prerendered as static content
```

**Known benign warning:** `MODULE_TYPELESS_PACKAGE_JSON` for `tailwind.config.ts` — Node notes it reparses the TS config as ESM (no `"type": "module"` in `package.json`). It is a one-time performance note during build, **not** an error; the build succeeds. Left as-is to avoid changing module resolution for the other config files. Can be silenced later if desired.

---

## 5. Decisions that diverged from the literal brief (for transparency)

1. **Tailwind v4, not a v3-style central config.** `create-next-app` + shadcn ship **Tailwind v4**, which is CSS-first and does *not* auto-load `tailwind.config.ts`. Per roadmap §7 ("pin latest stable at init"), v4 is correct for a new 2026 project. To still honor "update `tailwind.config.ts`", the file exists and is **loaded via `@config`**; color/theme tokens live in `globals.css` (the v4-idiomatic home). Net: both files are real and functional.
2. **Radix over the new shadcn default.** shadcn's current default style (`base-nova`) is backed by **Base UI**, not Radix. Because the instruction *and* the constitution specify **Radix**, the style was switched to `new-york` and the Button uses `@radix-ui/react-slot`; the unused `@base-ui/react` and `shadcn` runtime packages were removed.
3. **`settings.local.json` gitignored.** Machine-local permission grants should not be committed to a shared repo; the shared `.claude/settings.json` remains tracked. (`git add .` therefore will not stage the local file.)

---

## 6. Dependency changes

- **Added:** `@radix-ui/react-slot` (Button primitive).
- **Removed:** `@base-ui/react`, `shadcn` (artifacts of the unused `base-nova` style).
- **Kept (shadcn standard):** `class-variance-authority`, `clsx`, `tailwind-merge`, `tw-animate-css`, `lucide-react`.

---

## 7. Key files created / modified

```
tailwind.config.ts                 (new — @config-loaded token map)
.github/workflows/ci.yml           (new — CI pipeline)
sub-pr-report/SUB_PR_0.1_REPORT.md (new — this report)
components.json                    (style: base-nova → new-york)
src/app/globals.css                (full light/dark design-token skeleton)
src/app/layout.tsx                 (Fraunces serif + metadata)
src/app/page.tsx                   (branded scaffold hero)
src/components/ui/button.tsx       (Radix-based Button)
src/lib/utils.ts                   (cn helper — shadcn)
.gitignore                         (+ .claude/settings.local.json)
+ standard scaffold: package.json, tsconfig.json, next.config.ts, postcss.config.mjs, eslint.config.mjs, public/
```

---

## 8. Definition-of-done vs. SUB-PR 0.1 scope

- [x] Next.js App Router + TypeScript scaffold
- [x] Tailwind CSS configured (v4)
- [x] shadcn/ui initialized with **Radix** primitives
- [x] Lint/format standard (ESLint flat config from `eslint-config-next`)
- [x] Design-token skeleton (§7): color, type, radius, motion, light/dark
- [x] CI/CD verification standard (lint + typecheck + build)
- [x] Verification gate green (lint, tsc, build)

**Out of scope (correctly deferred):** theme toggle/provider, catalog routes, DB, auth, storage — these belong to SUB-PRs 0.2–0.6 and beyond.

---

## 9. Next unit (NOT started — awaiting approval)

**SUB-PR 0.2 — Environments & CI/CD:** preview-per-PR / staging / production, Vercel pipeline wiring, and DB-migration step (extends this CI baseline). Execution is **halted pending explicit approval.**
