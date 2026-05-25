import z from "zod";
import {
  adminAnalyticsSchema,
  adminQueryOrdersSchema,
} from "../../zod/api/index.ts";
import type { AdminOrderListItem } from "../domain/admin.ts";

export type AdminQueryOrdersInput = z.infer<typeof adminQueryOrdersSchema>;

export type AdminQueryOrdersRes = {
  orders: AdminOrderListItem[];
  meta: {
    total: number;
    limit: number;
    offset: number;
  };
};

export type AdminAnalyticsRes = z.infer<typeof adminAnalyticsSchema>;
