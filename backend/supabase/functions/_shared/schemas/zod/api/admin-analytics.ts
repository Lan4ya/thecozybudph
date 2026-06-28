import z from "zod";
import { apiSuccessResponseSchema } from "./_response.ts";

export const adminAnalyticsDataSchema = z.object({
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

export const adminAnalyticsResponseSchema = apiSuccessResponseSchema(
  adminAnalyticsDataSchema,
);
