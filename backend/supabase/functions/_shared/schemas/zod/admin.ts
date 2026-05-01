import { z } from "zod";
import { orderStatusSchema } from "./order.ts";
import { coerceNumber } from "../types/utils.ts";

export const ORDER_SORT_BY = ["createdAt", "updatedAt", "totalCents"] as const;

const orderSortBySchema = z.enum(ORDER_SORT_BY);
const orderSortDirSchema = z.enum(["asc", "desc"]);

export const adminQueryOrdersSchema = z.object({
  status: orderStatusSchema.optional(),
  sortBy: orderSortBySchema.optional().default("createdAt"),
  sortDir: orderSortDirSchema.optional().default("desc"),
  limit: coerceNumber(z.number().positive().optional()).default(20),
  offset: coerceNumber(z.number().nonnegative().optional()).default(0),
  search: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.string().optional(),
  ),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});
