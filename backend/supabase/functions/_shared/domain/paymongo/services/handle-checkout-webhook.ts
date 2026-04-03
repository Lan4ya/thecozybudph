import { orders, payments, webhookEvents } from "@shared/db/schema/mod.ts";
import { AppError } from "@shared/errors/Errors.ts";
import { and, eq, ne } from "drizzle-orm";
import { verifySignature } from "../verify-signature.ts";
import { PayMongoWebhookEventPayload } from "../../../types/index.ts";
import { createDrizzle } from "../../../db/client.ts";
import { isDev } from "../../../utils/isDev.ts";

// TODO: implement pending checkout 30mins expiration
export const handleCheckoutWebhook = async (
  rawRequestBody: string,
  signatureHeader?: string,
) => {
  if (!signatureHeader) {
    throw AppError.badRequest("Missing signature");
  }

  // Auth & Integrity: Since this is a public api, this is important to verify the payload
  // is really coming from Paymongo and not from someone malicious.
  const isValid = await verifySignature(signatureHeader, rawRequestBody);
  if (!isValid) throw AppError.forbidden("Invalid signature");

  let payload: PayMongoWebhookEventPayload = {};
  try {
    payload = JSON.parse(rawRequestBody);
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

  const db = createDrizzle(true);

  return await db.admin.transaction(async (tx) => {
    // Idempotency guard
    const insertedWebhookEvent = await tx
      .insert(webhookEvents)
      .values({
        provider: "paymongo",
        providerEventId: webhookEventId,
        payload,
      })
      .onConflictDoNothing() // event id is unique
      .returning({
        id: webhookEvents.id,
      });

    // Duplicate webhook -> already processed (noop). Respond with 200
    if (insertedWebhookEvent.length === 0) {
      return { success: true };
    }

    // Check payment existence with payloads PI id
    const paymentRow = await tx.query.payments.findFirst({
      where: eq(payments.paymentIntentId, paymentIntentId),
      columns: {
        id: true,
        orderId: true,
        paymentIntentId: true,
      },
    });

    if (!paymentRow) {
      throw AppError.notFound("Payment not found");
    }

    isDev && console.log("Payment Intent ID from webhook:", paymentIntentId);
    isDev && console.log("Event type:", eventType);

    switch (eventType) {
      case "payment.paid": {
        const paidAt = paymentData.attributes?.paid_at
          ? new Date(paymentData.attributes.paid_at * 1000)
          : null;

        // Handle payment status: pending -> paid
        const updatedPayments = await tx
          .update(payments)
          .set({
            status: "paid",
            paymentId,
            paidAt,
          })
          .where(
            and(
              eq(payments.paymentIntentId, paymentIntentId),
              ne(payments.status, "paid"),
            ),
          )
          .returning({
            id: payments.id,
            orderId: payments.orderId,
            status: payments.status,
          });

        const updatedPayment = updatedPayments[0];

        if (!updatedPayment) {
          throw AppError.conflict(
            `Payment not updated: no pending payment found for payment_intent_id ${paymentIntentId}`,
          );
        }

        isDev && console.log("Payment update result:", updatedPayment);

        // Handle order status: pending -> confirmed
        const updatedOrders = await tx
          .update(orders)
          .set({
            status: "confirmed",
          })
          .where(
            and(
              eq(orders.id, updatedPayment.orderId),
              ne(orders.status, "confirmed"),
            ),
          )
          .returning({
            id: orders.id,
            status: orders.status,
          });

        const updatedOrder = updatedOrders[0];

        if (!updatedOrder) {
          throw AppError.internal(
            "confirming order failed",
            new Error("Invariant violation: order update returned no data"),
          );
        }

        isDev && console.log("Order update result:", updatedOrder);
        break;
      }

      case "payment.failed": {
        // Handle orders status: pending -> failed
        const updatedFailedPayments = await tx
          .update(payments)
          .set({
            status: "failed",
          })
          .where(
            and(
              eq(payments.paymentIntentId, paymentIntentId),
              ne(payments.status, "failed"),
            ),
          )
          .returning({
            id: payments.id,
            orderId: payments.orderId,
            status: payments.status,
          });

        isDev &&
          console.log(
            "Payment update result:",
            updatedFailedPayments[0] ?? null,
          );

        // INFO: Order status intentionally unchanged: it stays 'pending' so the user can retry the failed payment
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
        console.warn("Unknown PayMongo webhook type:", eventType);
        break;
      }
    }

    return { success: true };
  });
};
