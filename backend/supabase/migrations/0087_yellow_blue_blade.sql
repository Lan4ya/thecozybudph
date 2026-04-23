ALTER TABLE "orders" DROP CONSTRAINT "orders_status_check";--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'to_pay';--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_status_check" CHECK ("orders"."status" IN ('to_pay', 'to_ship', 'to_receive', 'completed', 'cancelled'));