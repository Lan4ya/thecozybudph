import { z } from "zod";

export const phMobileSchema = z
  .string()
  .regex(/^\+639\d{9}$/, "Invalid PH mobile number (use +639XXXXXXXXX)");
