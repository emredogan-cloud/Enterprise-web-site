# WS-K — Authority & Distribution System

**Thesis:** authority here is **founder-led and earned**, not bought. A new `.vercel.app`-grade brand with ~0 backlinks does **not** win with link campaigns or PR theater. It wins with the founder's credibility (AWS/systems), an anchor book, build-in-public, and a values-aligned audience — the Vassallo template the strategy already names. **Realistic, founder-operable, sustainable. No fantasy backlinks, no SEO theater.**

---

## 1. The authority flywheel
```
anchor book (founder's systems/AWS book)
        │  build-in-public (X/HN)
        ▼
   audience  ──▶  newsletter (owned)  ──▶  community
        │                                     │
        ▼                                     ▼
   editorial (WS-I)  ──▶  citations / links  ──▶  topical authority
        ▲                                                   │
        └──────────────── compounds back into ◀─────────────┘
```
Each turn: the book + content earn attention → attention → email → community → more content/citations → authority → easier next turn. **Slow, compounding, founder-time-gated.**

## 2. Distribution channels + role (realistic)
| Channel | Role | Cadence |
|---|---|---|
| **X (build-in-public)** | **Primary** — the founder's voice + the anchor book's journey; where the builder audience lives | ongoing, founder |
| **Hacker News** | "Show HN" for the anchor book / a useful free tool; *value-first* (HN punishes self-promo) | a few high-quality moments |
| **Newsletter** | Owned distribution; every editorial piece + drop funnels here | weekly-ish |
| **RSS / syndication** | Lets aggregators + AI/readers pick up posts → citations | passive (ship the feed once) |
| **Niche communities** | DRM-free ethos (Defective-by-Design, Tor/O'Reilly readers), r/selfpublishing, systems/AI circles | sparing, genuine participation |
| **Guest opportunities** | Dev newsletters/podcasts once the anchor book exists | opportunistic |

## 3. Citation strategy (be *citable*, don't beg links)
- **Linkable assets:** the **anchor book** (flagship), the **DRM-free/ownership essays** (shareable to the ethos community), the **edition-provenance pages** (Gutenberg #15877 / Long 1862 — verifiable, citable trust).
- **AI-answer citations:** clean SSG + JSON-LD (WS-G) + answer-extractable editorial (WS-I §7) = surfaced by AI engines → distribution for a zero-authority brand.
- **Comparison/info-gain content** (best-translation, DRM-free map) earns reference links naturally.

## 4. Partnership / mention opportunities (founder-operable)
- **Indie authors** (the Leanpub/Gumroad DRM-free crowd) — curated-home + better presentation + revenue share → they cross-promote. Warmest first (anyone the founder knows).
- **DRM-free ecosystem** — Standard Ebooks / Defective-by-Design / e-reader communities: align on values, contribute, get mentioned (not spammed).
- **Cross-newsletter mentions** with builder/indie newsletters once there's an audience to trade.

## 5. Entity reinforcement (on-site enablers)
- **`sameAs`** in Organization/Person (WS-G) → founder **X + GitHub + the anchor book** once they exist (never fabricate).
- **Consistent brand entity** — the `@id` graph (WS-C/WS-G) already anchors Organization/WebSite/Person; keep it consistent as the domain/brand finalizes (R2 domain decision).
- **Provenance pages** as structured, citable content.

## 6. Trust amplification
Moderated reviews · DRM-free/ownership messaging (the differentiator) · transparent licensing + edition sourcing · Paddle MoR (legitimacy) · a credible founder `/about` (E-E-A-T). These convert *and* earn trust signals search + AI reward.

## 7. Founder authority positioning
**"The builder who curates."** The founder's systems credibility is the moat — surface it: a real `/about` + founder `Person` entity, the anchor book as the flagship, build-in-public as the proof. Not "a bookstore brand" — *a builder's library curated by a builder.*

## 8. First execution plays (sequenced, founder-operable)
1. **Commit to the anchor book** — the single highest-leverage authority + revenue + marketing asset (Vassallo). Everything else compounds off it.
2. **Start build-in-public on X** — narrate the book + the library; this *is* the distribution.
3. **Ship the blog RSS feed** (code, §9) — passive syndication/citation surface; do once.
4. **Publish the provenance page** for the Meditations edition — citable trust + AI-citation bait.
5. **First "Show HN"** — a genuinely useful free artifact (the reading guide, or a tool) — value-first.
6. **Warm indie-author outreach** — 1–2 authors who already know the founder.

## 9. Implementation backlog (ready to implement; deferred to a deps-ready pass)
> Small, additive, deploy-safe. Specs are execution-ready.
- **Blog RSS feed** — `src/app/feed.xml/route.ts` (Route Handler): `getAllPosts()` + `getBaseUrl()`/`SITE_NAME` → RSS 2.0 (`<item>` per post: title, `/blog/<slug>` link+guid, excerpt, category, `pubDate`), `content-type: application/rss+xml`, `revalidate = 3600`, `atom:link rel=self`. Reference it from `<head>` (`alternate` type `application/rss+xml`) and the footer. Mirrors `sitemap.ts`’s shape — isolated, no UX change.
- **`sameAs` wiring** — extend `buildSiteJsonLd`/`buildAuthorJsonLd` to read founder profile URLs from env (`NEXT_PUBLIC_FOUNDER_X`, `…_GITHUB`) and emit `sameAs` only when set (no fabrication).
- **Provenance page** — a `/blog` (or `/about`-linked) editorial page structuring the Meditations edition sourcing (citable; FAQ/Article schema via WS-G helpers).

## 10. Anti-patterns (hard no)
Paid links / PBNs / link exchanges · guest-post farms · mass cold outreach · fake reviews / fake social proof · "SEO press releases" · automating community participation · vanity-metric chasing. Authority here is earned slowly or not at all.
