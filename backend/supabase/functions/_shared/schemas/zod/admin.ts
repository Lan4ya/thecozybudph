import { z } from "@hono/zod-openapi";
import { coerceNumber } from "../types/utils.ts";
import { createAddressSchema } from "./address.ts";
import { orderStatusSchema, serviceTypeSchema } from "./order.ts";

export const ORDER_SORT_BY = ["createdAt", "updatedAt", "totalCents"] as const;

const orderSortBySchema = z.enum(ORDER_SORT_BY);
const orderSortDirSchema = z.enum(["asc", "desc"]);

export const adminQueryOrdersSchema = z.object({
  status: orderStatusSchema.optional(),
  sortBy: orderSortBySchema.optional().default("createdAt"),
  sortDir: orderSortDirSchema.optional().default("desc"),
  limit: coerceNumber(z.number().positive().optional())
    .default(20)
    .openapi({ type: "number", minimum: 1, default: 20 }),
  offset: coerceNumber(z.number().nonnegative().optional())
    .default(0)
    .openapi({ type: "number", minimum: 0, default: 0 }),
  search: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

export const adminShipOrderSchema = z.object({
  sender: z.object({
    address: createAddressSchema.omit({ isDefault: true }),
  }),
  recipient: z.object({
    address: createAddressSchema.omit({ isDefault: true }),
    remarks: z.string().optional(),
  }),
  serviceType: serviceTypeSchema,
});

export const createShippingQuoteSchema = z.object({
  senderAddress: createAddressSchema
    .omit({
      phoneNumber: true,
      fullName: true,
      isDefault: true,
    })
    .optional(),
  recipientAddress: createAddressSchema.omit({
    phoneNumber: true,
    fullName: true,
    isDefault: true,
  }),
  serviceType: serviceTypeSchema.optional(),
});

export const quoteStop = z.object({
  coordinates: z.object({
    lat: z.string().trim().min(1, "lat can't be empty"),
    lng: z.string().trim().min(1, "lng can't be empty"),
  }),
  address: z.string().trim().min(1, "address can't be empty"),
});

export const shippingQuoteSchema = z.object({
  serviceType: z.enum(
    ["MOTORCYCLE", "SEDAN"],
    "invalid serviceType, value must be 'MOTORCYCLE' or 'SEDAN'",
  ),
  stops: z.array(quoteStop).max(2, "stops should only have 2 items"),
});

const lalamoveContactSchema = z.object({
  stopId: z.string().trim().min(1, "stopId can't be empty"),
  name: z.string().trim().min(1, "name can't be empty"),
  phone: z.string().trim().min(1, "phone can't be empty"),
});

const lalamoveRecipientSchema = lalamoveContactSchema.extend({
  remarks: z.string().trim().default(""),
});

export const createShippingOrderSchema = z.object({
  quotationId: z.string().trim().min(1, "quotationId can't be empty"),
  sender: lalamoveContactSchema,
  recipients: z
    .array(lalamoveRecipientSchema)
    .min(1, "at least one recipient is required"),
  isPODEnabled: z.boolean().optional(),
  isRecipientSMSEnabled: z.boolean().optional(),
  partner: z.string().trim().min(1, "partner can't be empty").optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const patchOrderStopSchema = z.object({
  coordinates: quoteStop.shape.coordinates.optional(),
  address: z.string().trim().min(1, "address can't be empty"),
  name: z.string().trim().min(1, "name can't be empty").optional(),
  phone: z.string().trim().min(1, "phone can't be empty").optional(),
  remarks: z.string().trim().min(1, "remarks can't be empty").optional(),
});

export const editShippingOrderSchema = z.object({
  orderId: z.string().trim().min(1, "orderId can't be empty"),
  stops: z.array(patchOrderStopSchema).min(1, "at least one stop is required"),
});

export const addShippingOrderPriorityFeeSchema = z.object({
  orderId: z.string().trim().min(1, "orderId can't be empty"),
  fee: z
    .string()
    .trim()
    .regex(/^\d+(\.\d+)?$/, "fee must be a valid numeric string"),
});

export const getShippingDriverSchema = z.object({
  driverId: z.string().trim().min(1, "driverId can't be empty"),
  orderId: z.string().trim().min(1, "orderId can't be empty"),
});

export const changeShippingDriverSchema = z.object({
  driverId: z.string().trim().min(1, "driverId can't be empty"),
  orderId: z.string().trim().min(1, "orderId can't be empty"),
  reason: z.string().trim().min(1, "reason can't be empty"),
});
export const adminOrderListItemSchema = z.object({
  id: z.string().uuid(),
  profileId: z.string().uuid(),
  status: orderStatusSchema,
  subtotalCents: z.number(),
  discountCents: z.number(),
  passOnFee: z.number(),
  shippingCents: z.number(),
  totalCents: z.number(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  expiresAt: z.string().datetime(),
  items: z.array(
    z.object({
      orderId: z.string().uuid(),
      name: z.string(),
      image: z.string().url().nullable(),
      attributes: z.record(z.string(), z.string()),
      quantity: z.number(),
      cardMessages: z.array(z.string()),
      priceCents: z.number(),
      category: z.string().nullable(),
      collection: z.string().nullable(),
    }),
  ),
  address: z.object({
    name: z.string(),
    phone: z.string(),
    postalCode: z.string(),
    region: z.string(),
    province: z.string().nullable(),
    city: z.string(),
    barangay: z.string(),
    addressLine: z.string(),
  }),
});

export const adminQueryOrdersResponseSchema = z.object({
  data: z.object({
    orders: z.array(adminOrderListItemSchema),
    meta: z.object({
      total: z.number(),
      limit: z.number(),
      offset: z.number(),
    }),
  }),
});

export const adminShipOrderResponseSchema = z.object({
  data: z.object({
    orderId: z.string().uuid(),
    status: orderStatusSchema,
  }),
});

export const adminCancelShipOrderResponseSchema = z.object({
  data: z.object({
    orderId: z.string().uuid(),
    status: orderStatusSchema,
    shipmentStatus: z.string(),
  }),
});

export const getShippingOrderResponseSchema = z.object({
  data: z.record(z.string(), z.unknown()),
});

export const getShippingCitySchema = z.object({
  cityId: z.string().trim().min(1, "cityId can't be empty"),
});
