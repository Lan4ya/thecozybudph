CREATE TABLE "product_variants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"attributes" jsonb NOT NULL
);
--> statement-breakpoint
DROP INDEX "cart_items_unique_variant";--> statement-breakpoint
ALTER TABLE "cart_items" ALTER COLUMN "product_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "cart_items" ADD COLUMN "product_variant_id" uuid;--> statement-breakpoint
ALTER TABLE "cart_items" ADD COLUMN "name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "cart_items" ADD COLUMN "is_available" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "product_variant_unique" ON "product_variants" USING btree ("product_id","attributes");--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_product_variant_id_product_variants_id_fk" FOREIGN KEY ("product_variant_id") REFERENCES "public"."product_variants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "cart_items_unique_variant" ON "cart_items" USING btree ("cart_id","product_id","product_variant_id");--> statement-breakpoint
ALTER TABLE "cart_items" DROP COLUMN "product_variant";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "variants";