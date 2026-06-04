import { createEventInquiry } from "./create-event-inquiry.ts";
import { queryEventInquiries } from "./query-event-inquiries.ts";
import { updateEventInquiry } from "./update-event-inquiry.ts";
import { getEventInquiryById } from "./get-event-inquiry.ts";

export const EventInquiryActions = {
  createEventInquiry,
  queryEventInquiries,
  updateEventInquiry,
  getEventInquiryById,
};
