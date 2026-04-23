import z from "zod";
import { phMobileSchema } from "./common.ts";

export const eventInquiryFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name can't exceed 100 characters"),

  email: z.email("Please enter a valid email address"),

  phone: phMobileSchema.optional().or(z.literal("")),

  eventType: z.string().min(1, "Event type is required"),

  eventDate: z
    .string()
    .min(1, "Event date is required")
    .refine((date) => {
      const selected = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selected >= today;
    }, "Event date must be today or in the future"),

  guestCount: z.coerce
    .number()
    .int("Guest count must be a whole number")
    .min(1, "Guest count must be at least 1")
    .max(1000, "Guest count can't exceed 1000")
    .optional()
    .or(z.literal("")),

  venue: z
    .string()
    .trim()
    .max(200, "Venue can't exceed 200 characters")
    .optional()
    .or(z.literal("")),

  budget: z.string().optional().or(z.literal("")),

  message: z
    .string()
    .trim()
    .min(10, "Please provide at least 10 characters about your event")
    .max(1000, "Message can't exceed 1000 characters"),
});
