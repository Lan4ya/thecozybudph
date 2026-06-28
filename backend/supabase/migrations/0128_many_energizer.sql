ALTER TABLE "orders" DROP CONSTRAINT "orders_source_check";--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "source" SET DEFAULT 'shop';--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_source_check" CHECK ("orders"."source" IN ('shop', 'instagram,', 'facebook', 'others'));