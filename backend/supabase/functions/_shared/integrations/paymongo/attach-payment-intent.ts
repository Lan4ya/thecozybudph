import {
  AttachPaymentIntentInput,
  AttachPaymentIntentResponse,
} from "@shared/package-types/index.ts";
import { paymongoClient } from "./client.ts";

// https://developers.paymongo.com/reference/attach-to-paymentintent
export const attachPaymentIntent = async (
  payload: AttachPaymentIntentInput,
): Promise<AttachPaymentIntentResponse["data"]> => {
  const body = {
    data: {
      attributes: {
        payment_method: payload.paymentMethodId,
        return_url: payload.returnUrl,
      },
    },
  };

  return await paymongoClient.post(
    `/payment_intents/${payload.paymentIntentId}/attach`,
    body,
  );
};
