import z from "zod";
import { adminQueryOrdersSchema } from "../../zod/index.ts";
import { AdminOrderListItem } from "../domain/admin.ts";

export type AdminQueryOrdersInput = z.infer<typeof adminQueryOrdersSchema>;

export type AdminQueryOrdersRes = {
  orders: AdminOrderListItem[];
  meta: {
    total: number;
    limit: number;
    offset: number;
  };
};
