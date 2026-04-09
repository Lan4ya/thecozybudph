import { z } from "zod";

// The app will allow gcash and banks as payment method type
export const paymentMethodTypesSchema = z.enum(["gcash", "brankas"]); // brankas is online banking

export const createPaymentSchema = z.object({
  billing: z.object({
    name: z.string().trim().min(1, "name is required"),
    email: z.email().trim().min(1, "email is required"),
  }),
  type: paymentMethodTypesSchema,
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type PaymentMethodTypes = z.infer<typeof paymentMethodTypesSchema>;
