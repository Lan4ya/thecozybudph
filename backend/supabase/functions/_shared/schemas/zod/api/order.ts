import { z } from "@hono/zod-openapi";
import { createAddressSchema } from "./address.ts";
import { apiSuccessResponseSchema } from "./_response.ts";
import { addCartItemSchema } from "./cart.ts";
import { serviceTypeSchema } from "../common.ts";

// ----------------------- REQUEST API SCHEMAS -----------------------

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
export const customerOrderStatusSchema = z.enum(CUSTOMER_ORDER_STATUS);

export const queryOrdersSchema = z.object({
  status: z.preprocess(
    (v) => (v === "all" ? undefined : v),
    customerOrderStatusSchema.optional(),
  ),
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
export const paymentStatusSchema = z.enum([
  "processing",
  "pending",
  "paid",
  "failed",
  "cancelled",
  "refunded",
]);

export const orderItemSnapshotSchema = z.object({
  orderId: z.uuid(),
  id: z.uuid(),
  productId: z.uuid().nullable(),
  productVariantId: z.uuid().nullable(),
  quantity: z.number(),
  cardMessages: z.array(z.string()),
  name: z.string(),
  collection: z.string().nullable(),
  category: z.string(),
  primaryImageUrl: z.url(),
  variantAttributes: z.record(z.string(), z.string()),
  priceCents: z.number(),
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

// ----------------------- DATA SCHEMAS -----------------------

export const getOrderItemDataSchema = z.object({
  id: z.string(),
  orderId: z.uuid(),
  shipmentOrderId: z.string().nullable(),
  quantity: z.number().int().nonnegative(),
  cardMessages: z.array(z.string()),
  name: z.string(),
  collection: z.string().nullable(),
  category: z.string(),
  primaryImageUrl: z.url(),
  variantAttributes: z.record(z.string(), z.string()),
  priceCents: z.number().int().nonnegative(),

  createdAt: z.date().nullable(),

  status: customerOrderStatusSchema,
  serviceType: serviceTypeSchema,

  subtotalCents: z.number().int().nonnegative(),
  discountCents: z.number().int().nonnegative(),
  shippingCents: z.number().int().nonnegative(),
  passOnFee: z.number().int().nonnegative(),
  totalCents: z.number().int().nonnegative(),

  address: createAddressSchema.omit({ isDefault: true }),
});

export const queryOrderDataSchema = z.object({
  id: z.uuid(),
  status: customerOrderStatusSchema,
  totalCents: z.number(),
  expiresAt: z.date(),
  item: z.object({
    id: z.uuid(),
    quantity: z.number(),
    name: z.string(),
    category: z.string(),
    primaryImageUrl: z.url(),
    variantAttributes: z.record(z.string(), z.string()),
    priceCents: z.number(),
  }),
});

export const createOrderDataSchema = z.object({
  orderId: z.uuid(),
  paymentId: z.uuid(),
});

export const payOrderDataSchema = z.object({
  paymentId: z.uuid(),
  paymentUrl: z.url().nullable(),
  status: paymentStatusSchema,
});

export const customerPaymentStatusSchema = z.enum([
  "pending",
  "paid",
  "failed",
]);

export const getOrderPaymentStatusDataSchema = z.object({
  status: customerPaymentStatusSchema,
  expiresAt: z.date(),
});

// ----------------------- RESPONSE SCHEMAS -----------------------

export const getOrderItemResponseSchema = apiSuccessResponseSchema(
  getOrderItemDataSchema,
);

export const queryOrdersResponseSchema = apiSuccessResponseSchema(
  z.array(queryOrderDataSchema),
);

export const getOrderResponseSchema =
  apiSuccessResponseSchema(queryOrderDataSchema);

export const createOrderResponseSchema = apiSuccessResponseSchema(
  createOrderDataSchema,
);

export const payOrderResponseSchema =
  apiSuccessResponseSchema(payOrderDataSchema);

export const getOrderPaymentStatusResponseSchema = apiSuccessResponseSchema(
  getOrderPaymentStatusDataSchema,
);
