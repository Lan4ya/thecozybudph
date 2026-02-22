DROP TABLE "product_option_values" CASCADE;--> statement-breakpoint
DROP TABLE "product_options" CASCADE;--> statement-breakpoint
DROP TABLE "product_variant_option_values" CASCADE;--> statement-breakpoint
DROP TABLE "product_variants" CASCADE;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "options" jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "variants" jsonb NOT NULL;