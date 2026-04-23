import z from "zod";
import { eventInquiryFormSchema } from "../../zod/index.ts";

export type EventInquiryFormInput = z.infer<typeof eventInquiryFormSchema>;
