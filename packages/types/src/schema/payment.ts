import { z } from "zod";
import { coerceNumber } from "../utils/coerceNumber.ts";

export const createPaymentSchema = z.object({
  orderId: z.uuid("not a valid order id"),
  paymentMethod: z.object({
    billing: z.object({
      name: z.string().trim().min(1, "name is required"),
      email: z.email().trim().min(1, "email is required"),
    }),
    type: z.enum(["gcash", "card"]),
  }),
  paymentIntent: z.object({
    amountCents: coerceNumber(
      z
        .number("amount must be a number")
        .nonnegative("amount can't be negative"),
    ),
  }),
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type CreatePaymentMethodInput = CreatePaymentInput["paymentMethod"];
export type CreatePaymentIntentInput = CreatePaymentInput["paymentIntent"];
export type AttachPaymentIntentInput = {
  paymentIntentId: string;
  paymentMethodId: string;
  returnUrl: string;
};

// export const createPaymentIntentSchema = z.object({});
//
// export const attachPaymentIntentSchema = z.object({
//   paymentMethodId: z.uuid("not a valid payment method id"),
//   returnUrl: z.url("not a valid return url"), // website's dns (e.g. thecozybudph.com)
// });
//
// export const paymentIntentIdSchema = z.object({
//   paymentIntentId: z.string().trim().min(1, "payment intent id is required"),
// });

// export type AttachPaymentIntentInput = z.infer<
//   typeof attachPaymentIntentSchema
// >;
