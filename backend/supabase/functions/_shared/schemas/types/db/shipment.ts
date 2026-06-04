import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import type { shipments } from "../../drizzle/shipments.ts";
import type { CamelToSnakeCase } from "../utils.ts";
import type { EventInquiryStatus } from "../domain/event.ts";

export type DBEventInquiryStatus = CamelToSnakeCase<EventInquiryStatus>;

export type InsertShipment = InferInsertModel<typeof shipments>;
export type UpdateShipment = Partial<InferInsertModel<typeof shipments>>;
export type SelectShipment = InferSelectModel<typeof shipments>;

// https://developers.lalamove.com/#order-flow-order-status
export type ShipmentStatus =
  | "ASSIGNING_DRIVER"
  | "ON_GOING"
  | "PICKED_UP"
  | "CANCELLED"
  | "COMPLETED"
  | "REJECTED"
  | "EXPIRED"
  | null;
