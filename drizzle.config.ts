import { defineConfig } from "drizzle-kit";

/**
 * Drizzle Kit configuration.
 *
 *  - `schema` is the single canonical schema module.
 *  - `out` is the migration directory; the SQL files there are committed
 *    and applied by `npm run db:migrate` from CI on push to `main`.
 *  - `dbCredentials.url` uses `DATABASE_URL` when present (real ops) and
 *    falls back to a syntactically valid placeholder so commands that do
 *    not connect (notably `drizzle-kit generate`) still work locally and
 *    in CI before Neon credentials have been provisioned.
 */
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url:
      process.env.DATABASE_URL ??
      "postgresql://placeholder@localhost:5432/_unset",
  },
  verbose: true,
  strict: true,
});
