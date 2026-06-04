import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import type { eventInquiries } from "../../drizzle/event-inquiries.ts";
import type { CamelToSnakeCase } from "../utils.ts";
import type { EventInquiryStatus } from "../domain/event.ts";

export type DBEventInquiryStatus = CamelToSnakeCase<EventInquiryStatus>;

export type InsertEventInquiry = InferInsertModel<typeof eventInquiries>;
export type SelectEventInquiry = InferSelectModel<typeof eventInquiries>;
