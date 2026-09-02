/**
 * Valice Press — Drizzle schema (Roadmap §10).
 *
 * Conventions
 *  - Physical table names are plural snake_case (avoids the reserved-word
 *    pitfalls of `user` and `order` while staying SQL-idiomatic). Drizzle
 *    exports stay singular (`users`, `books`, …) for ergonomic imports.
 *  - All primary keys are UUIDs (`gen_random_uuid()`, pgcrypto — Neon-enabled).
 *  - All timestamps are `timestamptz` with `defaultNow()`; row-update times
 *    use Drizzle's ORM-level `$onUpdate` (no DB triggers).
 *  - Money is stored as integer cents; ISO-4217 currency codes are varchar(3).
 *  - Foreign-key `onDelete` policies are deliberate: cascade for personal
 *    derived data (reading progress, reviews, watermark jobs, download logs,
 *    join rows), restrict for anything that participates in order/entitlement
 *    history (so deleting a user doesn't erase their commercial paper trail).
 *  - Indexes follow §10 exactly (book.slug uk, status+published_at, entitlement
 *    (user, book) uk, order.mor_order_ref uk, plus a GIN FTS index on books).
 */

import { relations, sql } from "drizzle-orm";
import {
  customType,
  index,
  jsonb,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  real,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

// -----------------------------------------------------------------------------
// Custom column type — Postgres `tsvector` for full-text search.
// -----------------------------------------------------------------------------
const tsvector = customType<{ data: string }>({
  dataType: () => "tsvector",
});

// -----------------------------------------------------------------------------
// Enums
// -----------------------------------------------------------------------------
export const bookStatusEnum = pgEnum("book_status", [
  "draft",
  "published",
  "archived",
]);

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "paid",
  "failed",
  "refunded",
]);

export const entitlementStatusEnum = pgEnum("entitlement_status", [
  "pending",
  "ready",
  "revoked",
]);

// Reading status — independent of the fulfillment lifecycle in
// `entitlement_status`. Defaults to "not_started"; users flip it from
// the /account/library shelf via the `updateReadStatus` server action.
// "wishlist" is reserved for a future feature (separate wishlist table);
// the current library tabs only consume not_started/reading/finished.
export const readStatusEnum = pgEnum("read_status", [
  "not_started",
  "reading",
  "finished",
]);

export const watermarkJobStatusEnum = pgEnum("watermark_job_status", [
  "queued",
  "running",
  "succeeded",
  "failed",
]);

export const reviewStatusEnum = pgEnum("review_status", [
  "pending",
  "approved",
  "rejected",
]);

// Commerce lifecycle audit-event types (Phase F — order/entitlement state
// transitions driven by Paddle MoR webhooks; `revoked` is also reachable via
// support action). Append-only; see `commerce_events`.
export const commerceEventTypeEnum = pgEnum("commerce_event_type", [
  "paid",
  "payment_failed",
  "transaction_canceled",
  "refunded",
  "chargeback",
  "revoked",
]);

// The editions a title can exist in. One book, many formats — a reader
// choosing between the paperback and the ebook is choosing a format of the
// same work, not a different product.
export const bookFormatEnum = pgEnum("book_format", [
  "ebook",
  "paperback",
  "hardcover",
  "large_print",
]);

// Who actually fulfils an order for a given format.
//
// This distinction is the whole reason `book_formats` exists. Amazon's KDP
// print pipeline only fulfils orders placed on Amazon — it cannot ship a
// book ordered on this site. So a print format is a *link out*, never an
// add-to-cart, and the data model has to say which is which rather than
// leaving it to whoever writes the button label.
export const fulfillmentChannelEnum = pgEnum("fulfillment_channel", [
  // Sold here: Paddle checkout → entitlement → watermarked download.
  "direct",
  // Sold on Amazon: we link to the product page and Amazon does the rest.
  "amazon",
]);

export const formatAvailabilityEnum = pgEnum("format_availability", [
  // Buyable now (direct) or linkable now (amazon).
  "available",
  // Edition exists and is intended, but is not purchasable yet. Renders as
  // a stated future edition, never as a buy button.
  "coming_soon",
  // Deliberately not offered in this format.
  "unavailable",
]);

// -----------------------------------------------------------------------------
// users
// -----------------------------------------------------------------------------
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name"),
  authProvider: text("auth_provider"),
  locale: varchar("locale", { length: 8 }).notNull().default("en"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// -----------------------------------------------------------------------------
// books
//   - `search_tsv` is a STORED generated column (title weighted A,
//     description weighted B). It is queried with `@@ to_tsquery(...)` and
//     served by `books_search_gin_idx` (GIN).
// -----------------------------------------------------------------------------
export const books = pgTable(
  "books",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: varchar("slug", { length: 200 }).notNull(),
    title: text("title").notNull(),
    subtitle: text("subtitle"),
    description: text("description"),
    language: varchar("language", { length: 8 }).notNull().default("en"),
    priceCents: integer("price_cents").notNull(),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    coverKey: text("cover_key"),
    sampleKey: text("sample_key"),
    masterFileKey: text("master_file_key"),
    /**
     * Private R2 key of the EPUB master, when the edition has one.
     *
     * A second delivered artifact, not a second product: one purchase entitles
     * the buyer to every file this column and `master_file_key` name. NULL
     * means the edition has no EPUB, and the storefront must then say nothing
     * about EPUB — the Dudeney Paddle description once promised one the
     * fulfillment worker had no way to deliver, which is the defect this
     * column exists to make impossible.
     */
    epubFileKey: text("epub_file_key"),
    pageCount: integer("page_count"),
    isbn: varchar("isbn", { length: 32 }),
    /**
     * Paddle catalog `priceId` (e.g. `pri_01abc…`). Populated by the admin
     * after registering the book as a non-catalog item in Paddle's
     * dashboard or via the Paddle API. Nullable so a book can exist in
     * draft before its Paddle price is set up; checkout fails fast if
     * any cart item lacks this value.
     */
    paddlePriceId: text("paddle_price_id"),
    status: bookStatusEnum("status").notNull().default("draft"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    searchTsv: tsvector("search_tsv").generatedAlwaysAs(
      sql`setweight(to_tsvector('english', coalesce(title, '')), 'A') || setweight(to_tsvector('english', coalesce(description, '')), 'B')`,
    ),
  },
  (t) => [
    uniqueIndex("books_slug_uk").on(t.slug),
    index("books_status_published_at_idx").on(t.status, t.publishedAt),
    index("books_search_gin_idx").using("gin", t.searchTsv),
  ],
);

// -----------------------------------------------------------------------------
// book_formats — the editions a title is sold in, and by whom
//
// A book row carries the *work*: title, description, cover, canonical
// direct-sale price. A format row carries one *edition* of it: what it
// costs in that edition, whether it can be bought at all, and — critically
// — whether buying it happens here or on Amazon.
//
// `amazonAsin` / `amazonUrl` are nullable and must stay that way. A print
// edition that has been typeset but not yet uploaded to KDP has no ASIN,
// and inventing one produces a dead "Buy on Amazon" button. Availability
// is what decides whether a CTA renders; the identifiers only decide where
// it points.
// -----------------------------------------------------------------------------
export const bookFormats = pgTable(
  "book_formats",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    bookId: uuid("book_id")
      .notNull()
      .references(() => books.id, { onDelete: "cascade" }),
    format: bookFormatEnum("format").notNull(),
    availability: formatAvailabilityEnum("availability")
      .notNull()
      .default("coming_soon"),
    fulfillment: fulfillmentChannelEnum("fulfillment").notNull(),
    /**
     * Price in minor units. NULL means "not established yet" and renders as
     * no price at all — distinct from a zero price. Most print prices are
     * modelled from KDP's cost tables rather than confirmed on a live
     * listing, so a null here is honest and a guess is not.
     */
    priceCents: integer("price_cents"),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    /** Amazon identifiers — only ever set once the edition is actually live. */
    amazonAsin: varchar("amazon_asin", { length: 16 }),
    amazonUrl: text("amazon_url"),
    /** Per-edition physical facts; page counts differ between editions. */
    pageCount: integer("page_count"),
    isbn: varchar("isbn", { length: 32 }),
    /**
     * Private R2 key of the master file for a `direct` ebook. The
     * fulfillment worker watermarks this per order. NULL for every
     * Amazon-fulfilled format — we hold no file for those.
     */
    masterFileKey: text("master_file_key"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    // One row per format per book. Re-running the catalog loader must
    // update an edition, never duplicate it.
    uniqueIndex("book_formats_book_format_uk").on(t.bookId, t.format),
    index("book_formats_book_idx").on(t.bookId),
  ],
);

// -----------------------------------------------------------------------------
// authors
// -----------------------------------------------------------------------------
export const authors = pgTable("authors", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: varchar("slug", { length: 200 }).notNull().unique(),
  name: text("name").notNull(),
  bio: text("bio"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// -----------------------------------------------------------------------------
// categories
// -----------------------------------------------------------------------------
export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: varchar("slug", { length: 200 }).notNull().unique(),
  name: text("name").notNull(),
  // Editorial hub copy for /categories/[slug] (taxonomy enrichment). Nullable
  // + additive; the column is already live in prod (0003 applied directly —
  // see docs/seo/08). The page renders it only when present.
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// -----------------------------------------------------------------------------
// book_authors (M:N)  ·  `position` preserves co-author ordering.
// -----------------------------------------------------------------------------
export const bookAuthors = pgTable(
  "book_authors",
  {
    bookId: uuid("book_id")
      .notNull()
      .references(() => books.id, { onDelete: "cascade" }),
    authorId: uuid("author_id")
      .notNull()
      .references(() => authors.id, { onDelete: "restrict" }),
    position: smallint("position").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.bookId, t.authorId] })],
);

// -----------------------------------------------------------------------------
// book_categories (M:N)
// -----------------------------------------------------------------------------
export const bookCategories = pgTable(
  "book_categories",
  {
    bookId: uuid("book_id")
      .notNull()
      .references(() => books.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
  },
  (t) => [primaryKey({ columns: [t.bookId, t.categoryId] })],
);

// -----------------------------------------------------------------------------
// orders  ·  `mor_order_ref` is the idempotency key from the MoR webhook.
// -----------------------------------------------------------------------------
export const orders = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    morOrderRef: text("mor_order_ref").notNull(),
    totalCents: integer("total_cents").notNull(),
    currency: varchar("currency", { length: 3 }).notNull(),
    taxCents: integer("tax_cents").notNull().default(0),
    status: orderStatusEnum("status").notNull().default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("orders_mor_order_ref_uk").on(t.morOrderRef),
    index("orders_user_created_at_idx").on(t.userId, t.createdAt),
  ],
);

// -----------------------------------------------------------------------------
// order_items
// -----------------------------------------------------------------------------
export const orderItems = pgTable(
  "order_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    bookId: uuid("book_id")
      .notNull()
      .references(() => books.id, { onDelete: "restrict" }),
    priceCentsAtPurchase: integer("price_cents_at_purchase").notNull(),
  },
  (t) => [index("order_items_order_idx").on(t.orderId)],
);

// -----------------------------------------------------------------------------
// entitlements  ·  unique (user_id, book_id) — one perpetual grant per book.
// -----------------------------------------------------------------------------
export const entitlements = pgTable(
  "entitlements",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    bookId: uuid("book_id")
      .notNull()
      .references(() => books.id, { onDelete: "restrict" }),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "restrict" }),
    status: entitlementStatusEnum("status").notNull().default("pending"),
    watermarkedKey: text("watermarked_key"),
    /**
     * Per-order watermarked EPUB, when the book has an EPUB master.
     *
     * Deliberately separate from `status`: the entitlement becomes `ready` on
     * the PDF alone. An EPUB that failed to build must not hold a paid book
     * hostage — the buyer gets the PDF and the EPUB button simply does not
     * appear, which is a smaller failure than a library that says "still
     * preparing" forever.
     */
    epubKey: text("epub_key"),
    // Phase 2.B — independent reading lifecycle. Defaults to
    // "not_started" so existing entitlements are non-destructively
    // backfilled by the migration.
    readStatus: readStatusEnum("read_status").notNull().default("not_started"),
    // Phase 2.B — set by the `downloadBook` action on every successful
    // signed-URL mint. Powers the "Downloaded" library tab without a
    // JOIN against download_logs.
    lastDownloadedAt: timestamp("last_downloaded_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    uniqueIndex("entitlements_user_book_uk").on(t.userId, t.bookId),
    index("entitlements_user_status_idx").on(t.userId, t.status),
    index("entitlements_user_read_status_idx").on(t.userId, t.readStatus),
    index("entitlements_order_idx").on(t.orderId),
  ],
);

