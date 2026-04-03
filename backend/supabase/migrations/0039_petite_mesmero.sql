ALTER TABLE "orders" ADD COLUMN "source" text;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_source_check" CHECK ("orders"."source" IN ('shop', 'cart'));