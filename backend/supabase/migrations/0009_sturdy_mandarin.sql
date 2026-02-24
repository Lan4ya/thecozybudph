ALTER TABLE "cart_items" DROP CONSTRAINT "cart_items_cartId_carts_id_fk";
--> statement-breakpoint
DROP INDEX "cart_items_unique_variant";--> statement-breakpoint
ALTER TABLE "cart_items" ADD COLUMN "cart_id" uuid;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_cart_id_carts_id_fk" FOREIGN KEY ("cart_id") REFERENCES "public"."carts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "cart_items_unique_variant" ON "cart_items" USING btree ("cart_id","product_id","product_variant");--> statement-breakpoint
ALTER TABLE "cart_items" DROP COLUMN "cartId";