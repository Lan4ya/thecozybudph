import { AppError } from "../../errors/Errors.ts";
import { MARKET, sdkClient } from "./client.ts";

type GetMarketResult = Awaited<ReturnType<typeof sdkClient.Market.retrieve>>;

export const getShippingMarket = async (): Promise<GetMarketResult> => {
  try {
    return await sdkClient.Market.retrieve(MARKET);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed getting shipping market";
    throw new AppError({ status: 500, message: message, cause: error });
  }
};
