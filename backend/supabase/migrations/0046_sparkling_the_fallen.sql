CREATE TABLE "order_address_snapshot" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"postal_code" varchar(4) NOT NULL,
	"region" text NOT NULL,
	"city" text NOT NULL,
	"province" text NOT NULL,
	"barangay" text NOT NULL,
	"address_line" text NOT NULL,
	"phone_number" varchar(13) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "order_address_snapshot" ADD CONSTRAINT "order_address_snapshot_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "full_name";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "postal_code";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "region";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "city";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "province";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "barangay";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "address_line";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "phone_number";