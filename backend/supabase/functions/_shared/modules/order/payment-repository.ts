import { payments } from "@shared/schemas/index.ts";
import { and, eq } from "drizzle-orm";
import { DrizzleClient } from "../../db/client.ts";

export const PaymentRepository = {
  checkExists: (
    db: DrizzleClient,
    params: {
      paymentId: string;
      profileId: string;
    },
  ): Promise<boolean> => {
    const { paymentId, profileId } = params;

    return db.rls(async (tx) => {
      const result = await tx.query.payments.findFirst({
        where: and(
          eq(payments.id, paymentId),
          eq(payments.profileId, profileId),
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
      const result = await tx.query.payments.findFirst({
        columns: {
          status: true,
          orderId: true,
        },
        with: {
          order: {
            columns: {
              expiresAt: true,
            },
          },
        },
        where: (payments, { and, eq, notInArray }) =>
          and(
            eq(payments.id, paymentId),
            notInArray(payments.status, ["refunded", "cancelled"]),
          ),
      });

      if (!result) return null;

      return {
        orderId: result.orderId,
        status: result.status,
        expiresAt: result.order?.expiresAt ?? null,
      };
    });
  },
};
