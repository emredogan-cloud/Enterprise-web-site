-- Applied to production by hand before the code that writes these columns
-- was deployed. IF NOT EXISTS so re-running is a no-op.
ALTER TABLE "free_book_requests" ADD COLUMN IF NOT EXISTS "download_token" varchar(64);--> statement-breakpoint
ALTER TABLE "free_book_requests" ADD COLUMN IF NOT EXISTS "download_expires_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "free_book_requests" ADD COLUMN IF NOT EXISTS "download_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "free_book_requests" ADD COLUMN IF NOT EXISTS "first_downloaded_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "free_book_requests" ADD COLUMN IF NOT EXISTS "last_downloaded_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "free_book_requests" ADD CONSTRAINT "free_book_requests_download_token_unique" UNIQUE("download_token");