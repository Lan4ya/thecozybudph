import z from "zod";
import { adminQueryOrdersSchema } from "../../zod/api/index.ts";
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
