ALTER TABLE "orders" ADD COLUMN "full_name" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "postal_code" varchar(4) NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "region" text NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "city" text NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "province" text NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "barangay" text NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "address_line" text NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "phone_number" varchar(13) NOT NULL;--> statement-breakpoint
ALTER TABLE "order_items" DROP COLUMN "full_name";--> statement-breakpoint
ALTER TABLE "order_items" DROP COLUMN "postal_code";--> statement-breakpoint
ALTER TABLE "order_items" DROP COLUMN "region";--> statement-breakpoint
ALTER TABLE "order_items" DROP COLUMN "city";--> statement-breakpoint
ALTER TABLE "order_items" DROP COLUMN "province";--> statement-breakpoint
ALTER TABLE "order_items" DROP COLUMN "barangay";--> statement-breakpoint
ALTER TABLE "order_items" DROP COLUMN "address_line";--> statement-breakpoint
ALTER TABLE "order_items" DROP COLUMN "phone_number";