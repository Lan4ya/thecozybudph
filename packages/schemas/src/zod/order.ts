import { z } from "@hono/zod-openapi";
import { addCartItemSchema } from "./cart.ts";
import { createAddressSchema } from "./address.ts";

// Stripped down version of order status shown to customers
export const CUSTOMER_ORDER_STATUS = [
  "toPay",
  "toShip",
  "toReceive",
  "fulfilled",
  "cancelled",
] as const;

export const ORDER_STATUS = [
  ...CUSTOMER_ORDER_STATUS,
  "paid",
  "shipped",
  "expired",
] as const;

export const orderStatusSchema = z.enum(ORDER_STATUS);
export const orderSourceSchema = z.enum(["shop", "cart"]);
export const customerOrderStatus = z.enum(CUSTOMER_ORDER_STATUS);

export const queryOrdersSchema = z.object({
  status: customerOrderStatus.default("toPay"),
  limit: z.coerce
    .number()
    .int()
    .nonnegative()
    .max(20)
    .optional()
    .default(20)
    .openapi({ type: "integer", minimum: 0, maximum: 20, default: 20 }),
  offset: z.coerce
    .number()
    .int()
    .nonnegative()
    .optional()
    .default(0)
    .openapi({ type: "integer", minimum: 0, default: 0 }),
});

// The app will allow gcash and banks as payment method type
export const paymentMethodTypesSchema = z.enum(["gcash", "brankas"]); // brankas is online banking
export const serviceTypeSchema = z.enum(["motorcycle", "sedan"]);
export const paymentStatusSchema = z.enum([
  "processing",
  "pending",
  "paid",
  "failed",
  "cancelled",
  "refunded",
]);

export const orderItemSnapshotSchema = z.object({
  orderId: z.string().uuid(),
  id: z.string().uuid(),
  productId: z.string().uuid().nullable(),
  productVariantId: z.string().uuid().nullable(),
  quantity: z.number(),
  cardMessages: z.array(z.string()),
  name: z.string(),
  collection: z.string().nullable(),
  category: z.string(),
  primaryImageUrl: z.string().url(),
  variantAttributes: z.record(z.string(), z.string()),
  priceCents: z.number(),
});

export const orderResponseSchema = z.object({
  id: z.string().uuid(),
  status: customerOrderStatus,
  serviceType: serviceTypeSchema,
  items: z.array(orderItemSnapshotSchema),
  subtotalCents: z.number(),
  discountCents: z.number(),
  shippingCents: z.number(),
  passOnFee: z.number(),
  totalCents: z.number(),
  address: createAddressSchema.omit({ isDefault: true }),
  createdAt: z.string().datetime().nullable(),
  expiresAt: z.string().datetime(),
});

export const queryOrdersResponseSchema = z.object({
  data: z.array(orderResponseSchema),
});

export const getOrderResponseSchema = z.object({
  data: orderResponseSchema,
});

export const createOrderResponseSchema = z.object({
  data: z.object({
    orderId: z.string().uuid(),
    paymentId: z.string().uuid(),
  }),
});

export const payOrderResponseSchema = z.object({
  data: z.object({
    paymentId: z.string().uuid(),
    paymentUrl: z.string().url().nullable(),
    status: paymentStatusSchema,
  }),
});

export const getOrderPaymentStatusResponseSchema = z.object({
  data: z.object({
    status: paymentStatusSchema,
    expiresAt: z.string().datetime(),
  }),
});

export const createShippingQuoteResponseSchema = z.object({
  data: z.array(z.record(z.string(), z.unknown())),
});

export const orderItemSchema = addCartItemSchema;
export const orderAddressSchema = createAddressSchema;

export const createOrderSchema = z.object({
  source: orderSourceSchema,
  items: z
    .array(
      orderItemSchema.extend({
        primaryImageUrl: z.url("primaryImageUrl is not a valid url"),
      }),
    )
    .min(1, "order must have at least one item"),
  addressId: z.uuid("addressId is not a valid UUID"),
  shippingQuoteId: z.string().trim().min(1, "shippingQuoteId can't be empty"),
  paymentMethodType: paymentMethodTypesSchema,
  serviceType: serviceTypeSchema,
});

export const payOrderSchema = z.object({
  paymentId: z.uuid("paymentId is not a valid UUID"),
  billing: z.object({
    name: z.string().trim().min(1, "name is required"),
    email: z.email().trim().min(1, "email is required"),
  }),
  type: paymentMethodTypesSchema,
  checkoutSessionId: z.uuid("checkoutSessionId is not a valid UUID"),
});
