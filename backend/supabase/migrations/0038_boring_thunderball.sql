ALTER TABLE "orders" DROP CONSTRAINT "orders_cart_id_carts_id_fk";
--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "cart_id";