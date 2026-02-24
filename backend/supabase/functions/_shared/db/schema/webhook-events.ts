import { pgTable, timestamp, uuid, text, jsonb } from "drizzle-orm/pg-core";

export const carts = pgTable("webhook_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  providerEventId: text("provider_event_id").notNull().unique(),
  provider: text("provider").notNull(),
  payload: jsonb("payload").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});
