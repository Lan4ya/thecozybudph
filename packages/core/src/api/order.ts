import { z } from "zod";
import { coerceNumber } from "../utils/coerceNumber.ts";
// import type { SnakeToCamel } from "../utils/snakeToCamelCase.ts";

// REQUEST TYPES:

export const createOrderSchema = z.object({
  profileId: z.string().min(1, "profile id id is required"),
  addressId: z.string().min(1, "address id is required"),

  subtotalCents: coerceNumber(
    z.number().nonnegative("subtotal can't be negative"),
  ),
  shippingCents: coerceNumber(
    z.number().nonnegative("shipping fee can't be negative"),
  ),
  discountCents: coerceNumber(
    z.number().nonnegative("discount can't be negative").nullable(),
  ),
  totalCents: coerceNumber(z.number().nonnegative("total can't be negative")),

  orderItems: z
    .array(
      z.object({
        productId: z.string("product id is required"),
        name: z.string("product id is required"),
        quantity: coerceNumber(
          z
            .number()
            .positive("please order at least one item")
            .max(100_000, "quantity can't exceed 100,000"),
        ),
        priceCents: coerceNumber(
          z.number().nonnegative("price can't be negative"),
        ),
      }),
    )
    .min(1, "order must have at least one item"),
});

export type CreateOrderRequest = z.infer<typeof createOrderSchema>;

// RESPONSE TYPES:
