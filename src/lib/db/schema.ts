/**
 * Digital Bookstore — Drizzle schema (Roadmap §10).
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
    pageCount: integer("page_count"),
    isbn: varchar("isbn", { length: 32 }),
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
  orderItems: many(orderItems),
  entitlements: many(entitlements),
  readingProgress: many(readingProgress),
  reviews: many(reviews),
  bookAuthors: many(bookAuthors),
  bookCategories: many(bookCategories),
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
