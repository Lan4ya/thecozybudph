CREATE TYPE "public"."shipment_status" AS ENUM('ASSIGNING_DRIVER', 'ON_GOING', 'PICKED_UP', 'COMPLETED', 'CANCELLED', 'REJECTED', 'EXPIRED');--> statement-breakpoint
CREATE TABLE "shipments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"lalamove_order_id" varchar(255),
	"lalamove_quotation_id" varchar(255),
	"shipment_status" "shipment_status",
	"share_link" text,
	"total_cents" integer,
	"pod_image_url" text,
	"pod_status" "shipment_status",
	"failed_at" timestamp with time zone,
	"delivered_at" timestamp with time zone,
	"driver_id" varchar(100),
	"driver_name" varchar(255),
	"driver_phone" varchar(50),
	"driver_share_link" text,
	"driver_image_url" text,
	"driver_plate_number" text,
	"driver_location" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "shipments_lalamove_order_id_unique" UNIQUE("lalamove_order_id"),
	CONSTRAINT "shipments_lalamove_quotation_id_unique" UNIQUE("lalamove_quotation_id")
);
--> statement-breakpoint
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_shipments_lalamove_id" ON "shipments" USING btree ("lalamove_order_id");