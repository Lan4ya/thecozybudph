ALTER TABLE "order_creation_requests" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "order_creation_requests" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "updated_at" SET NOT NULL;