import { z } from "zod";
// import type { SnakeToCamel } from "../utils/snakeToCamelCase.ts";

// REQUEST TYPES:

export const createPaymentIntentSchema = z.object({
  data: z.object({
    attributes: z.object({
      amount: z.number().int().positive(),
      payment_method_allowed: z.array(z.enum(["card", "gcash"])),
      payment_method_options: z
        .object({
          card: z.object({
            request_three_d_secure: z.literal("any").default("any"),
          }),
        })
        .optional(),
      currency: z.literal("PHP"),
      capture_type: z.enum(["automatic", "manual"]),
    }),
  }),
});

export const createPaymentMethodSchema = z.object({
  data: z.object({
    attributes: z.object({
      billing: z.object({
        name: z.string(),
        email: z.email(),
      }),
      type: z.enum(["gcash", "card"]),
    }),
  }),
});

export type CreatePaymentIntentRequest = z.infer<
  typeof createPaymentIntentSchema
>;
export type CreatePaymentMethodRequest = z.infer<
  typeof createPaymentMethodSchema
>;
