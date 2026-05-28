# Digital Bookstore - Agent Instructions

## Architecture & Stack
- Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui.
- PostgreSQL on Neon (serverless) with Drizzle ORM + drizzle-kit.
- Cloudflare R2 for zero-egress file storage.
- Inngest/Vercel Queues for async watermarking.

## File Layout
- `src/app/` - Next.js routes (SSG/ISR first).
- `src/components/` - Reusable UI components.
- `src/lib/` - Core business logic and DB access.
- `src/lib/db/` - Drizzle schema, relations, and the Neon client (`db`).
- `src/lib/storage/` - Cloudflare R2 S3-compatible client and signed-URL utilities (ADR-6).
- `drizzle/` - Generated SQL migrations (committed; applied by `db:migrate`).
- `memory/` - Agent's long-term memory and ADRs.
- `scripts/` - Composable utility scripts.

## Commands
- Install: `npm install`
- Dev: `npm run dev`
- Lint: `npm run lint`
- Test: `npm test`
- Build: `npm run build`
- DB generate migrations: `npm run db:generate`
- DB apply migrations: `npm run db:migrate`
- DB push (dev convenience only): `npm run db:push`
- DB browser (Drizzle Studio): `npm run db:studio`

## Agent Workflow Rules
- Read before Write: Always `Read` or `Grep` a file before attempting to `Edit` it to avoid stale diffs.
- Verification: Always run `npm run lint`, `npx tsc --noEmit`, and `npm run build` after making structural changes. For schema changes, also run `npm run db:generate`.
- Memory: Consult `memory/PAST_DECISIONS.md` before making architectural suggestions.
- Do not use generic placeholders; write complete, functional code.
