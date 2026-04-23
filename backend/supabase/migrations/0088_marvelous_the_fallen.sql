ALTER TABLE "orders" DROP CONSTRAINT "orders_status_check";--> statement-breakpoint
DROP INDEX "unique_default_address_per_profile";--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'to_pay';--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "payment_intent_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "amount_cents" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "expires_at" timestamp with time zone NOT NULL;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "profile_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "payments_unique_active_per_order_profile" ON "payments" USING btree ("order_id","profile_id") WHERE "payments"."is_active" = true;--> statement-breakpoint
CREATE UNIQUE INDEX "payments_unique_paid_per_order" ON "payments" USING btree ("order_id") WHERE "payments"."status" = 'paid';--> statement-breakpoint
CREATE UNIQUE INDEX "unique_default_address_per_profile" ON "addresses" USING btree ("profile_id") WHERE "addresses"."is_default" = true;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_status_check" CHECK ("orders"."status" IN ('to_pay', 'to_ship', 'to_receive', 'completed', 'cancelled'));--> statement-breakpoint
ALTER POLICY "authenticated can select own address" ON "orders" RENAME TO "authenticated can select own order";--> statement-breakpoint
ALTER POLICY "authenticated can select own payments" ON "payments" RENAME TO "authenticated can select own payment";--> statement-breakpoint
ALTER POLICY "authenticated can insert own payments" ON "payments" RENAME TO "authenticated can update own payment";--> statement-breakpoint
CREATE POLICY "authenticated can update own order" ON "orders" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (auth.uid() = profile_id) WITH CHECK (auth.uid() = profile_id);--> statement-breakpoint
CREATE POLICY "authenticated can insert own payment" ON "payments" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (auth.uid() = profile_id);