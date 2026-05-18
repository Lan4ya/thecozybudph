import { DrizzleClient } from "@shared/db/client.ts";
import { GetPaymentStatusRes } from "@shared/schemas/index.ts";
import { PaymentRepository } from "@shared/modules/order/payment-repository.ts";
import { AppError } from "@shared/errors/Errors.ts";

export const getOrderPaymentStatus = async (
  db: DrizzleClient,
  paymentId: string,
): Promise<GetPaymentStatusRes> => {
  const data = await PaymentRepository.getActiveStatusById(db, paymentId);

  if (!data) {
    throw AppError.notFound("Payment not found");
  }

  return data;
};
