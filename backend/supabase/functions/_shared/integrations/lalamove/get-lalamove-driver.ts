import { GetShippingDriverInput } from "@shared/schemas/index.ts";
import { AppError } from "../../errors/Errors.ts";
import { MARKET, sdkClient } from "./client.ts";

type GetDriverResult = Awaited<ReturnType<typeof sdkClient.Driver.retrieve>>;

/**
 * Retrieves information about the driver assigned to a Lalamove order.
 *
 * This includes the driver's name, phone number, vehicle plate number, and
 * real-time coordinates.
 *
 * @param payload - Contains `driverId` and the associated `orderId`.
 * @returns Driver details and vehicle information.
 */
export const getLalamoveDriver = async (
  payload: GetShippingDriverInput,
): Promise<GetDriverResult> => {
  try {
    return await sdkClient.Driver.retrieve(
      MARKET,
      payload.driverId,
      payload.orderId,
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed getting shipping driver";
    throw new AppError({ status: 500, message: message, cause: error });
  }
};
