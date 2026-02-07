import { SupabaseType } from "@shared/types.d.ts";
import type { CreatePaymentInput } from "@shared/types/schema/payment.ts";
import { createPaymentIntent, createPaymentMethod } from "../paymongo/mod.ts";
import { attachPaymentIntent } from "../paymongo/attach-payment-intent.ts";
import { isDev } from "../../../utils/isDev.ts";
import { PaymentRepository } from "../mod.ts";

export const createPendingPayment = async (
  supabase: SupabaseType,
  payload: CreatePaymentInput,
) => {
  const { paymentIntent, paymentMethod } = payload;

  const createdPaymentIntentData = await createPaymentIntent(paymentIntent);
  const createdPaymentMethodData = await createPaymentMethod(paymentMethod);

  const paymentIntentInput = {
    paymentIntentId: createdPaymentIntentData.id,
    paymentMethodId: createdPaymentMethodData.id,
    returnUrl: isDev ? "http://localhost:5173" : "https://thecozybudph.com",
  };

  const attachedPaymentMethodData =
    await attachPaymentIntent(paymentIntentInput);

  const redirectUrls =
    attachedPaymentMethodData.attributes.next_action.redirect;

  const paymentDBInsert = {
    order_id: payload.orderId,
    payment_intent_id: createdPaymentIntentData.id,
    payment_id: null, // as of this stage in the payment flow, the customer haven't paid yet so there's no payment_id
    amount_cents: createdPaymentIntentData.attributes.amount,
    method: createdPaymentMethodData.attributes.type,
    status: "pending", // default
    currency: "PHP",
  };

  const pendingPayment = await PaymentRepository.insertPayment(
    supabase,
    paymentDBInsert,
  );

  return { pendingPayment, redirectUrls };
};
