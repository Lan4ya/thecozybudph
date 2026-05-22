import { GetShippingCityInput } from "@shared/schemas/index.ts";
import { AppError } from "../../errors/Errors.ts";
import { MARKET, sdkClient } from "./client.ts";

type GetCityResult = Awaited<ReturnType<typeof sdkClient.City.retrieve>>;

export const getShippingCity = async (
  payload: GetShippingCityInput,
): Promise<GetCityResult> => {
  try {
    return await sdkClient.City.retrieve(MARKET, payload.cityId);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed getting shipping city";
    throw new AppError({ status: 500, message: message, cause: error });
  }
};
