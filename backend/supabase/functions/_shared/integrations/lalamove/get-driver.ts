import { GetShippingDriverInput } from "@shared/schemas/index.ts";
import { AppError } from "../../errors/Errors.ts";
import { MARKET, sdkClient } from "./client.ts";

type GetDriverResult = Awaited<ReturnType<typeof sdkClient.Driver.retrieve>>;

export const getShippingDriver = async (
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
    throw new AppError(500, message, error);
  }
};