// -----------------------------------------------------------------------------
// watermark_jobs  ·  drives the async fulfillment pipeline (ADR-3).
// -----------------------------------------------------------------------------
export const watermarkJobs = pgTable(
  "watermark_jobs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    entitlementId: uuid("entitlement_id")
      .notNull()
      .references(() => entitlements.id, { onDelete: "cascade" }),
    status: watermarkJobStatusEnum("status").notNull().default("queued"),
    attempts: integer("attempts").notNull().default(0),
    artifactKey: text("artifact_key"),
    error: text("error"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    index("watermark_jobs_entitlement_idx").on(t.entitlementId),
    index("watermark_jobs_status_updated_idx").on(t.status, t.updatedAt),
  ],
);

// -----------------------------------------------------------------------------
// reading_progress  ·  one row per (user, book).
// -----------------------------------------------------------------------------
export const readingProgress = pgTable(
  "reading_progress",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    bookId: uuid("book_id")
      .notNull()
      .references(() => books.id, { onDelete: "cascade" }),
    page: integer("page").notNull().default(0),
    percent: real("percent").notNull().default(0),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [uniqueIndex("reading_progress_user_book_uk").on(t.userId, t.bookId)],
);

// -----------------------------------------------------------------------------
// reviews
// -----------------------------------------------------------------------------
export const reviews = pgTable(
  "reviews",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    bookId: uuid("book_id")
      .notNull()
      .references(() => books.id, { onDelete: "cascade" }),
    rating: smallint("rating").notNull(),
    body: text("body"),
    status: reviewStatusEnum("status").notNull().default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("reviews_user_book_uk").on(t.userId, t.bookId),
    index("reviews_book_status_idx").on(t.bookId, t.status),
  ],
);

// -----------------------------------------------------------------------------
// download_logs  ·  abuse-detection trail (§11 — velocity checks).
// -----------------------------------------------------------------------------
export const downloadLogs = pgTable(
  "download_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    entitlementId: uuid("entitlement_id")
      .notNull()
      .references(() => entitlements.id, { onDelete: "cascade" }),
    ip: text("ip"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("download_logs_entitlement_idx").on(t.entitlementId),
    index("download_logs_entitlement_created_idx").on(
      t.entitlementId,
      t.createdAt,
    ),
  ],
);

// -----------------------------------------------------------------------------
// commerce_events  ·  append-only audit trail of MoR lifecycle transitions
// (Phase F — commerce safety & operability). Every paid / payment_failed /
// refunded / chargeback / revoked transition is recorded here so that a
// purchased book's history is VISIBLE, AUDITABLE and RECOVERABLE. Rows are
// never mutated. `provider_event_id` (Paddle `evt_…`) is UNIQUE so a
// re-delivered webhook produces exactly one audit row (idempotency). FK
// columns are nullable + `set null` on delete so the audit trail survives
// even if a referenced row is ever removed (orders/entitlements are
// `restrict` elsewhere, so in practice they are not).
// -----------------------------------------------------------------------------
export const commerceEvents = pgTable(
  "commerce_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    type: commerceEventTypeEnum("type").notNull(),
    // Paddle event id (`evt_…`) — UNIQUE → idempotent webhook re-delivery.
    providerEventId: text("provider_event_id"),
    // Paddle transaction id (`txn_…`) the event concerns; mirrors
    // `orders.mor_order_ref` (present even when no order row exists, e.g.
    // a failed payment attempt).
    morOrderRef: text("mor_order_ref"),
    orderId: uuid("order_id").references(() => orders.id, {
      onDelete: "set null",
    }),
    entitlementId: uuid("entitlement_id").references(() => entitlements.id, {
      onDelete: "set null",
    }),
    // Short human-readable reason/summary (Paddle adjustment action, decline
    // reason, support note, …). Never PII beyond what the watermark allows.
    reason: text("reason"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("commerce_events_provider_event_uk").on(t.providerEventId),
    index("commerce_events_order_idx").on(t.orderId),
    index("commerce_events_ref_idx").on(t.morOrderRef),
    index("commerce_events_type_created_idx").on(t.type, t.createdAt),
  ],
);

