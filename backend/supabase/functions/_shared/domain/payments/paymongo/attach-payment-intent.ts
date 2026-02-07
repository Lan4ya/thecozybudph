import { AppError } from "../../../errors/Errors.ts";
import { AttachPaymentIntentInput } from "../../../types/index.ts";
import { paymongoClient } from "./client.ts";
import { AttachPaymentIntentResponse } from "./types.ts";

export const attachPaymentIntent = async (
  payload: AttachPaymentIntentInput,
): Promise<AttachPaymentIntentResponse["data"]> => {
  try {
    const body = {
      data: {
        attributes: {
          payment_method: payload.paymentMethodId,
          return_url: payload.returnUrl,
        },
      },
    };

    const res = await paymongoClient.post(
      `/payment_intents/${payload.paymentIntentId}/attach`,
      body,
    );

    return res.data.data;
  } catch (err: any) {
    throw AppError.internal(
      `Failed to attach payment intent`,
      err.response?.data || err.message,
    );
  }
};
