import { CreatePaymentMethodInput } from "../../../types/index.ts";
import { paymongoClient } from "./client.ts";
import { AppError } from "../../../errors/Errors.ts";
import { CreatePaymentMethodResponse } from "./types.ts";

export const createPaymentMethod = async (
  payload: CreatePaymentMethodInput,
): Promise<CreatePaymentMethodResponse["data"]> => {
  // https://developers.paymongo.com/reference/idempotent-requests
  const idempotencyKey = crypto.randomUUID();

  try {
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

    const res = await paymongoClient.post("/payment_methods", body, {
      headers: {
        "Idempotency-Key": idempotencyKey,
      },
    });
    return res.data.data;
  } catch (err: any) {
    throw AppError.internal(
      `Failed to create payment method`,
      err.response?.data || err.message,
    );
  }
};
