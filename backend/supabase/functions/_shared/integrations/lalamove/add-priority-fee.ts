import { AddShippingOrderPriorityFeeInput } from "@shared/schemas/index.ts";
import { AppError } from "../../errors/Errors.ts";
import { MARKET, sdkClient } from "./client.ts";

type AddPriorityFeeResult = Awaited<
  ReturnType<typeof sdkClient.Order.addPriorityFee>
>;

export const addShippingOrderPriorityFee = async (
  payload: AddShippingOrderPriorityFeeInput,
): Promise<AddPriorityFeeResult> => {
  try {
    return await sdkClient.Order.addPriorityFee(
      MARKET,
      payload.orderId,
      payload.fee,
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed adding shipping order priority fee";
    throw new AppError(500, message, error);
  }
};
