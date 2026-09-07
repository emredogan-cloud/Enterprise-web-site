# Branch reconciliation — 2026-09-07

Measured, not assumed. Every figure below comes from `git rev-list --left-right --count`,
`git diff --name-only` and `git merge-tree --write-tree` against **`origin/main`**, fetched at
the time of writing.

## The correction that had to be made first

The local `main` ref in this worktree was **stale by three months** — `3a55fc9`, 2026-06-03,
which still carries the pre-Valice demo storefront (1984, Dune, Sapiens). Measured against it,
every branch looked ~90 commits ahead and `scripts/catalog/valice-catalog.mjs` appeared not to
exist in main at all.

That reading was wrong. **Production deploys from `main`**, and the real `origin/main` is
`415a1d5` — "docs(roadmap-04): Book 04 is live" — the commit behind the current production
deployment `dpl_AtTZNYkfAve7SndhtiQqyn3MZMTd`. Phase 1, Phase 2 and roadmap book 04 are all
already in it, and thirteen ebooks are live on valicepress.com today.

**Always `git fetch` before classifying a branch.** A stale ref does not report an error; it
reports a plausible wrong answer.

## Classification

| branch | vs origin/main | classification | action |
|---|---|---|---|
| `feature/public-domain-phase-2` | **0 ahead, 0 behind** | **ALREADY IN MAIN** | do not merge — it is already there |
| `feature/public-domain-phase-3` | 12 ahead, 0 behind | **COMPLETE AND MERGEABLE** (pending its adversarial review) | fast-forward |
| `feature/book-05-production` | 10 ahead, 0 behind | **COMPLETE** — its report says "everything else on this book is done"; the one open item is an Amazon-account upload, an external blocker | merge after phase-3 |
| `feature/mobile-optimization` | 12 ahead, 24 behind | **COMPLETE** — 9/9 phases, the P0 and all four P1s closed; two performance targets unmet and stated as such | merge; conflict-free |
| `integration/commerce-phases-a-e` | 12 ahead | not examined this session | leave |
| 9 × `feat/*` unmerged | various | not examined this session | leave |

Phase 2 being **0 ahead and 0 behind** is the finding that matters most: §33 asked whether its
work is already represented in main, and it is, exactly. Merging it again would be a no-op at
best.

## Conflict surface, measured

`git merge-tree --write-tree` returns a clean tree for **all three** candidate branches against
`origin/main`. They are not, however, conflict-free against *each other*:

| pair | files both touch |
|---|---|
| phase-3 ∩ mobile | **none** |
| phase-3 ∩ book-05 | 6 — `valice-catalog.mjs`, `companions.ts`, `paddle-products.mjs`, `digital-edition-sources.mjs`, `FOUNDER.md`, `validate-catalog.json` |
| book-05 ∩ mobile | 5 — `books/[slug]/page.tsx`, `cart/actions.ts`, `cart/page.tsx`, `cart-summary.tsx`, `queries/catalog.ts` |

The phase-3 ∩ book-05 overlaps are **additive** — both branches append catalogue rows and
companion entries — so the resolution is to keep both sides, not to choose one.

## Merge order, and why

1. **phase-3** — fast-forward, no conflict possible.
2. **book-05** — conflicts only with phase-3, and only additively.
3. **mobile** — conflicts only with book-05, in the cart and book-detail components.

Each merge is followed by lint, tsc, the test suite and a build before the next begins. Nothing
is force-pushed, nothing is reset, and no working tree but this one is touched.

## What is deliberately not done

`feature/book-05-production` is the branch **another agent's working tree is checked out on**,
and that tree had uncommitted changes throughout this session. Merging a branch does not touch
another worktree, so the merge itself is safe — but the committed head is what gets merged, and
any work that agent has not committed stays with it and is not carried in. That is the correct
behaviour and it is recorded here so nobody later reads the merge as having captured it.
