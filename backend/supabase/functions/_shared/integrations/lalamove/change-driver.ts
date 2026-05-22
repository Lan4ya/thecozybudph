import { ChangeShippingDriverInput } from "@shared/schemas/index.ts";
import { AppError } from "../../errors/Errors.ts";
import { MARKET, sdkClient } from "./client.ts";

type ChangeDriverResult = Awaited<ReturnType<typeof sdkClient.Driver.cancel>>;

export const changeShippingDriver = async (
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
      error instanceof Error ? error.message : "Failed changing shipping driver";
    throw new AppError({ status: 500, message: message, cause: error });
  }
};
