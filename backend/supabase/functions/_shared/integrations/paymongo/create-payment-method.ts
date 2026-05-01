import {
  PaymentMethodInput,
  CreatePaymentMethodResponse,
} from "@shared/schemas/index.ts";
import { paymongoClient } from "./client.ts";

// https://developers.paymongo.com/reference/create-a-paymentmethod
export const createPaymentMethod = async (
  payload: PaymentMethodInput,
  idempotencyKey: string,
): Promise<CreatePaymentMethodResponse["data"]> => {
  const body = {
    data: {
      attributes: {
        billing: {
          name: payload.billing.name,
          email: payload.billing.email,
        },
        type: payload.type,
      },
    },
  };

  return await paymongoClient.post("/payment_methods", body, {
    headers: {
      // https://developers.paymongo.com/reference/idempotent-requests
      "Idempotency-Key": idempotencyKey,
    },
  });
};
