ALTER TABLE "product_variants" ADD COLUMN "price_cents" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "product_variants" ADD CONSTRAINT "payments_amount_cents_check" CHECK ("product_variants"."price_cents" >= 0);
