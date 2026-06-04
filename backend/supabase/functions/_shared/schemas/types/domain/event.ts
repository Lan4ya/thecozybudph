export const EVENT_INQUIRY_STATUSES = [
  "new",
  "contacted",
  "quoted",
  "closed",
] as const;

export type EventInquiryStatus = (typeof EVENT_INQUIRY_STATUSES)[number];
