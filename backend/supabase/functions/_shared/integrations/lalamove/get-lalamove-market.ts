import { AppError } from "../../errors/Errors.ts";
import { MARKET, sdkClient } from "./client.ts";

type GetMarketResult = Awaited<ReturnType<typeof sdkClient.Market.retrieve>>;

/**
 * Retrieves details about the entire Lalamove market (e.g., PH).
 *
 * Provides a list of all cities supported within the market and their statuses.
 *
 * @returns Market information including the list of supported cities.
 */
export const getLalamoveMarket = async (): Promise<GetMarketResult> => {
  try {
    return await sdkClient.Market.retrieve(MARKET);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed getting shipping market";
    throw new AppError({ status: 500, message: message, cause: error });
  }
};
