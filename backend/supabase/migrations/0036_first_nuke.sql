ALTER TABLE "orders" DROP CONSTRAINT "orders_address_id_addresses_id_fk";
--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "product_variant_id" uuid;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "collection" text NOT NULL;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "category" text NOT NULL;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "primary_image_url" text NOT NULL;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "variant_attributes" jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now();--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_variant_id_product_variants_id_fk" FOREIGN KEY ("product_variant_id") REFERENCES "public"."product_variants"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_address_id_addresses_id_fk" FOREIGN KEY ("address_id") REFERENCES "public"."addresses"("id") ON DELETE no action ON UPDATE no action;