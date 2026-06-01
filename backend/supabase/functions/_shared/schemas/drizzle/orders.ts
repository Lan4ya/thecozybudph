import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  check,
  jsonb,
  varchar,
  pgPolicy,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { profiles } from "./profiles.ts";
import { products, productVariants } from "./products.ts";
import type {
  OrderSource,
  ProductVariant,
  ServiceType,
} from "../types/index.ts";
import { authenticatedRole, postgresRole } from "drizzle-orm/supabase/rls";
import type { DBOrderStatus } from "../types/db/order.ts";

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    profileId: uuid("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "set null" }),
    shipmentOrderId: text("shipment_order_id"),
    status: text("status").$type<DBOrderStatus>().default("to_pay").notNull(),
    source: text("source").$type<OrderSource>().notNull(),
    serviceType: text("service_type").$type<ServiceType>().notNull(),

    // Payment Details
    subtotalCents: integer("subtotal_cents").notNull(),
    discountCents: integer("discount_cents").default(0).notNull(),
    shippingCents: integer("shipping_cents").notNull(),
    passOnFee: integer("pass_on_fee").notNull(),
    totalCents: integer("total_cents").notNull(),

    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    check("orders_discount_cents_check", sql`${table.discountCents} >= 0`),
    check("orders_shipping_cents_check", sql`${table.shippingCents} >= 0`),
    check("orders_subtotal_cents_check", sql`${table.subtotalCents} >= 0`),
    check("orders_total_cents_check", sql`${table.totalCents} >= 0`),
    check("orders_source_check", sql`${table.source} IN ('shop', 'cart')`),
    check(
      "orders_status_check",
      sql`${table.status} IN ('to_pay', 'paid', 'to_ship', 'shipped', 'to_receive', 'fulfilled', 'cancelled', 'expired')`,
    ),
    // index for cron job 'expire-orders-job'
    index("idx_orders_expiry_cleanup")
      .on(table.status, table.expiresAt)
      .where(sql`${table.status} = 'to_pay'`),

    pgPolicy("authenticated can select own order", {
      as: "permissive",
      to: authenticatedRole,
      for: "select",
      using: sql`auth.uid() = profile_id`,
    }),

    pgPolicy("authenticated can insert own order", {
      as: "permissive",
      to: authenticatedRole,
      for: "insert",
      withCheck: sql`auth.uid() = profile_id`,
    }),

    pgPolicy("postgresRole can update active order", {
      as: "permissive",
      to: postgresRole,
      for: "update",
      using: sql`auth.uid() = profile_id AND expires_at > now()`,
      withCheck: sql`auth.uid() = profile_id AND expires_at > now()`,
    }),
  ],
);

export const orderAddressesSnapshot = pgTable(
  "order_address_snapshots",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    fullName: varchar("full_name", { length: 255 }).notNull(),
    postalCode: varchar("postal_code", { length: 4 }).notNull(),
    region: text("region").notNull(),
    city: text("city").notNull(),
    province: text("province"),
    barangay: text("barangay").notNull(),
    addressLine: text("address_line").notNull(),
    phoneNumber: varchar("phone_number", { length: 13 }).notNull(), // length is 13 since we will use universal dialing code for PH +63XXXXXXXXXX
  },
  (_t) => [
    pgPolicy("authenticated can select own order address snapshot", {
      as: "permissive",
      to: authenticatedRole,
      for: "select",
      using: sql`
        EXISTS (
          SELECT 1 FROM orders 
          WHERE orders.id = order_id 
          AND orders.profile_id = auth.uid()
        )
      `,
    }),

    pgPolicy("authenticated can insert own order addres snapshot", {
      as: "permissive",
      to: authenticatedRole,
      for: "insert",
      withCheck: sql`
        EXISTS (
          SELECT 1 FROM orders 
          WHERE orders.id = order_id 
          AND orders.profile_id = auth.uid()
        )
      `,
    }),
  ],
);

export const orderItemsSnapshots = pgTable(
  "order_items_snapshots",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: uuid("product_id").references(() => products.id, {
      onDelete: "set null",
    }),

    productVariantId: uuid("product_variant_id").references(
      () => productVariants.id,
      {
        onDelete: "set null",
      },
    ),
    quantity: integer("quantity").notNull(),
    cardMessages: varchar("card_messages", { length: 600 })
      .array()
      .notNull()
      .default(sql`ARRAY[]::varchar[]`),

    // Product Snapshot
    name: text("name").notNull(),
    collection: text("collection"),
    category: text("category").notNull(),
    primaryImageUrl: text("primary_image_url").notNull(),
    variantAttributes: jsonb("variant_attributes")
      .$type<ProductVariant["attributes"]>()
      .notNull(),
    priceCents: integer("price_cents").notNull(),
  },
  (table) => [
    check("order_items_price_cents_check", sql`${table.priceCents} > 0`),
    check("order_items_quantity_check", sql`${table.quantity} > 0`),

    pgPolicy("authenticated can select own order items snapshot", {
      as: "permissive",
      to: authenticatedRole,
      for: "select",
      using: sql`
        EXISTS (
          SELECT 1 FROM orders 
          WHERE orders.id = order_id 
          AND orders.profile_id = auth.uid()
        )
      `,
    }),

    pgPolicy("authenticated can insert own order items snapshot", {
      as: "permissive",
      to: authenticatedRole,
      for: "insert",
      withCheck: sql`
        EXISTS (
          SELECT 1 FROM orders 
          WHERE orders.id = order_id 
          AND orders.profile_id = auth.uid()
        )
      `,
    }),
  ],
);

export const orderCreationRequests = pgTable(
  "order_creation_requests",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    profileId: uuid("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    idempotencyKey: text("idempotency_key").notNull(),
    status: text("status").default("processing").notNull(),
    orderId: uuid("order_id").references(() => orders.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    uniqueIndex("order_creation_requests_profile_key_unique").on(
      table.profileId,
      table.idempotencyKey,
    ),
    index("idx_order_creation_requests_profile_status").on(
      table.profileId,
      table.status,
    ),
    check(
      "order_creation_requests_status_check",
      sql`${table.status} IN ('processing', 'completed', 'failed')`,
    ),
  ],
);
