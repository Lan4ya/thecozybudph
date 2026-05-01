import { and, eq } from "drizzle-orm";
import { DrizzleClient } from "../../db/client.ts";
import { orders, payments } from "@shared/schemas/index.ts";

export const PaymentRepository = {
  checkExists: (
    db: DrizzleClient,
    params: {
      paymentId: string;
      profileId: string;
      isActive?: boolean;
    },
  ): Promise<boolean> => {
    const { paymentId, profileId, isActive = true } = params;

    return db.rls(async (tx) => {
      const result = await tx.query.payments.findFirst({
        where: and(
          eq(payments.id, paymentId),
          eq(payments.profileId, profileId),
          eq(payments.isActive, isActive),
        ),
        columns: {
          id: true,
        },
      });

      return !!result;
    });
  },

  getActiveStatusById: (db: DrizzleClient, paymentId: string) => {
    return db.rls(async (tx) => {
      const [result] = await tx
        .select({
          status: payments.status,
          expiresAt: orders.expiresAt,
        })
        .from(payments)
        .innerJoin(orders, eq(payments.orderId, orders.id))
        .where(and(eq(payments.isActive, true), eq(payments.id, paymentId)));

      return result;
    });
  },
};
