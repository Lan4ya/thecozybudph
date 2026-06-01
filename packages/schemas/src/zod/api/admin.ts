import { z } from "@hono/zod-openapi";
import { orderStatusSchema } from "./order.ts";
import { apiSuccessResponseSchema } from "./_response.ts";
import { serviceTypeSchema } from "../common.ts";

// ----------------------- REQUEST SCHEMAS -----------------------

export const ORDER_SORT_BY = ["createdAt", "updatedAt", "totalCents"] as const;

const orderSortBySchema = z.enum(ORDER_SORT_BY);
const orderSortDirSchema = z.enum(["asc", "desc"]);

export const adminQueryOrdersSchema = z.object({
  status: orderStatusSchema.optional(),
  sortBy: orderSortBySchema.optional().default("createdAt"),
  sortDir: orderSortDirSchema.optional().default("desc"),
  limit: z.coerce
    .number()
    .positive()
    .optional()
    .default(20)
    .openapi({ type: "number", minimum: 1, default: 20 }),
  offset: z.coerce
    .number()
    .nonnegative()
    .optional()
    .default(0)
    .openapi({ type: "number", minimum: 0, default: 0 }),
  search: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

// ----------------------- DATA SCHEMAS -----------------------

export const adminOrderListItemSchema = z.object({
  id: z.uuid(),
  profileId: z.uuid(),
  status: orderStatusSchema,
  shipmentOrderId: z.string().nullable(),
  serviceType: serviceTypeSchema,
  subtotalCents: z.number(),
  discountCents: z.number(),
  passOnFee: z.number(),
  shippingCents: z.number(),
  totalCents: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
  expiresAt: z.date(),
  items: z.array(
    z.object({
      orderId: z.uuid(),
      name: z.string(),
      image: z.url().nullable(),
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

export const adminQueryOrdersDataSchema = z.object({
  orders: z.array(adminOrderListItemSchema),
  meta: z.object({
    total: z.number(),
    limit: z.number(),
    offset: z.number(),
  }),
});

// ----------------------- RESPONSE SCHEMAS -----------------------

export const adminQueryOrdersResponseSchema = apiSuccessResponseSchema(
  adminQueryOrdersDataSchema,
);

// ----------------------- ANALYTICS SCHEMAS -----------------------

export const adminAnalyticsSchema = z.object({
  keyMetrics: z.object({
    totalRevenue: z.object({
      value: z.string(),
      change: z.string(),
      positive: z.boolean(),
    }),
    totalOrders: z.object({
      value: z.string(),
      change: z.string(),
      positive: z.boolean(),
    }),
    totalCustomers: z.object({
      value: z.string(),
      change: z.string(),
      positive: z.boolean(),
    }),
    conversionRate: z.object({
      value: z.string(),
      change: z.string(),
      positive: z.boolean(),
    }),
  }),
  revenueTrend: z.array(
    z.object({
      date: z.string(),
      revenue: z.number(),
      orders: z.number(),
    }),
  ),
  categorySales: z.array(
    z.object({
      name: z.string(),
      value: z.number(),
      color: z.string(),
    }),
  ),
  topProducts: z.array(
    z.object({
      name: z.string(),
      sales: z.number(),
      revenue: z.number(),
    }),
  ),
  dailyOrders: z.array(
    z.object({
      date: z.string(),
      orders: z.number(),
    }),
  ),
  customerAcquisition: z.array(
    z.object({
      month: z.string(),
      customers: z.number(),
    }),
  ),
  recentTransactions: z.array(
    z.object({
      id: z.string(),
      customer: z.string(),
      amount: z.string(),
      status: z.string(),
      date: z.string(),
    }),
  ),
  productPerformance: z.array(
    z.object({
      name: z.string(),
      views: z.number(),
      clicks: z.number(),
      conversions: z.number(),
      revenue: z.string(),
    }),
  ),
});

export const adminAnalyticsResponseSchema =
  apiSuccessResponseSchema(adminAnalyticsSchema);
