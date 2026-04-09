ALTER TABLE "addresses" ADD COLUMN "is_default" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER POLICY "users can select own order address snapshot" ON "order_address_snapshots" RENAME TO "authenticated can select own order address snapshot";--> statement-breakpoint
ALTER POLICY "users can insert own order addres snapshot" ON "order_address_snapshots" RENAME TO "authenticated can insert own order addres snapshot";--> statement-breakpoint
ALTER POLICY "users can select own order items snapshot" ON "order_items_snapshots" RENAME TO "authenticated can select own order items snapshot";--> statement-breakpoint
ALTER POLICY "users can insert own order items snapshot" ON "order_items_snapshots" RENAME TO "authenticated can insert own order items snapshot";--> statement-breakpoint
ALTER POLICY "users can select own address" ON "orders" RENAME TO "authenticated can select own address";--> statement-breakpoint
ALTER POLICY "users can insert own order" ON "orders" RENAME TO "authenticated can insert own order";