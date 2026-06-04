import { DrizzleClient } from "@shared/db/client.ts";
import { AppError } from "@shared/errors/Errors.ts";
import { attachPaymentIntent } from "@shared/integrations/paymongo/attach-payment-intent.ts";
import { createPaymentIntent } from "@shared/integrations/paymongo/create-payment-intent.ts";
import { createPaymentMethod } from "@shared/integrations/paymongo/create-payment-method.ts";
import { getPaymentIntent } from "@shared/integrations/paymongo/get-payment-intent.ts";
import { OrderRepository } from "@shared/modules/order/order-repository.ts";
import { payments, PayOrderInput, PayOrderRes } from "@shared/schemas/index.ts";
import { isDev } from "@shared/utils/isDev.ts";
import { and, eq } from "drizzle-orm";

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
    const [existingPayment] = await tx
      .select({
        id: payments.id,
        status: payments.status,
        paymentIntentId: payments.paymentIntentId,
        orderId: payments.orderId,
        profileId: payments.profileId,
        currency: payments.currency,
      })
      .from(payments)
      .where(
        and(eq(payments.id, payload.paymentId), eq(payments.orderId, orderId)),
      )
      .for("update"); // 🔒 Row is locked until transaction commits (prevents race conditions)

    if (!existingPayment) {
      throw AppError.notFound({ message: "Payment not found" });
    }

    // Existing payment status definitions at this current stage:
    // - pending: First attempt or subsequent if user didn't complete the payment while in 3DS and is attempting again
    // - processing: Ongoing payment, waiting for PayMongo's webhook event. DB is locked
    // - failed: Previous attempt failed, retry
    // - expired: Previous attempt expired, retry
    // - paid: Successful attempt.

    if (existingPayment.status === "paid") {
      // Idempotency
      return {
        paymentId: existingPayment.id,
        paymentUrl: null,
        status: existingPayment.status,
      };
    }

    if (existingPayment.status === "processing") {
      throw AppError.conflict({
        message: "Payment is currently being processed",
      });
    }

    // Mark the current payment as processing to prevent concurrent attempts
    await tx
      .update(payments)
      .set({ status: "processing" })
      .where(eq(payments.id, existingPayment.id));

    // Init PayMongo workflow
    let paymentIntent: Awaited<ReturnType<typeof createPaymentIntent>>;
    let paymentMethod: Awaited<ReturnType<typeof createPaymentMethod>>;

    // Fetch previous intent if it exists to see if we can safely reuse it
    let prevPaymentIntent: Awaited<ReturnType<typeof getPaymentIntent>> | null =
      null;

    if (existingPayment.paymentIntentId) {
      prevPaymentIntent = await getPaymentIntent(
        existingPayment.paymentIntentId,
      );
    }

    // Check for clean fallback capability
    if (
      prevPaymentIntent &&
      prevPaymentIntent.attributes.status === "awaiting_payment_method"
    ) {
      // Reuse path: previous attempt failed or pm method expired
      paymentIntent = prevPaymentIntent;

      paymentMethod = await createPaymentMethod(
        {
          billing: payload.billing,
          type: payload.type,
        },
        `${idempotencyKey}:pm:retry:${existingPayment.id}`,
      );
    } else {
      // Initial setup OR fallback recovery if the old intent is locked in 'awaiting_next_action'
      paymentIntent = await createPaymentIntent(
        {
          amountCents: order.totalCents,
          paymentMethodType: payload.type,
        },
        `${idempotencyKey}:pi:${existingPayment.id}_${Date.now()}`,
      );

      paymentMethod = await createPaymentMethod(
        {
          billing: payload.billing,
          type: payload.type,
        },
        `${idempotencyKey}:pm:${existingPayment.id}_${Date.now()}`,
      );
    }

    const returnUrl = `payment/${existingPayment.id}/status`;

    const attachedPaymentIntent = await attachPaymentIntent({
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
      })
      .where(
        and(
          eq(payments.id, existingPayment.id),
          eq(payments.status, "processing"),
        ),
      )
      .returning({ id: payments.id });

    return {
      paymentId: committedPayment.id,
      paymentUrl: attachedPaymentIntent.attributes.next_action.redirect.url,
      status: "pending",
    };
  });
};
