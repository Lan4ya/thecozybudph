import {
  PayOrderInput,
  orders,
  payments,
  PayOrderRes,
} from "@shared/schemas/index.ts";
import { and, eq } from "drizzle-orm";
import { DrizzleClient } from "../../../db/client.ts";
import { AppError } from "../../../errors/Errors.ts";
import {
  attachPaymentIntent,
  createPaymentIntent,
  createPaymentMethod,
} from "../../../integrations/paymongo/mod.ts";
import { isDev } from "../../../utils/isDev.ts";
import { OrderRepository } from "../../order/order-repository.ts";

const APP_URL = Deno.env.get("APP_URL");

// Since this is a transactional workflow with external API's involved, I
// decided to not use DB repositories for the main op.
export const payOrder = async (
  db: DrizzleClient,
  payload: PayOrderInput,
  orderId: string,
  idempotencyKey?: string,
): Promise<PayOrderRes> => {
  if (!idempotencyKey) {
    throw AppError.badRequest("Missing Idempotency-Key");
  }

  const order = await OrderRepository.getById(db, orderId);

  if (!order) throw AppError.notFound("Order not found");

  return db.rls(async (tx) => {
    if (new Date().getTime() > order.expiresAt.getTime()) {
      await tx
        .update(orders)
        .set({ status: "expired" })
        .where(eq(orders.id, orderId));
      await tx
        .update(payments)
        .set({ status: "failed" })
        .where(eq(payments.orderId, orderId));

      throw AppError.badRequest("Order has expired");
    }

    const existingPayment = await tx.query.payments.findFirst({
      where: and(
        eq(payments.isActive, true),
        eq(payments.id, payload.paymentId),
        eq(payments.orderId, orderId),
      ),
      columns: {
        id: true,
        status: true,
      },
    });

    if (!existingPayment) throw AppError.notFound("Payment not found");

    if (existingPayment.status === "paid") {
      // Resolve idempotency
      return {
        paymentId: existingPayment.id,
        paymentUrl: null,
        status: existingPayment.status,
      };
    }

    if (existingPayment.status === "failed") {
      // Deactivate
      await tx
        .update(payments)
        .set({ isActive: false })
        .where(eq(payments.id, existingPayment.id));
    }

    try {
      // Init paymongo workflow
      const paymentIntent = await createPaymentIntent(
        {
          amountCents: order.totalCents,
          paymentMethodType: payload.type,
        },
        `${idempotencyKey}:pi`,
      );

      const paymentMethod = await createPaymentMethod(
        {
          billing: payload.billing,
          type: payload.type,
        },
        `${idempotencyKey}:pm`,
      );

      const returnUrl = `payment/${existingPayment.id}/status`;

      const attached = await attachPaymentIntent({
        paymentIntentId: paymentIntent.id,
        paymentMethodId: paymentMethod.id,
        returnUrl: isDev
          ? `http://localhost:5173/${returnUrl}`
          : `${APP_URL!}/${returnUrl}`,
      });

      // Commit paymongo details
      await tx
        .update(payments)
        .set({
          paymentIntentId: paymentIntent.id,
          method: paymentMethod.attributes.type,
          amountCents: paymentIntent.attributes.amount,
          status: "pending",
        })
        .where(eq(payments.id, existingPayment.id));

      return {
        paymentId: existingPayment.id,
        paymentUrl: attached.attributes.next_action.redirect.url,
        status: "pending",
      };
    } catch (err) {
      // Mark as failed
      await tx
        .update(payments)
        .set({
          status: "failed",
        })
        .where(eq(payments.id, existingPayment.id));

      throw err;
    }
  });
};
