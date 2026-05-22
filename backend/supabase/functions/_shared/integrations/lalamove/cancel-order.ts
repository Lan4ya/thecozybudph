import { AppError } from "../../errors/Errors.ts";
import { MARKET, sdkClient } from "./client.ts";

type CancelOrderResult = Awaited<ReturnType<typeof sdkClient.Order.cancel>>;

export const cancelShippingOrder = async (
  shippingOrderId: string,
): Promise<CancelOrderResult> => {
  try {
    return await sdkClient.Order.cancel(MARKET, shippingOrderId);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed cancelling shipping order";
    throw new AppError({ status: 500, message: message, cause: error });
  }
};
