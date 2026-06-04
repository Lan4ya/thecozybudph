import { z } from "zod";
import {
  createEventInquirySchema,
  eventInquiryDataSchema,
  queryEventInquiriesSchema,
  updateEventInquirySchema,
} from "../../zod/api/event.ts";

export type CreateEventInquiryInput = z.infer<typeof createEventInquirySchema>;
export type EventInquiryData = z.infer<typeof eventInquiryDataSchema>;
export type QueryEventInquiriesParams = z.infer<
  typeof queryEventInquiriesSchema
>;
export type UpdateEventInquiryInput = z.infer<typeof updateEventInquirySchema>;
