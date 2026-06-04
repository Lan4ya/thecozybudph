import { z } from "@hono/zod-openapi";
import { eventInquiryFormSchema } from "../form/event.ts";
import { apiSuccessResponseSchema } from "./_response.ts";
import { EVENT_INQUIRY_STATUSES } from "../../types/domain/event.ts";

// ----------------------- REQUEST API SCHEMAS -----------------------

export const eventInquiryStatusSchema = z.enum(EVENT_INQUIRY_STATUSES);

export const createEventInquirySchema = eventInquiryFormSchema;

export const queryEventInquiriesSchema = z.object({
  status: z.preprocess(
    (v) => (v === "all" ? undefined : v),
    eventInquiryStatusSchema.optional(),
  ),
  limit: z.coerce
    .number()
    .int()
    .nonnegative()
    .max(50)
    .optional()
    .default(20)
    .openapi({ type: "integer", minimum: 0, maximum: 50, default: 20 }),
  offset: z.coerce
    .number()
    .int()
    .nonnegative()
    .optional()
    .default(0)
    .openapi({ type: "integer", minimum: 0, default: 0 }),
});

export const updateEventInquirySchema = z.object({
  status: eventInquiryStatusSchema.optional(),
  adminNote: z.string().trim().max(2000).optional(),
});

// ----------------------- DATA SCHEMAS -----------------------

export const eventInquiryDataSchema = eventInquiryFormSchema.extend({
  id: z.uuid(),
  profileId: z.uuid().nullable(),
  status: eventInquiryStatusSchema,
  adminNote: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// ----------------------- RESPONSE SCHEMAS -----------------------

export const getEventInquiryResponseSchema = apiSuccessResponseSchema(
  eventInquiryDataSchema,
);

export const queryEventInquiriesResponseSchema = apiSuccessResponseSchema(
  z.array(eventInquiryDataSchema),
);
