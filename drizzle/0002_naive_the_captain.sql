CREATE TYPE "public"."read_status" AS ENUM('not_started', 'reading', 'finished');--> statement-breakpoint
ALTER TABLE "entitlements" ADD COLUMN "read_status" "read_status" DEFAULT 'not_started' NOT NULL;--> statement-breakpoint
ALTER TABLE "entitlements" ADD COLUMN "last_downloaded_at" timestamp with time zone;--> statement-breakpoint
CREATE INDEX "entitlements_user_read_status_idx" ON "entitlements" USING btree ("user_id","read_status");