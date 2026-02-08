import { AppError } from "@shared/errors/Errors.ts";
import { verifySignature } from "./verify-signature.ts";
import { SupabaseType } from "@shared/types.d.ts";
import { OrderRepository } from "@shared/domain/order/mod.ts";
import { PaymentRepository } from "@shared/domain/payment/mod.ts";

export const handlePayMongoWebhook = async (
  supabase: SupabaseType,
  rawBody: string,
  signatureHeader: string,
) => {
  // 1️⃣ Auth & integrity
  if (!signatureHeader) {
    throw AppError.badRequest("Missing signature");
  }

  if (!verifySignature(signatureHeader, rawBody)) {
    throw AppError.forbidden("Invalid signature");
  }

  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    throw AppError.badRequest("Invalid JSON payload");
  }
  console.log({ payload });
  const event = payload.data;

  if (!event?.id || !event?.attributes?.type || !event.attributes?.data?.id) {
    throw AppError.badRequest("malformed event data");
  }

  const webhookEventId = event.id;
  const eventType = event.attributes.type; // payment.failed | payment.paid | payment.refunded

  const paymentData = event.attributes.data;
  const paymentId = paymentData.id;
  const paymentIntentId = paymentData.attributes?.payment_intent_id;

  if (!paymentIntentId) {
    throw AppError.badRequest("missing payment_intent_id in payment data");
  }

  console.log({
    webhookEventId,
    eventType,
    paymentId,
    paymentIntentId,
    fullPaymentData: paymentData.attributes,
  });

  const { error: insertEventErr } = await supabase
    .from("webhook_events")
    .insert({
      provider: "paymongo",
      provider_event_id: webhookEventId,
      payload,
    });

  if (insertEventErr) {
    // conflict → event already processed → safe no-op
    if (insertEventErr.code === "23505") {
      return { success: true };
    }

    throw AppError.internal("saving webhook event failed", insertEventErr);
  }

  // (status = ANY (ARRAY['created'::text, 'awaiting_payment'::text, 'confirmed'::text, 'fulfilling'::text, 'fulfilled'::text, 'cancelled'::text]))
  // (status = ANY (ARRAY['pending'::text, 'succeeded'::text, 'failed'::text, 'cancelled'::text, 'refunded'::text]))

  console.log("Payment Intent ID from webhook:", paymentIntentId);
  console.log("Event type:", eventType);

  // Check payment and order existence in db before updating
  const { data: paymentAndOrderData, error: paymentAndOrderErr } =
    await supabase
      .from("payments")
      .select(
        `
    id,
    orders (id)  
  `,
      )
      .eq("payment_intent_id", paymentIntentId)
      .single();

  if (paymentAndOrderErr) {
    throw AppError.internal(
      "Payment and order error",
      paymentAndOrderErr.message,
    );
  }

  if (!paymentAndOrderData) {
    throw AppError.notFound("Payment or order not found");
  }

  // State transitions
  switch (eventType) {
    case "payment.paid": {
      // pending → paid
      const { data: updatedPayment, error: updatePaymentErr } =
        await PaymentRepository.updatePayment(supabase, paymentIntentId, {
          status: "paid",
          payment_id: paymentId,
          paid_at: new Date(
            paymentData.attributes.paid_at * 1000,
          ).toISOString(),
        });

      if (updatePaymentErr) {
        throw AppError.internal(
          "updating payment to failed failed",
          updatePaymentErr.message,
        );
      }

      if (!updatedPayment) {
        throw AppError.conflict(
          "Payment not updated: no pending payment found for payment_intent_id",
        );
      }

      console.log("Payment update result:", updatedPayment);

      const { data: updateOrder, error: updateOrderErr } =
        await OrderRepository.updateOrderStatus(
          supabase,
          updatedPayment.order_id,
          "confirmed",
        );

      if (updateOrderErr) {
        throw AppError.internal(
          "confirming order failed",
          updateOrderErr.message,
        );
      }

      if (!updateOrderErr) {
        throw AppError.internal(
          "Invariant violation: order insert returned no data",
        );
      }
      console.log("Order update result:", updateOrder);

      break;
    }

    case "payment.failed": {
      // pending → failed.
      const updatedFailedPayment = await PaymentRepository.updatePayment(
        supabase,
        paymentIntentId,
        { status: "failed" },
      );

      console.log("Payment update result:", updatedFailedPayment);

      // Order intentionally unchanged:
      // stays awaiting_payment so the user can retry
      break;
    }

    // NOTE: as of this writing I don't know if the site will support refunds so I'm not gonna integrate it for now.

    // case "payment.refunded": {
    //   const { error: paymentErr } = await supabase
    //     .from("payments")
    //     .update({ status: "refunded" })
    //     .eq("payment_intent_id", paymentIntentId)
    //     .neq("status", "refunded");

    // Order status depends on business rules:
    // - digital goods: keep fulfilled
    // - physical goods: maybe cancelled
    // break;
    // }

    default:
      // Unknown events are not errors — just ignored
      console.warn("Unknown PayMongo webhook type:", eventType);
      break;
  }

  console.log("webhook sucess");
  return { success: true };
};
