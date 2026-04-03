ALTER TABLE "order_items" RENAME TO "order_items_snapshots";--> statement-breakpoint
ALTER TABLE "order_items_snapshots" DROP CONSTRAINT "order_items_price_cents_check";--> statement-breakpoint
ALTER TABLE "order_items_snapshots" DROP CONSTRAINT "order_items_quantity_check";--> statement-breakpoint
ALTER TABLE "order_items_snapshots" DROP CONSTRAINT "order_items_order_id_orders_id_fk";
--> statement-breakpoint
ALTER TABLE "order_items_snapshots" DROP CONSTRAINT "order_items_product_id_products_id_fk";
--> statement-breakpoint
ALTER TABLE "order_items_snapshots" DROP CONSTRAINT "order_items_product_variant_id_product_variants_id_fk";
--> statement-breakpoint
ALTER TABLE "order_items_snapshots" ADD CONSTRAINT "order_items_snapshots_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items_snapshots" ADD CONSTRAINT "order_items_snapshots_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items_snapshots" ADD CONSTRAINT "order_items_snapshots_product_variant_id_product_variants_id_fk" FOREIGN KEY ("product_variant_id") REFERENCES "public"."product_variants"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items_snapshots" ADD CONSTRAINT "order_items_price_cents_check" CHECK ("order_items_snapshots"."price_cents" >= 0);--> statement-breakpoint
ALTER TABLE "order_items_snapshots" ADD CONSTRAINT "order_items_quantity_check" CHECK ("order_items_snapshots"."quantity" > 0);