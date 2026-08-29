# Email List Strategy

## 1. What Amazon does and does not give you — FACT + high-confidence INFERENCE

- Amazon does **not** hand KDP publishers buyer email addresses or any direct-contact PII (see `KDP_WEBSITE_POLICY_RESEARCH.md` §4). Design around zero Amazon-sourced data.
- What Amazon **does** give: aggregate sales/page-read numbers, reviews (public), and — if enrolled — Amazon Ads targeting (spend against Amazon's own audience, not a data export).
- What can be collected **voluntarily, with consent, on the website**: email via newsletter signup, reader-verification pages (already built for Codex Enigmatica), and bonus-content/reader-magnet opt-ins.

## 2. The funnel, as it already exists in code today

```
Amazon reader (buys/reads Codex Enigmatica)
   → finds the answer-verification address printed on the book's last leaf
   → visits /codex-enigmatica/verify (utility-first, noindex, no PII required to use it)
   → optional: newsletter opt-in on that page, tagged source="codex-verify"
   → single Resend Audience, segmented by the `source` custom property
   → (not yet built) automated welcome/next-book email sequence
```

This is **already the correct consent-first funnel shape** the master prompt asks for in §6 — it was built, not merely planned. The gap is not architecture; it's (a) no automation sequence exists yet, and (b) no other book has an equivalent reader-magnet page.

## 3. Recommended master audience architecture

**RECOMMENDATION: one master Resend Audience** (already the implementation — do not fragment into per-book lists; see the code comment in `newsletter-client.ts` explaining exactly why: a second list is a second unsubscribe surface). Segment via the existing `source` tag plus additional properties to add:

| Field | Values today | Values to add |
|---|---|---|
| `source` | `home`, `article`, `category`, `codex-verify` | add one per future reader-magnet page (`world-myths-verify`, etc.) |
| `signup_purpose` | `product-updates` | keep closed-vocabulary, same reasoning as `source` |
| purchase-linked tags (new) | — | `has_purchased` (boolean-ish, set post-webhook), `owned_book_slugs` (best-effort array), `high_value` (>$X lifetime) |
| format preference (new) | — | `kindle_reader` / `print_reader` / `pd_reader` — inferred from which back-matter page they arrived from, not asked directly |

**Explicitly do not collect:** IP, user agent, country, or any field not needed to honor the specific consent given (this is already the stated design principle in the route's own comments — keep it).

## 4. Tags/segments/consent record shape

Already correctly modeled: source + timestamp (Resend's own `created_at`) + unsubscribe state (Resend-native) + purpose string. **RECOMMENDATION additions:**
- Record consent **purpose text verbatim** shown to the user at signup time (not just a code) — protects against future disputes about what was consented to, and is good practice under most privacy regimes (GDPR-style transparency; check `kvkk` page since a Turkish legal page already exists, implying KVKK/Turkish data-protection awareness is already a project concern).
- No geographic field unless a legitimate need (e.g., shipping) arises — matches the "don't over-collect" instruction.

## 5. Automations to build (NEXT, not NOW)

1. **Welcome** — triggered on any new subscription: 1 email, sets expectation, links to catalog.
2. **Post-purchase** — triggered off the existing `entitlements` "ready" event (infrastructure exists — same Resend account, same idempotency pattern used for the "order ready" email) — light cross-sell to next book/bundle.
3. **Reader-magnet-specific** — e.g., anyone tagged `codex-verify` who got the puzzle right gets a short congratulatory email + soft next-book tease; low-effort, high-relevance.

## 6. What NOT to do

- Do not build a second mailing list per book — already correctly avoided in code; keep it that way as the catalog grows.
- Do not ask for anything beyond email + explicit consent at signup — no name, no address, no birthday, unless a specific feature (e.g., shipping a physical bonus) requires it, and even then collect it only at the point of actual need, not speculatively.
- Do not imply Amazon-sourced targeting/emailing — every subscriber must be a genuine opt-in captured on Valice Press's own site.