// -----------------------------------------------------------------------------
// analytics_events — first-party, PII-free funnel events.
//
// WHY THIS EXISTS: the project runs on Vercel's Hobby plan, where Web
// Analytics custom events (`track()` in src/lib/analytics.ts) are silently
// dropped. Every `view_item`, `add_to_cart`, `begin_checkout`, `sample_read`
// and `purchase` fired since launch was recorded nowhere. This table is the
// sink: the client beacons to /api/events, the fulfillment worker writes
// `purchase` server-side, and the admin reads counts per event per day.
//
// What it never holds: user ids, emails, IPs, user agents, full URLs with
// query strings, or raw search text. `props` is a small JSON of slugs,
// counts, cents and currency codes, validated at the API boundary.
// -----------------------------------------------------------------------------
export const analyticsEvents = pgTable(
  "analytics_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    event: text("event").notNull(),
    props: jsonb("props").$type<Record<string, string | number | boolean | null>>(),
    /** Path only, no query string. */
    path: text("path"),
    /** Referrer host only, never the full referrer. */
    referrerHost: text("referrer_host"),
    bookSlug: text("book_slug"),
    /** "client" (beacon) or "server" (fulfillment). */
    source: text("source").notNull().default("client"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("analytics_events_event_created_idx").on(t.event, t.createdAt),
    index("analytics_events_book_idx").on(t.bookSlug),
  ],
);

// =============================================================================
// Relations (Drizzle's relational query API)
// =============================================================================

export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
  entitlements: many(entitlements),
  readingProgress: many(readingProgress),
  reviews: many(reviews),
}));

export const booksRelations = relations(books, ({ many }) => ({
  formats: many(bookFormats),
  orderItems: many(orderItems),
  entitlements: many(entitlements),
  readingProgress: many(readingProgress),
  reviews: many(reviews),
  bookAuthors: many(bookAuthors),
  bookCategories: many(bookCategories),
}));

export const bookFormatsRelations = relations(bookFormats, ({ one }) => ({
  book: one(books, {
    fields: [bookFormats.bookId],
    references: [books.id],
  }),
}));

export const authorsRelations = relations(authors, ({ many }) => ({
  bookAuthors: many(bookAuthors),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  bookCategories: many(bookCategories),
}));

export const bookAuthorsRelations = relations(bookAuthors, ({ one }) => ({
  book: one(books, {
    fields: [bookAuthors.bookId],
    references: [books.id],
  }),
  author: one(authors, {
    fields: [bookAuthors.authorId],
    references: [authors.id],
  }),
}));

export const bookCategoriesRelations = relations(bookCategories, ({ one }) => ({
  book: one(books, {
    fields: [bookCategories.bookId],
    references: [books.id],
  }),
  category: one(categories, {
    fields: [bookCategories.categoryId],
    references: [categories.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, { fields: [orders.userId], references: [users.id] }),
  items: many(orderItems),
  entitlements: many(entitlements),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  book: one(books, { fields: [orderItems.bookId], references: [books.id] }),
}));

export const entitlementsRelations = relations(
  entitlements,
  ({ one, many }) => ({
    user: one(users, {
      fields: [entitlements.userId],
      references: [users.id],
    }),
    book: one(books, {
      fields: [entitlements.bookId],
      references: [books.id],
    }),
    order: one(orders, {
      fields: [entitlements.orderId],
      references: [orders.id],
    }),
    watermarkJobs: many(watermarkJobs),
    downloadLogs: many(downloadLogs),
  }),
);

export const watermarkJobsRelations = relations(watermarkJobs, ({ one }) => ({
  entitlement: one(entitlements, {
    fields: [watermarkJobs.entitlementId],
    references: [entitlements.id],
  }),
}));

export const readingProgressRelations = relations(readingProgress, ({ one }) => ({
  user: one(users, {
    fields: [readingProgress.userId],
    references: [users.id],
  }),
  book: one(books, {
    fields: [readingProgress.bookId],
    references: [books.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  user: one(users, { fields: [reviews.userId], references: [users.id] }),
  book: one(books, { fields: [reviews.bookId], references: [books.id] }),
}));

export const downloadLogsRelations = relations(downloadLogs, ({ one }) => ({
  entitlement: one(entitlements, {
    fields: [downloadLogs.entitlementId],
    references: [entitlements.id],
  }),
}));
