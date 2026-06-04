import { AddShippingOrderPriorityFeeInput } from "@shared/schemas/index.ts";
import { AppError } from "../../errors/Errors.ts";
import { MARKET, sdkClient } from "./client.ts";

type AddPriorityFeeResult = Awaited<
  ReturnType<typeof sdkClient.Order.addPriorityFee>
>;

/**
 * Adds a priority fee to an existing Lalamove order.
 *
 * This is used to increase the attractiveness of an order to drivers by offering
 * an additional fee. This can be called multiple times to incrementally increase the fee.
 *
 * @param payload - Contains the `orderId` (Lalamove ID) and the `fee` amount as a numeric string.
 * @returns The updated Lalamove order details.
 */
export const addLalamoveOrderPriorityFee = async (
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
    throw new AppError({ status: 500, message: message, cause: error });
  }
};
