import { AppError } from "../../errors/Errors.ts";
import { MARKET, sdkClient } from "./client.ts";

type GetOrderResult = Awaited<ReturnType<typeof sdkClient.Order.retrieve>>;

/**
 * Retrieves the current details and status of a Lalamove delivery order.
 *
 * This is the primary way to track an order's progress (e.g., ASSIGNING_DRIVER,
 * PICKED_UP, COMPLETED) and to get the shareable tracking link.
 *
 * @param id - The unique Lalamove Order ID.
 * @returns Comprehensive order details including price, status, driver info, and stops.
 */
export const getLalamoveOrder = async (id: string): Promise<GetOrderResult> => {
  try {
    return await sdkClient.Order.retrieve(MARKET, id);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed getting shipping order";
    throw new AppError({ status: 500, message: message, cause: error });
  }
};
