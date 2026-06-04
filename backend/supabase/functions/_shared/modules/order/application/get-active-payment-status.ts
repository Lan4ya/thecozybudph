import { DrizzleClient } from "@shared/db/client.ts";
import { GetPaymentStatusRes } from "@shared/schemas/index.ts";
import { PaymentRepository } from "@shared/modules/order/payment-repository.ts";
import { AppError } from "@shared/errors/Errors.ts";

export const getActivePaymentStatus = async (
  db: DrizzleClient,
  paymentId: string,
): Promise<GetPaymentStatusRes> => {
  const data = await PaymentRepository.getActiveStatusById(db, paymentId);

  if (!data) {
    throw AppError.notFound({ message: "Payment not found" });
  }

  const { status, expiresAt, orderId } = data;

  if (status === "refunded" || status === "cancelled") {
    // These status should never happen. If it does it means there's a a logic bug in order/payment flow
    throw AppError.internal({
      cause: `Invariant violation: Invalid payment status "${data.status}"`,
    });
  }

  return {
    orderId,
    // Map failed to pending to let the user know they can retry even if Paymongo 3DS fails (this is similar so Shoppee's behavior).
    // Likewise for processing since we're just waiting for Paymongo's webhook so for UX sake we map it too.
    status: status === "processing" || status == "failed" ? "pending" : status,
    expiresAt,
  };
};
