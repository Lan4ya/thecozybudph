DROP INDEX "cart_items_unique_variant";--> statement-breakpoint
CREATE UNIQUE INDEX "cart_items_unique_variant" ON "cart_items" USING btree ("cart_id","product_id","product_variant_id");--> statement-breakpoint
ALTER TABLE "cart_items" DROP COLUMN "product_name_snapshot";--> statement-breakpoint
ALTER TABLE "cart_items" DROP COLUMN "product_variant_snapshot";--> statement-breakpoint
ALTER TABLE "cart_items" DROP COLUMN "product_primary_image_url_snapshot";