# Digital Bookstore - Agent Instructions

## Architecture & Stack
- Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui.
- PostgreSQL (Neon/Supabase) with Prisma/Drizzle.
- Cloudflare R2 for zero-egress file storage.
- Inngest/Vercel Queues for async watermarking.

## File Layout
- `src/app/` - Next.js routes (SSG/ISR first).
- `src/components/` - Reusable UI components.
- `src/lib/` - Core business logic and DB access.
- `memory/` - Agent's long-term memory and ADRs.
- `scripts/` - Composable utility scripts.

## Commands
- Install: `npm install`
- Dev: `npm run dev`
- Lint: `npm run lint`

## Agent Workflow Rules
- Read before Write: Always `Read` or `Grep` a file before attempting to `Edit` it to avoid stale diffs.
- Verification: Always run `npm run lint` or `npm run build` after making structural changes.
- Memory: Consult `memory/PAST_DECISIONS.md` before making architectural suggestions.
- Do not use generic placeholders; write complete, functional code.
