import { AppError } from "@shared/errors/Errors.ts";
import { verifySignature } from "@shared/integrations/paymongo/verify-signature.ts";
import {
  orders,
  payments,
  PayMongoWebhookEventPayload,
  webhookEvents,
} from "@shared/schemas/index.ts";
import { isDev } from "@shared/utils/isDev.ts";
import { and, eq, ne } from "drizzle-orm";
import { adminDb } from "@shared/db/client.ts";

/*  
 Create a webhook: Either through paymongo dashboard or their api 'https://developers.paymongo.com/reference/create-a-webhook'
*/

// Updates order and payment statuses with paymongo's webhook event
export const handlePaymentWebhook = async (
  rawBody: string,
  signatureHeader?: string,
): Promise<{ success: boolean }> => {
  if (!signatureHeader) {
    throw AppError.badRequest("Missing signature");
  }

  // Auth & Integrity: Since this is a public api, this is important to verify
  // that the payload is really coming from Paymongo and not from someone malicious.
  const isValid = verifySignature(rawBody, signatureHeader);
  if (!isValid) throw AppError.forbidden("Invalid signature");

  let payload: PayMongoWebhookEventPayload = {};
  try {
    payload = JSON.parse(rawBody);
  } catch {
    throw AppError.badRequest("Invalid JSON payload");
  }
  isDev && console.log({ payload });

  const webhookEvent = payload.data;

  if (
    !webhookEvent?.id ||
    !webhookEvent?.attributes?.type ||
    !webhookEvent.attributes?.data?.id
  ) {
    throw AppError.badRequest("malformed event data");
  }

  const webhookEventId = webhookEvent.id;
  const eventType = webhookEvent.attributes.type;
  const paymentData = webhookEvent.attributes.data;

  const paymentId = paymentData.id;
  const paymentIntentId = paymentData.attributes?.payment_intent_id;

  if (!paymentIntentId) {
    throw AppError.badRequest("missing payment_intent_id in payment data");
  }

  console.log({ webhook_pi_id: paymentIntentId });

  return await adminDb.transaction(async (tx) => {
    // Idempotency guard
    const insertedWebhookEvent = await tx
      .insert(webhookEvents)
      .values({
        provider: "paymongo",
        providerEventId: webhookEventId, // is unique
        payload,
      })
      .onConflictDoNothing()
      .returning({
        id: webhookEvents.id,
      });

    // Duplicate webhook -> already processed (noop). Respond with 200
    if (insertedWebhookEvent.length === 0) {
      console.log(
        "Duplicate webhook -> already processed (noop). Responding with 200...",
      );
      return { success: true };
    }

    // isDev && console.log("Payment Intent ID from webhook:", paymentIntentId);
    // isDev && console.log("Event type:", eventType);

    switch (eventType) {
      case "payment.paid": {
        const paidAt = paymentData.attributes?.paid_at
          ? new Date(paymentData.attributes.paid_at * 1000)
          : new Date();

        // Handle payment status: pending -> paid
        const [updatedPayment] = await tx
          .update(payments)
          .set({
            status: "paid",
            paymentId,
            paidAt,
          })
          .where(
            and(
              eq(payments.isActive, true), // unique per order
              eq(payments.paymentIntentId, paymentIntentId),
              ne(payments.status, "paid"), // unique per order
            ),
          )
          .returning({
            id: payments.id,
            orderId: payments.orderId,
            status: payments.status,
          });

        if (!updatedPayment) {
          const existing = await tx.query.payments.findFirst({
            where: and(
              eq(payments.paymentIntentId, paymentIntentId),
              eq(payments.isActive, true),
            ),
            columns: { status: true, orderId: true },
          });

          if (!existing) {
            throw AppError.notFound("Payment not found");
          }

          if (existing.status === "paid") {
            // already processed → idempotent success
            return { success: true };
          }

          throw AppError.conflict("Invalid payment state transition");
        }

        isDev && console.log("Payment update result:", updatedPayment);

        // Handle order status: to_pay -> paid
        const [updatedOrder] = await tx
          .update(orders)
          .set({
            status: "paid",
          })
          .where(
            and(
              eq(orders.id, updatedPayment.orderId),
              eq(orders.status, "to_pay"),
            ),
          )
          .returning({
            id: orders.id,
            status: orders.status,
          });

        if (!updatedOrder) {
          const existing = await tx.query.orders.findFirst({
            where: eq(orders.id, updatedPayment.orderId),
            columns: { status: true },
          });

          if (!existing) {
            throw AppError.internal("Order not found");
          }

          if (existing.status === "to_ship") {
            // already applied → idempotent success
            return { success: true };
          }

          throw AppError.internal("Invalid order state transition");
        }

        isDev && console.log("Order update result:", updatedOrder);
        break;
      }

      case "payment.failed": {
        // Handle orders status: pending -> failed
        const [updatedFailedPayment] = await tx
          .update(payments)
          .set({
            status: "failed",
          })
          .where(
            and(
              eq(payments.isActive, true), // unique per order
              eq(payments.status, "pending"),
              eq(payments.paymentIntentId, paymentIntentId),
            ),
          )
          .returning({
            id: payments.id,
            orderId: payments.orderId,
            status: payments.status,
          });

        if (!updatedFailedPayment) {
          const existing = await tx.query.payments.findFirst({
            where: and(
              eq(payments.paymentIntentId, paymentIntentId),
              eq(payments.isActive, true),
            ),
            columns: { status: true, orderId: true },
          });

          if (!existing) {
            throw AppError.notFound("Payment not found");
          }

          if (existing.status === "failed") {
            // already processed → idempotent success
            return { success: true };
          }

          throw AppError.conflict("Invalid payment state transition");
        }

        isDev &&
          console.log("Payment update result:", updatedFailedPayment ?? null);

        // INFO: Order status intentionally unchanged: it stays 'to_pay' so
        // the user can retry the failed payment (1 order many payment
        // attempts).
        break;
      }

      // NOTE: As of this writing I don't know if the website will support
      // refunds so I'm not gonna integrate it for now. But if the app ever
      // needs refund feature, maybe change the status of payment to 'refunded'
      // and order to 'fulfilled'.

      // case "payment.refunded": {
      //   break;
      // }

      default: {
        console.warn("Unknown webhook type:", eventType);
        break;
      }
    }

    return { success: true };
  });
};
