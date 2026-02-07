import { AppError } from "../../../errors/Errors.ts";
import { paymongoClient } from "./client.ts";
import { CreatePaymentIntentInput } from "../../../types/index.ts";
import { CreatePaymentIntentResponse } from "./types.ts";

export const createPaymentIntent = async (
  payload: CreatePaymentIntentInput,
): Promise<CreatePaymentIntentResponse["data"]> => {
  // https://developers.paymongo.com/reference/idempotent-requests
  const idempotencyKey = crypto.randomUUID();

  try {
    const body = {
      data: {
        attributes: {
          amount: payload.amountCents,
          payment_method_allowed: ["qrph", "card", "gcash"],
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

    const res = await paymongoClient.post("/payment_intents", body, {
      headers: {
        "Idempotency-Key": idempotencyKey,
      },
    });

    return res.data.data;
  } catch (err: any) {
    throw AppError.internal(
      `Failed to create payment intent`,
      err.response?.data || err.message,
    );
  }
};
