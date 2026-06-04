import { ChangeShippingDriverInput } from "@shared/schemas/index.ts";
import { AppError } from "../../errors/Errors.ts";
import { MARKET, sdkClient } from "./client.ts";

type ChangeDriverResult = Awaited<ReturnType<typeof sdkClient.Driver.cancel>>;

/**
 * Requests a change of driver for an assigned Lalamove order.
 *
 * This technically cancels the current driver assignment and puts the order back
 * into the "matching" state to find a new driver. This is typically used if a driver
 * is unresponsive or unable to fulfill the request.
 *
 * @param payload - Contains `driverId`, `orderId`, and a mandatory `reason` for the change.
 * @returns A boolean indicating if the driver cancellation was successful.
 */
export const changeLalamoveDriver = async (
  payload: ChangeShippingDriverInput,
): Promise<ChangeDriverResult> => {
  try {
    return await sdkClient.Driver.cancel(
      MARKET,
      payload.driverId,
      payload.orderId,
      payload.reason,
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed changing shipping driver";
    throw new AppError({ status: 500, message: message, cause: error });
  }
};
