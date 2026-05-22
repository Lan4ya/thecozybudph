import z from "zod";
import type { eventInquiryFormSchema } from "../../zod/index.ts";

export type EventInquiryFormInput = z.infer<typeof eventInquiryFormSchema>;
