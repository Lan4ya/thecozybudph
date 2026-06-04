import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  pgEnum,
  index,
  integer,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { orders } from "./orders.ts";

export const podStatusEnum = pgEnum("pod_status", [
  "FAILED",
  "DELIVERED",
  "SIGNED",
]);

export const shipmentStatusEnum = pgEnum("shipment_status", [
  "ASSIGNING_DRIVER",
  "ON_GOING",
  "PICKED_UP",
  "COMPLETED",
  "CANCELLED",
  "REJECTED",
  "EXPIRED",
]);

export const shipments = pgTable(
  "shipments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .references(() => orders.id, {
        onDelete: "cascade",
      })
      .notNull(),

    // Lalamove identifiers
    lalamoveOrderId: varchar("lalamove_order_id", { length: 255 }).unique(),
    lalamoveQuotationId: varchar("lalamove_quotation_id", {
      length: 255,
    }).unique(),
    shipmentStatus: shipmentStatusEnum("shipment_status"),
    shipmentStatusUpdatedAt: timestamp("shipment_status_updated_at", {
      withTimezone: true,
    }),
    shareLink: text("share_link"),
    totalCents: integer("total_cents"),

    // Proof of Delivery (POD) details
    PODImageUrl: text("pod_image_url"),
    PODStatus: podStatusEnum("pod_status"),
    PODFailedAt: timestamp("failed_at", { withTimezone: true }),
    PODDeliveredAt: timestamp("delivered_at", { withTimezone: true }),

    // Driver assignment properties (fields remain null until driver accepts booking)
    driverId: varchar("driver_id", { length: 100 }),
    driverName: varchar("driver_name", { length: 255 }),
    driverPhone: varchar("driver_phone", { length: 50 }),
    driverShareLink: text("driver_share_link"),
    driverImageUrl: text("driver_image_url"),
    driverPlateNumber: text("driver_plate_number"),
    driverLocation: text("driver_location"),

    // If cancelled
    cancelParty: text("cancel_party"),
    cancelReason: text("cancel_reason"),

    scheduleAt: timestamp("schedule_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("idx_shipments_lalamove_id").on(table.lalamoveOrderId),
    uniqueIndex("shipments_order_id_unique").on(table.orderId),
  ],
);

export const shipmentsRelations = relations(shipments, ({ one }) => ({
  order: one(orders, {
    fields: [shipments.orderId],
    references: [orders.id],
  }),
}));
