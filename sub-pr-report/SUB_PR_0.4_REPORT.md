# SUB-PR 0.4 — Object Storage (R2) & Signed-URL Utility — Report

> **Phase:** P0 Foundations · **Unit:** SUB-PR 0.4 (`roadmap/WEB_SITE_ROADMAP.md` §18)
> **Scope (verbatim):** *"Private master + artifact buckets, S3-compatible client, short-TTL signed-URL issuance, per-environment isolation (ADR-6, §12)."*
> **Date:** 2026-05-28 · **Status:** ✅ Complete — verification gate green.
> **Roadmap references consulted:** §9 (Backend & Systems Architecture), §11 (Security & Compliance), §12 (DevOps — ADR-6).

---

## 1. What was accomplished

| Deliverable | Result |
|---|---|
| Dependencies installed | `@aws-sdk/client-s3 3.1055.0` + `@aws-sdk/s3-request-presigner 3.1055.0` — the canonical S3-compatible client for Cloudflare R2. |
| Storage module | `src/lib/storage/index.ts` — lazy `S3Client`, typed bucket constants, signed-URL issuance with TTL enforcement, and `putObject` / `getObject` helpers. |
| Typed bucket identifiers | `MASTERS_BUCKET` + `ARTIFACTS_BUCKET` constants (`as const`) and a `BucketKey` union — *logical* names; real bucket names come from env per environment. |
| Signed-URL TTL policy | Default **600 s** (10 min); hard ceiling **900 s** (15 min) — over-ceiling input **throws**, not silently clamps. |
| Build-time safety | `S3Client` is constructed lazily inside `getClient()`; `Pool`-style — module import never crashes when env vars are missing, so `next build` / `tsc --noEmit` stay green. |
| Agent manual updated | `CLAUDE.md` file-layout now mentions `src/lib/storage/`. |

---

## 2. S3 client configuration for R2

```ts
new S3Client({
  region: "auto",              // R2 expects the literal string "auto"
  endpoint,                    // process.env.R2_ENDPOINT
  credentials: { accessKeyId, secretAccessKey },
  forcePathStyle: true,        // R2 requires path-style addressing
});
```

Three R2-specific knobs:
- **`region: "auto"`** — R2 does not have AWS regions; the SDK still requires the field, and `"auto"` is the Cloudflare-documented value.
- **`forcePathStyle: true`** — R2 only supports path-style URLs (`https://<endpoint>/<bucket>/<key>`), not virtual-hosted-style. Without this flag the SDK assembles the wrong URL and every request 404s.
- **Endpoint, not region inference** — credentials authenticate against `R2_ENDPOINT`, which fully encodes the account.

