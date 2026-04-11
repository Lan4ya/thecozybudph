import { and, eq, inArray } from "drizzle-orm";
import { DrizzleClient } from "../../db/client.ts";
import { payments } from "../../db/schema/mod.ts";
import { InsertPayment, UpdatePayment } from "../../db/types/payments.ts";

export const PaymentRepository = {
  insertPendingPayment: (db: DrizzleClient, payload: InsertPayment) => {
    return db.rls(async (tx) => {
      const [pendingPayment] = await tx
        .insert(payments)
        .values(payload)
        .returning({ id: payments.id, status: payments.status });

      return pendingPayment;
    });
  },

  updatePayment: (
    db: DrizzleClient,
    paymentIntentId: string,
    paymentUpdate: UpdatePayment,
  ) => {
    return db.rls(async (tx) => {
      const [updated] = await tx
        .update(payments)
        .set(paymentUpdate)
        .where(
          and(
            eq(payments.paymentIntentId, paymentIntentId),
            inArray(payments.status, ["pending"]),
          ),
        )
        .returning();

      return updated;
    });
  },
};
