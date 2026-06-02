# SEO Phase Execution Tracker

**Source of truth for what runs next, in what order, and its status.** Read this before starting any execution work.

> **Current state:** Phase 1 (= Wave 0) **IN PROGRESS** — **WS-A (env safety) + WS-B (metadata factory) complete & validated** on branch `feat/seo-p0-discoverability` (uncommitted, not deployed). **WS-C (merge to `main` = prod deploy) is a hard approval gate — awaiting owner go-ahead.** (Phase 0 gate: `00-phase0-validation-gate.md`.)

---

## Execution governance (MANDATORY)

Execution is **phase-gated**. This rule **overrides any automatic-continuation behavior.**

1. Execute **exactly one** Execution Phase (workstream cluster) at a time.
2. On completion, **STOP** and emit a **short report only** (template below).
3. **WAIT** for the owner's **explicit approval** before starting the next phase.
4. **Do NOT chain phases. Do NOT auto-continue.**

**Approval flow:** `Phase N complete → STOP → short report → owner approves → Phase N+1 → …`

### Short-report template (emit after every phase)
```
Phase <N> — <name> — COMPLETE
• Completed:        <what was done>
• Validation:       <lint/tsc/test/build + phase-specific checks + result>
• Files changed:    <list>
• Risks / issues:   <any, or "none">
• Expected impact:  <honest, scoped>
• Readiness:        <ready for Phase N+1? blockers / approvals needed>
→ WAITING for approval to proceed.
```

---

## Numbering disambiguation (important)

There are **two axes** — do not conflate them:

- **Thematic / research Phases 1–7** (in `01-research-report.md` and `03-agent-master-prompts.md`) = SEO *disciplines* (Search Strategy, Technical SEO, On-Page, …). They describe *what each area covers*.
- **Execution Phases (EP) below** = the *gated, dependency-ordered units of work*. This is the order things actually run.

They are **different orderings.** The table maps each EP to its Wave, workstreams, and the thematic prompt(s) to use. **Example:** Execution Phase 1 (foundational infra) uses the **"Phase 2 — Technical SEO"** master prompt — because infra lives under that discipline, even though it runs *first*.

---

## Execution sequence

| EP | Wave | Workstreams | Theme | Master prompt to use (`03`) | Approval gate | Status |
|---|---|---|---|---|---|---|
| **0** | — | (discovery + Phase 0 wins) | Validation | — | — | ✅ **Complete** (validated, unmerged) |
| **1** | 0 | WS-A, WS-B, WS-C | Foundational infra: env safety + metadata factory + merge Phase 0 | **Phase 2 — Technical SEO** | ⚠️ **WS-C merge = prod deploy** | 🟡 **WS-A+B done & validated; WS-C merge pending approval** |
| **2** | 1 | WS-D | Measurement: GSC (**immediate, current domain**) + cookieless events | **Phase 6 — Analytics** | — | ⛔ Blocked (after EP1) |
| **3** | 1.5 | WS-E | Brand domain — **RESEARCH & PLAN ONLY** | **Phase 2 — Technical SEO** (WS-E section) | ⚠️ **plan only; migration is separate, owner-approved** | ⛔ Blocked |
| **4** | 2 | WS-F, WS-G | On-page enablers + entity/AI schema | **Phase 3** + **Phase 7** | ⚠️ **WS-F DB migration** | ⛔ Blocked |
| **5** | 3 | WS-H, WS-I | Keyword→intent map + editorial | **Phase 1 — Search Strategy** | — (founder-gated cadence) | ⛔ Blocked |
| **6** | 4 | WS-J | Newsletter-first CRO | **Phase 4 — UX/CRO** | — | ⛔ Blocked |
| **7** | 5 | WS-K | Authority (founder-led) | **Phase 5 — Off-Page** | — (founder-gated) | ⛔ Blocked |

Full workstream detail (scope/deps/validation/rollback/success) lives in `02-execution-roadmap.md`.

---

## Per-phase notes (refinements locked in)

- **EP1 — Foundational infra (Wave 0 · WS-A/B/C).** Env safety (`??`→`||`, single `siteUrl` module, build-time env validation that **fails loudly** on empty/malformed, `VERCEL_PROJECT_PRODUCTION_URL` fallback) → metadata **factory** `buildPageMetadata()` resolving the OG fork + drift class → merge Phase 0 so OG ships **sitewide**.
  **Refinement (UPDATE 2):** the factory PR requires **before/after metadata regression snapshots** for **homepage, /about, /books, and one PDP** — proving canonical preserved-or-improved, `og:image` + `twitter:image` correct, `og:site_name` present, `og:locale` preserved, output byte-equivalent-or-superior. **Not grep alone.**
  **Gate:** WS-C merge is the first production deploy → owner approval required.

- **EP2 — Measurement (Wave 1 · WS-D).** **Refinement (UPDATE 1):** do **NOT** wait for the domain decision. Verify **GSC on the current canonical domain immediately** and **begin data collection now**; it is migration-capable later via **GSC Change-of-Address**. Prepare brief migration notes. Cookieless typed events at existing funnel points. Privacy-first preserved.

- **EP3 — Brand domain (Wave 1.5 · WS-E).** **Refinement (UPDATE 3):** **RESEARCH & PLAN ONLY.** Deliverables = recommendation + migration runbook + risk analysis + implementation plan. **FORBIDDEN without explicit owner approval:** purchasing a domain, migrating, any Vercel domain change, any DNS action, any production-domain/env modification. The migration itself is a **separate, post-approval** action.

- **EP4 — On-page + schema (Wave 2 · WS-F/G).** Includes an **additive DB migration** (`categories.description`) → owner approval before applying to prod.

- **EP5–EP7 — Editorial / CRO / Authority (Waves 3–5).** Content- and founder-time-gated; paced, not front-loaded; on-policy (no new product features).

---

## Approval log

| Date | Phase | Decision | Notes |
|---|---|---|---|
| — | Phase 0 | ✅ Validated (research cycle) | Wins on branch `feat/seo-p0-discoverability`, unmerged |
| — | Phase 1 · WS-A+B | ✅ Executed & validated on branch (uncommitted) | env safety (R1 fixed end-to-end) + metadata factory; regression diff = additions only; 38 tests green |
| — | Phase 1 · WS-C (merge) | ⏳ Pending | Prod-deploy gate — awaiting owner approval to commit / PR / merge |

*(Append one row per approval as execution proceeds.)*
