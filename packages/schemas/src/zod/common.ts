import { z } from "@hono/zod-openapi";
import { apiSuccessResponseSchema } from "./api/index.ts";

export const phMobileSchema = z
  .string()
  .regex(/^\+639\d{9}$/, "Invalid PH mobile number (use +639XXXXXXXXX)");

export const uuidSchema = z.uuid();

export const serviceTypeSchema = z.enum(["motorcycle", "sedan"]);

export const successSchema = apiSuccessResponseSchema(
  z.object({ success: z.boolean() }),
);
