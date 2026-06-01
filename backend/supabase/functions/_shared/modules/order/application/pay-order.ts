import { PayOrderInput, payments, PayOrderRes } from "@shared/schemas/index.ts";
import { and, eq, isNull, or } from "drizzle-orm";
import { DrizzleClient } from "@shared/db/client.ts";
import { AppError } from "@shared/errors/Errors.ts";
import { OrderRepository } from "@shared/modules/order/order-repository.ts";
import { createPaymentIntent } from "@shared/integrations/paymongo/create-payment-intent.ts";
import { createPaymentMethod } from "@shared/integrations/paymongo/create-payment-method.ts";
import { attachPaymentIntent } from "@shared/integrations/paymongo/attach-payment-intent.ts";
import { isDev } from "@shared/utils/isDev.ts";

export const payOrder = async (
  db: DrizzleClient,
  params: {
    payload: PayOrderInput;
    orderId: string;
    idempotencyKey?: string;
    appURL: string;
  },
): Promise<PayOrderRes> => {
  const { appURL, idempotencyKey, payload, orderId } = params;

  if (!idempotencyKey) {
    throw AppError.badRequest({ message: "Missing Idempotency-Key" });
  }

  const order = await OrderRepository.getById(db, orderId);

  if (!order) throw AppError.notFound({ message: "Order not found" });

  if (new Date().getTime() > order.expiresAt.getTime()) {
    await OrderRepository.updateStatus(db, {
      orderId,
      status: "expired",
    });

    throw AppError.badRequest({ message: "Order has expired" });
  }

  return db.rls(async (tx) => {
    const existingPayment = await tx.query.payments.findFirst({
      where: and(
        eq(payments.isActive, true),
        eq(payments.id, payload.paymentId),
        eq(payments.orderId, orderId),
      ),
      columns: {
        id: true,
        status: true,
        paymentIntentId: true,
      },
    });

    if (!existingPayment)
      throw AppError.notFound({ message: "Payment not found" });

    if (existingPayment.status === "paid") {
      // idempotency
      return {
        paymentId: existingPayment.id,
        paymentUrl: null,
        status: existingPayment.status,
        // message: "Payment already completed",
      };
    }

    if (existingPayment.status === "processing") {
      throw AppError.conflict({
        message: "Payment is currently being processed",
      });
    }

    // Atomic claim: only one request may transition this payment into
    // "processing" before calling external payment APIs.
    const [claimedPayment] = await tx
      .update(payments)
      .set({ status: "processing" })
      .where(
        and(
          eq(payments.id, existingPayment.id),
          eq(payments.orderId, orderId),
          eq(payments.isActive, true),
          or(
            eq(payments.status, "failed"),
            and(
              eq(payments.status, "pending"),
              isNull(payments.paymentIntentId),
            ),
          ),
        ),
      )
      .returning({ id: payments.id });

    if (!claimedPayment) {
      const latestPayment = await tx.query.payments.findFirst({
        where: and(
          eq(payments.id, payload.paymentId),
          eq(payments.orderId, orderId),
          eq(payments.isActive, true),
        ),
        columns: {
          id: true,
          status: true,
          paymentIntentId: true,
        },
      });

      if (!latestPayment)
        throw AppError.notFound({ message: "Payment not found" });

      if (latestPayment.status === "paid") {
        return {
          paymentId: latestPayment.id,
          paymentUrl: null,
          status: latestPayment.status,
        };
      }

      if (
        latestPayment.status === "processing" ||
        (latestPayment.status === "pending" && !!latestPayment.paymentIntentId)
      ) {
        throw AppError.conflict({
          message: "Payment attempt already started for this order.",
        });
      }

      throw AppError.conflict({
        message: "Unable to claim payment for processing.",
      });
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
          : `${appURL!}/${returnUrl}`,
      });

      // Commit paymongo details
      const [committedPayment] = await tx
        .update(payments)
        .set({
          paymentIntentId: paymentIntent.id,
          method: paymentMethod.attributes.type,
          amountCents: paymentIntent.attributes.amount,
          status: "pending",
        })
        .where(
          and(
            eq(payments.id, claimedPayment.id),
            eq(payments.status, "processing"),
          ),
        )
        .returning({ id: payments.id });

      if (!committedPayment) {
        throw AppError.conflict({
          message: "Payment status changed before commit.",
        });
      }

      return {
        paymentId: claimedPayment.id,
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
        .where(
          and(
            eq(payments.id, claimedPayment.id),
            eq(payments.status, "processing"),
          ),
        );

      throw err;
    }
  });
};
