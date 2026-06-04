import Lalamove from "@lalamove/lalamove-js";
import { EditShippingOrderInput } from "@shared/schemas/index.ts";
import { AppError } from "../../errors/Errors.ts";
import { MARKET, sdkClient } from "./client.ts";

type EditOrderResult = Awaited<ReturnType<typeof sdkClient.Order.edit>>;

/**
 * Updates the stops or contact details of an existing Lalamove order.
 *
 * This can be used to correct an address or update recipient phone numbers
 * after the order has been placed but before it is completed.
 *
 * @param payload - Contains the `orderId` and the updated `stops`.
 * @returns The updated Lalamove order details.
 */
export const editLalamoveOrder = async (
  payload: EditShippingOrderInput,
): Promise<EditOrderResult> => {
  try {
    const patchOrderPayload =
      Lalamove.PatchOrderPayloadBuilder.patchOrderPayload()
        .withStops(payload.stops)
        .build();

    return await sdkClient.Order.edit(
      MARKET,
      payload.orderId,
      patchOrderPayload,
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed editing shipping order";
    throw new AppError({ status: 500, message: message, cause: error });
  }
};
