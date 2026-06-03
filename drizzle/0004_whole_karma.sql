CREATE TYPE "public"."commerce_event_type" AS ENUM('paid', 'payment_failed', 'transaction_canceled', 'refunded', 'chargeback', 'revoked');--> statement-breakpoint
CREATE TABLE "commerce_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "commerce_event_type" NOT NULL,
	"provider_event_id" text,
	"mor_order_ref" text,
	"order_id" uuid,
	"entitlement_id" uuid,
	"reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "commerce_events" ADD CONSTRAINT "commerce_events_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commerce_events" ADD CONSTRAINT "commerce_events_entitlement_id_entitlements_id_fk" FOREIGN KEY ("entitlement_id") REFERENCES "public"."entitlements"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "commerce_events_provider_event_uk" ON "commerce_events" USING btree ("provider_event_id");--> statement-breakpoint
CREATE INDEX "commerce_events_order_idx" ON "commerce_events" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "commerce_events_ref_idx" ON "commerce_events" USING btree ("mor_order_ref");--> statement-breakpoint
CREATE INDEX "commerce_events_type_created_idx" ON "commerce_events" USING btree ("type","created_at");