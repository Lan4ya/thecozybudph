ALTER TABLE "orders" ALTER COLUMN "address_id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "address_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_address_id_addresses_id_fk" FOREIGN KEY ("address_id") REFERENCES "public"."addresses"("id") ON DELETE set null ON UPDATE no action;