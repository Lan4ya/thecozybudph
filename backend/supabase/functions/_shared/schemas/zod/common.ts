import { z } from "@hono/zod-openapi";

export const phMobileSchema = z
  .string()
  .regex(/^\+639\d{9}$/, "Invalid PH mobile number (use +639XXXXXXXXX)");

// export const uuidSchema = z.uuid();

export const serviceTypeSchema = z.enum(["motorcycle", "sedan"]);
