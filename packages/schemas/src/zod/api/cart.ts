import { z } from "@hono/zod-openapi";
import { coerceNumber } from "../../types/utils.ts";
import { apiSuccessResponseSchema } from "./_response.ts";

// ----------------------- REQUEST SCHEMAS -----------------------

export const cardMessagesSchema = z
  .preprocess((val) => {
    if (!Array.isArray(val)) return [];
    return val.filter(Boolean);
  }, z.array(z.string().trim()).default([]))
  .openapi({ type: "array", items: { type: "string" } });

export const itemQuantitySchema = coerceNumber(
  z
    .number("quantity must be a number")
    .positive("quantity must be greater than 0")
    .max(1000, "max quantity exceeded"),
);

export const addCartItemSchema = z.object({
  quantity: itemQuantitySchema,
  productId: z.uuid("productId is not a valid UUID"),
  variantId: z.uuid("variantId is not a valid UUID"),
  cardMessages: cardMessagesSchema,
});

export const updateCartItemSchema = z.object({
  newVariantId: z.uuid("variantId is not a valid UUID").optional(),
  quantity: itemQuantitySchema.optional(),
  cardMessages: cardMessagesSchema,
});

export const deleteCartItemsSchema = z.object({
  cartItemIds: z
    .array(z.uuid("one or more cartItemIds have an invalid UUID"))
    .min(1, "at least one productId is required"),
});

// ----------------------- DATA SCHEMAS -----------------------

export const cartItemDataSchema = z.object({
  id: z.uuid(),
  quantity: z.number(),
  cardMessages: z.array(z.string()),
  isAvailable: z.boolean(),
  product: z.object({
    id: z.uuid().nullable(),
    options: z.array(
      z.object({
        name: z.string(),
        values: z.array(z.string()),
      }),
    ),
    name: z.string(),
    primaryImageUrl: z.url(),
    variant: z.object({
      id: z.uuid(),
      priceCents: z.number(),
      attributes: z.record(z.string(), z.string()),
    }),
  }),
});

export const cartItemsDataSchema = z.array(cartItemDataSchema);

export const addCartItemDataSchema = cartItemDataSchema;

export const updateCartItemDataSchema = z.object({
  item: cartItemDataSchema,
  deletedItemId: z.uuid().nullable(),
});

export const deleteCartItemsDataSchema = z.object({
  deletedItemIds: z.array(z.uuid()),
});

// ----------------------- RESPONSE SCHEMAS -----------------------

export const getCartItemsResponseSchema =
  apiSuccessResponseSchema(cartItemsDataSchema);
export const addCartItemResponseSchema = apiSuccessResponseSchema(
  addCartItemDataSchema,
);
export const updateCartItemResponseSchema = apiSuccessResponseSchema(
  updateCartItemDataSchema,
);
export const deleteCartItemsResponseSchema = apiSuccessResponseSchema(
  deleteCartItemsDataSchema,
);
