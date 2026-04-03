import {
  CreatePaymentIntentInput,
  CreatePaymentIntentResponse,
  PaymentMethodTypes,
} from "../../../types/index.ts";
import { paymongoClient } from "../client.ts";

// How to calculte pass on fees: https://developers.paymongo.com/docs/pass-on-fee
// Transaction fees: https://developers.paymongo.com/docs/dashboard-navigation-billing
const calculatePassOnFee = (
  originalPriceCents: number,
  fixedFee: number,
  mdr: number,
) => Math.ceil((originalPriceCents + fixedFee) / (1 - mdr));

const BRANKAS_FIXED_CENTS_FEE = 1500; // 15php
const BRANKAS_MDR_RATE = 0.01; // 1% rate
const GCASH_MDR_RATE = 0.02; // 2% rate

const fees = {
  brankas: { mdr: BRANKAS_MDR_RATE, fixed: BRANKAS_FIXED_CENTS_FEE },
  gcash: { mdr: GCASH_MDR_RATE, fixed: 0 },
};

// https://developers.paymongo.com/reference/create-a-paymentintent
export const createPaymentIntent = async (
  payload: CreatePaymentIntentInput,
  idempotencyKey: string,
): Promise<CreatePaymentIntentResponse["data"]> => {
  const sellingPriceCents = calculatePassOnFee(
    payload.amountCents,
    fees[payload.paymentMethodType].fixed,
    fees[payload.paymentMethodType].mdr,
  );

  console.log({ sellingPriceCents });

  const body = {
    data: {
      attributes: {
        amount: sellingPriceCents,
        payment_method_allowed: [
          "brankas",
          "gcash",
        ] as const satisfies PaymentMethodTypes[],
        payment_method_options: {
          card: {
            request_three_d_secure: "any",
          },
        },
        currency: "PHP",
        capture_type: "automatic",
      },
    },
  };

  return await paymongoClient.post("/payment_intents", body, {
    headers: {
      // https://developers.paymongo.com/reference/idempotent-requests
      "Idempotency-Key": idempotencyKey,
    },
  });
};
