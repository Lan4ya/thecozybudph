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
    throw AppError.notFound({ message: "Payment not found" });
  }

  if (
    data.status === "paid" ||
    data.status === "pending" ||
    data.status === "failed"
  ) {
    return {
      status: data.status,
      expiresAt: data.expiresAt,
    };
  }

  // These status should never happen. If it does it means there's a a logic bug in order/payment flow
  throw AppError.internal({
    message: `Invariant violation: Invalid payment status "${data.status}"`,
  });
};
