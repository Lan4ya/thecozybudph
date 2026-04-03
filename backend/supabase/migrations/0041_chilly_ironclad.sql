ALTER TABLE "addresses" ADD COLUMN "city" text NOT NULL;--> statement-breakpoint
ALTER TABLE "addresses" ADD COLUMN "province" text NOT NULL;--> statement-breakpoint
ALTER TABLE "addresses" ADD COLUMN "barangay" text NOT NULL;--> statement-breakpoint
ALTER TABLE "addresses" ADD COLUMN "address_line" text NOT NULL;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "full_name" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "postal_code" varchar(4) NOT NULL;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "region" text NOT NULL;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "city" text NOT NULL;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "province" text NOT NULL;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "barangay" text NOT NULL;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "address_line" text NOT NULL;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "phone_number" varchar(11) NOT NULL;