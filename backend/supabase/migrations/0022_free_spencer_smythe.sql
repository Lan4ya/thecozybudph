ALTER TABLE "cart_items" DROP CONSTRAINT "cart_items_product_id_products_id_fk";
--> statement-breakpoint
ALTER TABLE "cart_items" DROP CONSTRAINT "cart_items_product_variant_id_product_variants_id_fk";
--> statement-breakpoint
DROP INDEX "cart_items_unique_variant";--> statement-breakpoint
ALTER TABLE "cart_items" ADD COLUMN "product_variant_snapshot" jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "cart_items" ADD COLUMN "product_primary_image_url_snapshot" text NOT NULL;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_product_variant_id_product_variants_id_fk" FOREIGN KEY ("product_variant_id") REFERENCES "public"."product_variants"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "cart_items_unique_variant" ON "cart_items" USING btree ("cart_id","product_name_snapshot","product_variant_snapshot");