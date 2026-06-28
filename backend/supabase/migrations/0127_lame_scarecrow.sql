CREATE TYPE "public"."payment_status" AS ENUM('pending', 'processing', 'paid', 'failed', 'cancelled', 'refunded');--> statement-breakpoint
CREATE TABLE "rate_limits" (
	"key" text PRIMARY KEY NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	"reset_at" bigint NOT NULL
);
--> statement-breakpoint
ALTER TABLE "payments" DROP CONSTRAINT "payments_status_check";--> statement-breakpoint
DROP INDEX "payments_unique_active_per_order_profile";--> statement-breakpoint
DROP INDEX "payments_unique_refunded_per_order";--> statement-breakpoint
DROP INDEX "payments_unique_pending_per_order";--> statement-breakpoint
DROP INDEX "payments_unique_paid_per_order";--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "status" SET DEFAULT 'pending'::"public"."payment_status";--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "status" SET DATA TYPE "public"."payment_status" USING "status"::"public"."payment_status";--> statement-breakpoint
CREATE UNIQUE INDEX "payments_unique_per_order" ON "payments" USING btree ("order_id");--> statement-breakpoint
ALTER TABLE "payments" DROP COLUMN "is_active";