ALTER TABLE "idempotency_keys" ADD COLUMN "profile_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "idempotency_keys" ADD COLUMN "operation" text NOT NULL;--> statement-breakpoint
ALTER TABLE "idempotency_keys" ADD COLUMN "idempotency_key" text NOT NULL;--> statement-breakpoint
ALTER TABLE "idempotency_keys" ADD COLUMN "request_hash" text NOT NULL;--> statement-breakpoint
ALTER TABLE "idempotency_keys" ADD COLUMN "status" text DEFAULT 'processing' NOT NULL;--> statement-breakpoint
ALTER TABLE "idempotency_keys" ADD COLUMN "response_payload" jsonb;--> statement-breakpoint
ALTER TABLE "idempotency_keys" ADD COLUMN "error_payload" jsonb;--> statement-breakpoint
ALTER TABLE "idempotency_keys" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now();--> statement-breakpoint
ALTER TABLE "idempotency_keys" ADD COLUMN "expires_at" timestamp with time zone;--> statement-breakpoint
CREATE UNIQUE INDEX "idempotency_profile_operation_key_uidx" ON "idempotency_keys" USING btree ("profile_id","operation","idempotency_key");