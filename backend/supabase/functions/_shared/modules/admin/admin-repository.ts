import { DBOrderStatus, orders } from "@shared/schemas/index.ts";
import { eq } from "drizzle-orm";
import { DrizzleClient } from "../../db/client.ts";

export const AdminRepository = {
  updateStatus: async (
    db: DrizzleClient,
    params: {
      orderId: string;
      status: DBOrderStatus;
      shippingOrderId?: string;
    },
  ) => {
    const { orderId, ...rest } = params;
    const [row] = await db.admin
      .update(orders)
      .set(rest)
      .where(eq(orders.id, orderId))
      .returning({ status: orders.status });
    return row.status;
  },
};
