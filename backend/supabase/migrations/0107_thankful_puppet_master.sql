CREATE TABLE "order_creation_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"idempotency_key" text NOT NULL,
	"status" text DEFAULT 'processing' NOT NULL,
	"order_id" uuid,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "order_creation_requests_status_check" CHECK ("order_creation_requests"."status" IN ('processing', 'completed', 'failed'))
);
--> statement-breakpoint
ALTER TABLE "order_creation_requests" ADD CONSTRAINT "order_creation_requests_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_creation_requests" ADD CONSTRAINT "order_creation_requests_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "order_creation_requests_profile_key_unique" ON "order_creation_requests" USING btree ("profile_id","idempotency_key");--> statement-breakpoint
CREATE INDEX "idx_order_creation_requests_profile_status" ON "order_creation_requests" USING btree ("profile_id","status");