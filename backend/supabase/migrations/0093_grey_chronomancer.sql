CREATE INDEX "idx_orders_expiry_cleanup" ON "orders" USING btree ("status","expires_at") WHERE "orders"."status" = 'to_pay';--> statement-breakpoint
ALTER POLICY "authenticated can update own order" ON "orders" RENAME TO "authenticated can update own active order";--> statement-breakpoint
DROP POLICY "authenticated can update before expiry" ON "orders" CASCADE;