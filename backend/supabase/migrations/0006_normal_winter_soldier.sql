CREATE TABLE "addresses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_collection_id" uuid,
	"full_name" varchar(255) NOT NULL,
	"postal_code" varchar(4) NOT NULL,
	"region" text NOT NULL,
	"phone_number" varchar(11) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cart_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cartId" uuid,
	"product_id" uuid NOT NULL,
	"quantity" integer NOT NULL,
	"product_variant" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"card_messages" varchar(600)[] DEFAULT '{}'::varchar[] NOT NULL,
	CONSTRAINT "quantity_min_1" CHECK ("cart_items"."quantity" >= 1),
	CONSTRAINT "messages_not_exceed_quantity" CHECK (card_messages IS NULL OR array_length("cart_items"."card_messages", 1) <= "cart_items"."quantity")
);
--> statement-breakpoint
CREATE TABLE "carts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_collection_id" uuid,
	CONSTRAINT "carts_one_per_profile" UNIQUE("product_collection_id")
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"product_id" uuid,
	"name" text NOT NULL,
	"quantity" integer NOT NULL,
	"price_cents" integer NOT NULL,
	CONSTRAINT "order_items_price_cents_check" CHECK ("order_items"."price_cents" >= 0),
	CONSTRAINT "order_items_quantity_check" CHECK ("order_items"."quantity" > 0)
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"address_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"subtotal_cents" integer NOT NULL,
	"discount_cents" integer DEFAULT 0 NOT NULL,
	"shipping_cents" integer NOT NULL,
	"total_cents" integer NOT NULL,
	"cart_id" uuid,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "orders_discount_cents_check" CHECK ("orders"."discount_cents" >= 0),
	CONSTRAINT "orders_shipping_cents_check" CHECK ("orders"."shipping_cents" >= 0),
	CONSTRAINT "orders_subtotal_cents_check" CHECK ("orders"."subtotal_cents" >= 0),
	CONSTRAINT "orders_total_cents_check" CHECK ("orders"."total_cents" >= 0),
	CONSTRAINT "orders_status_check" CHECK ("orders"."status" IN ('created', 'awaiting_payment', 'confirmed', 'fulfilling', 'fulfilled', 'cancelled'))
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"payment_intent_id" text NOT NULL,
	"payment_id" text,
	"amount_cents" integer NOT NULL,
	"currency" text DEFAULT 'PHP' NOT NULL,
	"status" text NOT NULL,
	"method" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"paid_at" timestamp with time zone,
	CONSTRAINT "payments_amount_cents_check" CHECK ("payments"."amount_cents" >= 0),
	CONSTRAINT "payments_status_check" CHECK ("payments"."status" IN ('pending', 'paid', 'failed', 'cancelled', 'refunded'))
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(255),
	"phone" varchar(15),
	"email" varchar(255) NOT NULL,
	CONSTRAINT "profiles_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "webhook_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider_event_id" text NOT NULL,
	"provider" text NOT NULL,
	"payload" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_product_collection_id_profiles_id_fk" FOREIGN KEY ("product_collection_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_cartId_carts_id_fk" FOREIGN KEY ("cartId") REFERENCES "public"."carts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "carts" ADD CONSTRAINT "carts_product_collection_id_profiles_id_fk" FOREIGN KEY ("product_collection_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_cart_id_carts_id_fk" FOREIGN KEY ("cart_id") REFERENCES "public"."carts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "cart_items_unique_variant" ON "cart_items" USING btree ("cartId","product_id","product_variant");