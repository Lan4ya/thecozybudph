import {
  pgTable,
  timestamp,
  uuid,
  text,
  jsonb,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const webhookEvents = pgTable("webhook_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  providerEventId: text("provider_event_id").notNull().unique(),
  provider: text("provider").notNull(),
  payload: jsonb("payload").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const idempotencyKeys = pgTable("idempotency_keys", {
  id: uuid("id").defaultRandom().primaryKey(),
  profileId: uuid("profile_id").notNull(),
  operation: text("operation").notNull(),
  idempotencyKey: text("idempotency_key").notNull(),
  requestHash: text("request_hash").notNull(),
  status: text("status")
    .$type<"processing" | "completed" | "failed">()
    .notNull()
    .default("processing"),
  responsePayload: jsonb("response_payload"),
  errorPayload: jsonb("error_payload"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
}, (table) => ({
  profileOperationKeyUnique: uniqueIndex("idempotency_profile_operation_key_uidx")
    .on(table.profileId, table.operation, table.idempotencyKey),
}));
