CREATE TYPE "public"."book_format" AS ENUM('ebook', 'paperback', 'hardcover', 'large_print');--> statement-breakpoint
CREATE TYPE "public"."format_availability" AS ENUM('available', 'coming_soon', 'unavailable');--> statement-breakpoint
CREATE TYPE "public"."fulfillment_channel" AS ENUM('direct', 'amazon');--> statement-breakpoint
CREATE TABLE "book_formats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"book_id" uuid NOT NULL,
	"format" "book_format" NOT NULL,
	"availability" "format_availability" DEFAULT 'coming_soon' NOT NULL,
	"fulfillment" "fulfillment_channel" NOT NULL,
	"price_cents" integer,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"amazon_asin" varchar(16),
	"amazon_url" text,
	"page_count" integer,
	"isbn" varchar(32),
	"master_file_key" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "book_formats" ADD CONSTRAINT "book_formats_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "book_formats_book_format_uk" ON "book_formats" USING btree ("book_id","format");--> statement-breakpoint
CREATE INDEX "book_formats_book_idx" ON "book_formats" USING btree ("book_id");