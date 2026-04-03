ALTER TABLE "orders" DROP CONSTRAINT "orders_address_id_addresses_id_fk";
--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "address_id";