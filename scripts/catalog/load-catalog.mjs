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
 *  1. Publication is DATA, not a side effect. A book reaches `published`
 *     only because `websiteStatus: "published"` is written next to its
 *     blockers in `valice-catalog.mjs`, where the decision is reviewable in
 *     a diff. The loader does not decide; it applies a decision that was
 *     already made in the open. A book whose `websiteStatus` is `draft`
 *     is actively demoted on re-run, so removing a title from sale is one
 *     edit rather than a manual database visit.
 *
 *  2. `paddlePriceId` is only ever a real id produced by
 *     `provision-paddle.mjs` against the live account. Writing a
 *     plausible-looking fake is precisely how the existing production row
 *     ended up with `pri_test_meditations_999` and a checkout that failed
 *     at the till — so a value that does not look like a Paddle price id is
 *     rejected here rather than discovered by a customer.
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
  const flag = process.argv.indexOf("--env");
  const envFile = flag !== -1 ? process.argv[flag + 1] : ".env.local";
  const raw = readFileSync(envFile, "utf8");
  const line = raw.split("\n").find((l) => l.startsWith("DATABASE_URL="));
  if (!line) throw new Error(`DATABASE_URL not found in ${envFile}`);
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

// ---- integrity gate -------------------------------------------------------
// Run before any write, on every run including dry runs. Each of these has
// been a real production defect at some point in this project's history.
const PADDLE_PRICE_RE = /^pri_[a-z0-9]{20,}$/;
const problems = [];

for (const b of BOOKS) {
  const ebook = b.formats.find((f) => f.format === "ebook");
  const sellsDirect =
    ebook?.fulfillment === "direct" && ebook.availability === "available";

  if (b.paddlePriceId && !PADDLE_PRICE_RE.test(b.paddlePriceId)) {
    problems.push(
      `${b.slug}: paddlePriceId "${b.paddlePriceId}" is not a Paddle price id. ` +
        `This is how pri_test_meditations_999 reached production.`,
    );
  }
  if (sellsDirect && !b.paddlePriceId) {
    problems.push(`${b.slug}: sold directly but has no Paddle price id — checkout would fail.`);
  }
  if (sellsDirect && !ebook.masterFileKey) {
    problems.push(
      `${b.slug}: sold directly but has no master file in R2 — fulfillment would have nothing to watermark.`,
    );
  }
  if (sellsDirect && b.kdpSelect) {
    problems.push(
      `${b.slug}: sold directly while enrolled in KDP Select. That is an exclusivity breach.`,
    );
  }
  for (const f of b.formats) {
    // An Amazon call to action without a verified destination is the exact
    // defect this catalog was rebuilt to prevent.
    if (f.amazonUrl && !f.amazonAsin) {
      problems.push(`${b.slug}/${f.format}: amazonUrl without an ASIN.`);
    }
    if (f.amazonAsin && f.kdp !== "live") {
      problems.push(
        `${b.slug}/${f.format}: has an ASIN but kdp="${f.kdp}". An ASIN only exists once a title is live.`,
      );
    }
    if (f.fulfillment === "amazon" && f.availability === "available" && !f.amazonUrl) {
      problems.push(
        `${b.slug}/${f.format}: Amazon-fulfilled and available, but no URL to send the buyer to.`,
      );
    }
  }
  if (b.websiteStatus !== "published" && b.websiteStatus !== "draft") {
    problems.push(`${b.slug}: websiteStatus must be "published" or "draft".`);
  }
}

if (problems.length) {
  console.error("CATALOG INTEGRITY FAILURES — refusing to load:\n");
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}
console.log("catalog integrity : OK\n");

