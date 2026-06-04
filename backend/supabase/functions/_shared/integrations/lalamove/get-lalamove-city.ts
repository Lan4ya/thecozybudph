import { GetShippingCityInput } from "@shared/schemas/index.ts";
import { AppError } from "../../errors/Errors.ts";
import { MARKET, sdkClient } from "./client.ts";

type GetCityResult = Awaited<ReturnType<typeof sdkClient.City.retrieve>>;

/**
 * Retrieves details about a specific city in the Lalamove market.
 *
 * Provides information on city-level status and supported services.
 *
 * @param payload - Contains the `cityId`.
 * @returns City information including its name and status.
 */
export const getLalamoveCity = async (
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
