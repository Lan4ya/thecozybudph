import { AppError } from "../../errors/Errors.ts";
import { MARKET, sdkClient } from "./client.ts";

type CancelOrderResult = Awaited<ReturnType<typeof sdkClient.Order.cancel>>;

/**
 * Cancels an active Lalamove order.
 *
 * About shipping order status:
 *
 * ASSIGNING_DRIVER →  ON_GOING
 *
 * Cancelable window (Lalamove policy):
 *  1. While status is ASSIGNING_DRIVER, or
 *  2. Within < 5 minutes after it transitions to ON_GOING (matched to driver), regardless of scheduleAt.
 *
 * Outside that, cancel API returns forbidden (ERR_CANCELLATION_FORBIDDEN, 409).
 * https://developers.lalamove.com/#cancel-order
 *
 * @param shippingOrderId - The unique Lalamove Order ID.
 * @returns boolean.
 */
export const cancelLalamoveOrder = async (
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
