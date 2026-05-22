import { AppError } from "../../errors/Errors.ts";
import { MARKET, sdkClient } from "./client.ts";

type GetOrderResult = Awaited<ReturnType<typeof sdkClient.Order.retrieve>>;

export const getShippingOrder = async (id: string): Promise<GetOrderResult> => {
  try {
    return await sdkClient.Order.retrieve(MARKET, id);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed getting shipping order";
    throw new AppError({ status: 500, message: message, cause: error });
  }
};
