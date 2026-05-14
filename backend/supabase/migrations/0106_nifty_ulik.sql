ALTER TABLE "payments" DROP CONSTRAINT "payments_status_check";--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "primary_image_hash" text NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "payments_unique_refunded_per_order" ON "payments" USING btree ("order_id") WHERE "payments"."status" = 'refunded';--> statement-breakpoint
CREATE UNIQUE INDEX "payments_unique_pending_per_order" ON "payments" USING btree ("order_id") WHERE "payments"."status" = 'pending';--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_payment_intent_id_unique" UNIQUE("payment_intent_id");--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_payment_id_unique" UNIQUE("payment_id");--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_status_check" CHECK ("payments"."status" IN ('processing', 'pending', 'paid', 'failed', 'cancelled', 'refunded'));