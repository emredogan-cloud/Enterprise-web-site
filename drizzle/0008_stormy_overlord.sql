CREATE TYPE "public"."free_book_request_status" AS ENUM('pending', 'fulfilled', 'failed', 'duplicate', 'flagged');--> statement-breakpoint
CREATE TABLE "free_book_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(254) NOT NULL,
	"book_id" uuid,
	"book_slug" varchar(200) NOT NULL,
	"book_title" text NOT NULL,
	"format" varchar(16) DEFAULT 'PDF' NOT NULL,
	"message" text,
	"status" "free_book_request_status" DEFAULT 'pending' NOT NULL,
	"marketing_consent" boolean DEFAULT false NOT NULL,
	"ip_hash" varchar(64),
	"notes" text,
	"fulfilled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "free_book_requests" ADD CONSTRAINT "free_book_requests_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "free_book_requests_status_created_idx" ON "free_book_requests" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "free_book_requests_email_idx" ON "free_book_requests" USING btree ("email");--> statement-breakpoint
CREATE INDEX "free_book_requests_email_book_idx" ON "free_book_requests" USING btree ("email","book_slug");