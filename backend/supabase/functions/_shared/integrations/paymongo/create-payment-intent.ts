import {
  CreatePaymentIntentInput,
  CreatePaymentIntentResponse,
  PaymentMethodTypes,
} from "@shared/package-types/index.ts";
import { paymongoClient } from "./client.ts";

// https://developers.paymongo.com/reference/create-a-paymentintent
export const createPaymentIntent = async (
  payload: CreatePaymentIntentInput,
  idempotencyKey: string,
): Promise<CreatePaymentIntentResponse["data"]> => {
  const body = {
    data: {
      attributes: {
        amount: payload.amountCents,
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