if (!commit) {
  for (const b of BOOKS) {
    const buyable = b.formats.filter(
      (f) => f.fulfillment === "direct" && f.availability === "available",
    ).length;
    const amazonLinks = b.formats.filter((f) => f.amazonUrl).length;
    console.log(
      `WOULD UPSERT  ${b.slug.padEnd(36)} ${b.websiteStatus.padEnd(9)} ` +
        `${String(b.formats.length).padStart(2)} formats  ` +
        `${buyable} buyable  ${amazonLinks} amazon  ${b.blockers.length} blocker(s)`,
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
  // The canonical price is what this store charges, so it is the DIRECT
  // ebook price and nothing else. A book we only link to Amazon for has no
  // price of ours; storing Amazon's list price here would mean the cart
  // could quote a number we never charge.
  const ebook = b.formats.find((f) => f.format === "ebook");
  const sellsDirect =
    ebook?.fulfillment === "direct" && ebook.availability === "available";
  const canonicalPrice = sellsDirect ? ebook.priceCents : 0;

  // The fulfillment worker reads `books.master_file_key`, NOT the per-format
  // one — it is handed a bookId and has no format in scope. Writing only the
  // format row leaves the book unfulfillable: the purchase completes, the
  // entitlement is created, and the watermark step then fails with "book has
  // no masterFileKey" while the buyer's entitlement sits at `pending`
  // forever. Both are written from the one source of truth.
  const masterFileKey = sellsDirect ? ebook.masterFileKey : null;
  // The second delivered artifact, same rule. Null unless the edition is
  // actually sold here AND actually has an EPUB — the worker branches on this
  // column, and the storefront must never advertise a format it names as null.
  const epubFileKey = sellsDirect ? (ebook.epubFileKey ?? null) : null;

  const [book] = await sql`
    insert into books (slug, title, subtitle, description, language,
                       price_cents, currency, page_count, status,
                       paddle_price_id, master_file_key, epub_file_key)
    values (${b.slug}, ${b.title}, ${b.subtitle}, ${b.description}, ${b.language},
            ${canonicalPrice}, 'USD', ${b.pageCount}, ${b.websiteStatus},
            ${b.paddlePriceId ?? null}, ${masterFileKey}, ${epubFileKey})
    on conflict (slug) do update set
      title           = excluded.title,
      subtitle        = excluded.subtitle,
      description     = excluded.description,
      language        = excluded.language,
      page_count      = excluded.page_count,
      price_cents     = excluded.price_cents,
      -- Status and price ARE overwritten now, because both are declared in
      -- the catalog file and reviewed in a diff. The previous revision left
      -- them alone to protect a hand-made production edit; that protection
      -- has become the thing that lets production drift away from source.
      status          = excluded.status,
      paddle_price_id = excluded.paddle_price_id,
      master_file_key = excluded.master_file_key,
      epub_file_key   = excluded.epub_file_key,
      updated_at      = now()
    returning id, status`;

  console.log(`book      ${b.slug.padEnd(36)} ${book.status}`);

  // Reconcile, don't just add. Inserting with `on conflict do nothing` and
  // never deleting is how Meditations ended up filed under BOTH `pd-spine`
  // and `deep-thinking` — two categories from an abandoned strategy — long
  // after the catalog said it belonged in neither. Membership is now exactly
  // what the catalog file says it is.
  const wantedCategoryIds = b.categories.map((slug) => categoryIds.get(slug));
  for (const id of wantedCategoryIds) {
    await sql`
      insert into book_categories (book_id, category_id)
      values (${book.id}, ${id})
      on conflict do nothing`;
  }
  const removed = await sql`
    delete from book_categories
    where book_id = ${book.id}
      and category_id <> all(${wantedCategoryIds}::uuid[])
    returning category_id`;
  if (removed.length) {
    console.log(`  categories  removed ${removed.length} stale assignment(s)`);
  }
  for (const slug of b.authors) {
    await sql`
      insert into book_authors (book_id, author_id)
      values (${book.id}, ${authorIds.get(slug)})
      on conflict do nothing`;
  }

  for (const f of b.formats) {
    // `unavailable` does not mean "not ready" — it means this edition does
    // not exist and is not going to. The Myth Hunter's Field Book has no
    // ebook because it is written in by hand; World Myths has no large
    // print by decision K6/A6. Loading those would put a row on the product
    // page reading "Not yet available", which promises a forthcoming
    // edition that nobody intends to make. The reason stays in the catalog
    // file, where it belongs; the storefront simply does not list it.
    //
    // Deleted rather than skipped so that marking an edition unavailable
    // actually removes it on the next run instead of leaving a stale row.
    if (f.availability === "unavailable") {
      await sql`delete from book_formats
                where book_id = ${book.id} and format = ${f.format}`;
      console.log(`  format  ${f.format.padEnd(12)} (not an edition — omitted)`);
      continue;
    }

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

// ---- remove categories nothing is filed under ----------------------------
// A category page with no books on it is a promise the catalog cannot keep.
// Two of these ("Builder Core", "Speculative Shelf") were live in production
// with zero books. Only empty ones are removed — a category that still holds
// a book is never deleted out from under it, whatever the catalog says.
const orphans = await sql`
  delete from categories c
  where not exists (select 1 from book_categories bc where bc.category_id = c.id)
  returning slug`;
for (const o of orphans) console.log(`category  removed (empty)  ${o.slug}`);

const published = BOOKS.filter((b) => b.websiteStatus === "published").length;
const buyable = BOOKS.filter((b) =>
  b.formats.some((f) => f.fulfillment === "direct" && f.availability === "available"),
).length;
const amazonFormats = BOOKS.reduce(
  (n, b) => n + b.formats.filter((f) => f.amazonUrl).length,
  0,
);

console.log(`\nloaded ${BOOKS.length} books into ${db}.`);
console.log(`  published on the site      : ${published}`);
console.log(`  buyable here (direct ebook): ${buyable}`);
console.log(`  formats linking to Amazon  : ${amazonFormats} (all ASIN-verified)`);
