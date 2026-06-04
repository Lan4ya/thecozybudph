import z from "zod";
import {
  adminGetOrderDataSchema,
  adminQueryOrdersSchema,
} from "../../zod/api/index.ts";
import type { AdminOrderListItem } from "../domain/admin.ts";

export type AdminQueryOrdersInput = z.infer<typeof adminQueryOrdersSchema>;

export type AdminGetOrderData = z.infer<typeof adminGetOrderDataSchema>;

export type AdminQueryOrdersData = {
  orders: AdminOrderListItem[];
  meta: {
    total: number;
    limit: number;
    offset: number;
  };
};
