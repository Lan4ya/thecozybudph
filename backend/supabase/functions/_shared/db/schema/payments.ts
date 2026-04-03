import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  check,
  pgPolicy,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { orders } from "./orders.ts";
import { authenticatedRole } from "drizzle-orm/supabase/rls";

export const payments = pgTable(
  "payments",
  {
    id: uuid("id").defaultRandom().notNull().primaryKey(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "set null" }),

    // Paymongo IDs
    paymentIntentId: text("payment_intent_id").notNull(),
    paymentId: text("payment_id"),

    amountCents: integer("amount_cents").notNull(),
    currency: text("currency").default("PHP").notNull(),
    status: text("status").notNull(),
    method: text("method"),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
    paidAt: timestamp("paid_at", { withTimezone: true }),
  },
  (table) => [
    check("payments_amount_cents_check", sql`${table.amountCents} >= 0`),
    check(
      "payments_status_check",
      sql`${table.status} IN ('pending', 'paid', 'failed', 'cancelled', 'refunded')`,
    ),

    pgPolicy("authenticated can select own payments", {
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

    pgPolicy("authenticated can insert own payments", {
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