All three values come from the `.env.example` schema committed in SUB-PR 0.2 (`R2_ENDPOINT`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_MASTERS`, `R2_BUCKET_ARTIFACTS`).

---

## 3. Bucket identifiers — logical, not physical

```ts
export const MASTERS_BUCKET   = "MASTERS"   as const;
export const ARTIFACTS_BUCKET = "ARTIFACTS" as const;
export type BucketKey = typeof MASTERS_BUCKET | typeof ARTIFACTS_BUCKET;

const BUCKET_ENV: Record<BucketKey, string> = {
  MASTERS:   "R2_BUCKET_MASTERS",
  ARTIFACTS: "R2_BUCKET_ARTIFACTS",
};
```

Callers never type a bucket name as a string — they import `MASTERS_BUCKET` / `ARTIFACTS_BUCKET`. The actual cloud-side bucket name is resolved from env at call time, so the **same code points at different physical buckets in Preview / Staging / Production** (Roadmap §12 isolation requirement) without any branching at the call site.

`resolveBucketName(bucket)` throws a clear error if the env var is missing — no silent wrong-bucket disasters.

---

## 4. Signed-URL TTL enforcement (Roadmap §11)

```ts
export const DEFAULT_DOWNLOAD_TTL_SECONDS = 600;   // 10 min
export const MAX_DOWNLOAD_TTL_SECONDS     = 900;   // 15 min — hard ceiling

export async function generateSignedDownloadUrl({ bucket, key, ttlSeconds = 600 }) {
  if (!Number.isFinite(ttlSeconds) || ttlSeconds < 1) {
    throw new Error("ttlSeconds must be a positive number.");
  }
  if (ttlSeconds > MAX_DOWNLOAD_TTL_SECONDS) {
    throw new Error(`ttlSeconds ${ttlSeconds} exceeds the security ceiling of ${MAX_DOWNLOAD_TTL_SECONDS}s (Roadmap §11).`);
  }
  // ... GetObjectCommand + getSignedUrl(client, command, { expiresIn: ttlSeconds })
}
```

Two design decisions worth surfacing:

1. **Throw, do not clamp.** Silent clamping hides bugs (caller "asked for 1 hour" → "got 15 min" → user-reported issue). An explicit throw forces callers to acknowledge the policy and pick a deliberate value.
2. **Default is 10 minutes**, not the 15-minute ceiling. The §11 language ("short TTL — e.g., 5–15 min") is a range; defaulting to the middle leaves headroom for slow networks while still being short.

---

## 5. Build-time safety: lazy initialization

The S3 client is built inside a memoized getter, not at module load:

```ts
let _client: S3Client | undefined;

function getClient(): S3Client {
  if (_client) return _client;
  const endpoint        = process.env.R2_ENDPOINT;
  const accessKeyId     = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error("R2 storage is not configured. Set R2_ENDPOINT, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY.");
  }
  _client = new S3Client({ /* ... */ });
  return _client;
}
```

Why this matters:
- **Build is green even with no R2 credentials in scope.** `next build` evaluates module top-level code; without lazy init we would either need fake env values everywhere or a try/catch wrapper. Lazy init is the cleanest pattern and matches what we did for `src/lib/db/index.ts` (Pool).
- **First real use throws a clear, actionable error.** No silent fallback to a misconfigured client.
- **Memoized:** subsequent calls reuse the single client — important for connection reuse in Vercel Functions / Fluid Compute.

`resolveBucketName()` follows the same pattern: only fails when the bucket env is actually needed.

---

## 6. Public API surface

| Export | Type | Purpose |
|---|---|---|
| `MASTERS_BUCKET`, `ARTIFACTS_BUCKET` | literal const | Type-safe bucket selectors. |
| `BucketKey` | union type | `"MASTERS" \| "ARTIFACTS"`. |
| `DEFAULT_DOWNLOAD_TTL_SECONDS` | const number | 600. |
| `MAX_DOWNLOAD_TTL_SECONDS` | const number | 900 (hard ceiling). |
| `generateSignedDownloadUrl(args)` | async → string | Short-TTL presigned GET URL. |
| `putObject(args)` | async → void | Server-side upload (admin ingest / watermark worker write). |
| `getObject(args)` | async → `{ body: Uint8Array, contentType?, contentLength? }` | Server-side fetch (watermark worker reads master). |

Deliberately **not** included (deferred to later SUB-PRs to keep the API minimal):
- `generateSignedUploadUrl` (direct browser→R2 PUT — useful for admin ingest in 0.6).
- `headObject` / `deleteObject` / `listObjects` (useful for ops, not needed for the watermark pipeline).
- A streaming `getObject` variant — current returns `Uint8Array`; for very large files we will add a stream-returning variant later. Comment in the source flags this.

---

## 7. Verification results (this run)

| Check | Command | Result |
|---|---|---|
| Lint | `npm run lint` | ✅ Pass |
| Typecheck | `npx tsc --noEmit` | ✅ Pass — AWS SDK types resolved cleanly under `strict: true` |
| Build | `npm run build` | ✅ Pass — compiled in ~1.94 s; `/` still **○ Static** (lazy init prevents env-related build failure); 4 static pages |

Same benign `MODULE_TYPELESS_PACKAGE_JSON` warning on `tailwind.config.ts` as in prior SUB-PRs — cosmetic.

---

## 8. Files created / modified

```
src/lib/storage/index.ts             (new — R2 client, signed-URL, put/get helpers)
CLAUDE.md                            (file layout: + src/lib/storage/)
package.json                         (+ @aws-sdk/client-s3, @aws-sdk/s3-request-presigner)
package-lock.json                    (updated)
sub-pr-report/SUB_PR_0.4_REPORT.md   (new — this report)
```

---

## 9. Decisions / deviations worth surfacing

1. **`forcePathStyle: true` and `region: "auto"`** are not defaults — both are non-obvious R2 requirements; documented inline in the code.
2. **Throw on over-ceiling TTL, do not clamp.** Silent clamping hides bugs; an explicit error forces the caller to acknowledge the §11 policy.
3. **Logical bucket constants (`MASTERS_BUCKET` / `ARTIFACTS_BUCKET`) instead of raw strings.** This is what lets the same call site point to different physical buckets per environment (§12 isolation) with zero conditionals.
4. **Lazy client + memoization** — the same pattern as the DB module from SUB-PR 0.3 — keeps `build`/`tsc` green when R2 env is unset and fails loudly on first real use.
5. **Minimal API surface.** Only what 0.4 needs (download signed URL, put, get). Upload signed URLs, head, delete, list, streaming get — deferred to the SUB-PR that first needs them.
6. **`Uint8Array` for `getObject` return** rather than `Buffer` — `Uint8Array` is the universal cross-runtime type; Node `Buffer` is a `Uint8Array` subclass and remains assignable.

---

## 10. Definition-of-done vs. SUB-PR 0.4 scope

- [x] `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner` installed.
- [x] `src/lib/storage/index.ts` created with R2-correct `S3Client` (region, endpoint, forcePathStyle, credentials).
- [x] Lazy initialization — build & tsc green with no env vars set.
- [x] Strongly-typed bucket constants (`MASTERS_BUCKET`, `ARTIFACTS_BUCKET`) and `BucketKey` union.
- [x] `generateSignedDownloadUrl(bucket, key, ttl)` with TTL ceiling enforcement (§11 short-TTL mandate).
- [x] `putObject` + `getObject` helpers.
- [x] Local verification — lint, tsc, build — all green.

**Out of scope (correctly deferred):** real Neon DB connection, real R2 credentials, upload signed URLs (0.6), streaming `getObject`, integration tests against a real R2 mock — they belong to later SUB-PRs.

---

## 11. Next unit (NOT started — awaiting approval)

**SUB-PR 0.5 — Auth integration** (ADR-8): Clerk **or** Auth.js (NextAuth v5), social + email/magic-link, sessions, and server-side authorization helpers. Execution is **halted pending explicit approval.**
