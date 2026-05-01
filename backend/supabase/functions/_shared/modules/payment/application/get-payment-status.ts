import { DrizzleClient } from "../../../db/client.ts";
import { AppError } from "../../../errors/Errors.ts";
import { PaymentRepository } from "../payment-repository.ts";
import { GetPaymentStatusRes } from "@shared/schemas/index.ts";

export const getPaymentStatus = async (
  db: DrizzleClient,
  paymentId: string,
): Promise<GetPaymentStatusRes> => {
  const data = await PaymentRepository.getActiveStatusById(db, paymentId);

  if (!data) {
    throw AppError.notFound("Payment not found");
  }

  return data;
};
