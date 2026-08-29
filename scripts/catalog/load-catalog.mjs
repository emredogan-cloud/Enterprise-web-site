/**
 * Load the Valice Press catalog into the database.
 *
 * Idempotent: every write is an upsert keyed on a natural key (book slug,
 * author slug, category slug, or the (book, format) pair). Re-running
 * updates rows in place and never duplicates. Safe to run after editing
 * `valice-catalog.mjs`.
 *
 * Deliberately conservative in three ways:
 *
 *  1. Books load as `draft`. This script never publishes anything. Whether
 *     a title is fit to sell depends on the per-book `blockers` list, which
 *     includes things like an unresolved content licence and an untested
 *     puzzle set — decisions that belong to the founder, not to a loader.
 *     Publishing is a separate, explicit action (see the operations manual).
 *
 *  2. It never sets `paddlePriceId`. That value must come from a real
 *     Paddle price, and writing a plausible-looking fake is precisely how
 *     the existing production row ended up with `pri_test_meditations_999`
 *     and a checkout that fails at the till.
 *
 *  3. It refuses to touch a database it wasn't pointed at deliberately.
 *     Production (`neondb`) and sandbox (`bookstore`) live on the same host;
 *     the target is printed and, for production, must be confirmed with
 *     --i-know-this-is-production.
 *
 * Usage:
 *   node scripts/catalog/load-catalog.mjs                 # dry run
 *   node scripts/catalog/load-catalog.mjs --commit
 */
import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";
import { AUTHORS, BOOKS, CATEGORIES } from "./valice-catalog.mjs";

const commit = process.argv.includes("--commit");
const prodOk = process.argv.includes("--i-know-this-is-production");

function readEnvUrl() {
  const raw = readFileSync(".env.local", "utf8");
  const line = raw.split("\n").find((l) => l.startsWith("DATABASE_URL="));
  if (!line) throw new Error("DATABASE_URL not found in .env.local");
  return line.slice("DATABASE_URL=".length).trim().replace(/^["']|["']$/g, "");
}

const sql = neon(readEnvUrl());
const [{ db }] = await sql`select current_database() as db`;

console.log(`target database : ${db}`);
console.log(`mode            : ${commit ? "COMMIT" : "DRY RUN"}`);
console.log(`books           : ${BOOKS.length}`);
console.log(
  `formats         : ${BOOKS.reduce((n, b) => n + b.formats.length, 0)}\n`,
);

if (db === "neondb" && commit && !prodOk) {
  console.error(
    "REFUSING: that is the production database.\n" +
      "Re-run with --i-know-this-is-production if this is genuinely intended.",
  );
  process.exit(1);
}

if (!commit) {
  for (const b of BOOKS) {
    const sellable = b.formats.filter(
      (f) => f.fulfillment === "direct" && f.availability === "available",
    ).length;
    console.log(
      `WOULD UPSERT  ${b.slug.padEnd(36)} draft  ${String(b.formats.length).padStart(2)} formats  ` +
        `${b.directSaleEligible ? "direct-eligible" : "NOT direct-eligible"}  ` +
        `${sellable} buyable  ${b.blockers.length} blocker(s)`,
    );
  }
  console.log("\ndry run complete — re-run with --commit to write.");
  process.exit(0);
}

// ---- categories -----------------------------------------------------------
const categoryIds = new Map();
for (const c of CATEGORIES) {
  const [row] = await sql`
    insert into categories (slug, name, description)
    values (${c.slug}, ${c.name}, ${c.description})
    on conflict (slug) do update set name = excluded.name,
                                     description = excluded.description
    returning id`;
  categoryIds.set(c.slug, row.id);
  console.log(`category  ${c.slug}`);
}

// ---- authors --------------------------------------------------------------
const authorIds = new Map();
for (const a of AUTHORS) {
  const [row] = await sql`
    insert into authors (slug, name, bio)
    values (${a.slug}, ${a.name}, ${a.bio})
    on conflict (slug) do update set name = excluded.name, bio = excluded.bio
    returning id`;
  authorIds.set(a.slug, row.id);
  console.log(`author    ${a.slug}`);
}

// ---- books ----------------------------------------------------------------
for (const b of BOOKS) {
  // `books.priceCents` is NOT NULL and represents the canonical direct-sale
  // price. Use the ebook format's price where there is one; where there
  // isn't (print-only titles, or a price the founder hasn't set), store 0
  // and leave the book in draft — a zero here is only ever seen by the
  // admin, because nothing at zero is publishable.
  const ebook = b.formats.find((f) => f.format === "ebook");
  const canonicalPrice = ebook?.priceCents ?? 0;

  const [book] = await sql`
    insert into books (slug, title, subtitle, description, language,
                       price_cents, currency, page_count, status)
    values (${b.slug}, ${b.title}, ${b.subtitle}, ${b.description}, ${b.language},
            ${canonicalPrice}, 'USD', ${b.pageCount}, 'draft')
    on conflict (slug) do update set
      title       = excluded.title,
      subtitle    = excluded.subtitle,
      description = excluded.description,
      language    = excluded.language,
      page_count  = excluded.page_count,
      -- Price and status are deliberately NOT overwritten on re-run: once
      -- the founder has set a real price or published a title, a routine
      -- re-load must not silently revert either.
      updated_at  = now()
    returning id, status`;

  console.log(`book      ${b.slug}  (${book.status})`);

  for (const slug of b.categories) {
    await sql`
      insert into book_categories (book_id, category_id)
      values (${book.id}, ${categoryIds.get(slug)})
      on conflict do nothing`;
  }
  for (const slug of b.authors) {
    await sql`
      insert into book_authors (book_id, author_id)
      values (${book.id}, ${authorIds.get(slug)})
      on conflict do nothing`;
  }

  for (const f of b.formats) {
    await sql`
      insert into book_formats (book_id, format, availability, fulfillment,
                                price_cents, currency, amazon_asin, amazon_url,
                                page_count, isbn, master_file_key)
      values (${book.id}, ${f.format}, ${f.availability}, ${f.fulfillment},
              ${f.priceCents}, 'USD', ${f.amazonAsin}, ${f.amazonUrl ?? null},
              ${f.pageCount}, ${f.isbn ?? null}, ${f.masterFileKey})
      on conflict (book_id, format) do update set
        availability    = excluded.availability,
        fulfillment     = excluded.fulfillment,
        price_cents     = excluded.price_cents,
        amazon_asin     = excluded.amazon_asin,
        amazon_url      = excluded.amazon_url,
        page_count      = excluded.page_count,
        isbn            = excluded.isbn,
        master_file_key = excluded.master_file_key,
        updated_at      = now()`;
    console.log(
      `  format  ${f.format.padEnd(12)} ${f.availability.padEnd(12)} ${f.fulfillment}`,
    );
  }
}

console.log(`\nloaded ${BOOKS.length} books into ${db}. All draft.`);
console.log(
  "Nothing is published and no Paddle price was written — both are deliberate.",
);
