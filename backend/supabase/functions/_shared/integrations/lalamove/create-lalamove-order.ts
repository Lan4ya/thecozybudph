import Lalamove from "@lalamove/lalamove-js";
import { CreateShippingOrderInput } from "@shared/schemas/index.ts";
import { AppError } from "../../errors/Errors.ts";
import { MARKET, sdkClient } from "./client.ts";

type CreateLalamoveOrderResult = Awaited<
  ReturnType<typeof sdkClient.Order.create>
>;

/**
 * Docs: https://developers.lalamove.com/#place-order
 *
 * Finalizes and places a delivery order with Lalamove.
 *
 * This requires a valid `quotationId` obtained previously. Placing an order
 * initiates the driver matching process.
 *
 * @param payload - Includes `quotationId`, sender details, and recipient details.
 *                  Optional flags like `isPODEnabled` (Proof of Delivery) can also be set.
 * @returns The created Lalamove order details, including the `id` and current status.
 */
export const createLalamoveOrder = async (
  payload: CreateShippingOrderInput,
): Promise<CreateLalamoveOrderResult> => {
  try {
    const orderPayloadBuilder = Lalamove.OrderPayloadBuilder.orderPayload()
      .withQuotationID(payload.quotationId)
      .withSender(payload.sender)
      .withRecipients(payload.recipients);

    if (payload.isPODEnabled !== undefined) {
      orderPayloadBuilder.withIsPODEnabled(payload.isPODEnabled);
    }

    if (payload.isRecipientSMSEnabled !== undefined) {
      orderPayloadBuilder.withIsRecipientSmsEnabled(
        payload.isRecipientSMSEnabled,
      );
    }

    if (payload.partner) {
      orderPayloadBuilder.withPartner(payload.partner);
    }

    if (payload.metadata) {
      orderPayloadBuilder.withMetadata(payload.metadata);
    }

    const orderPayload = orderPayloadBuilder.build();

    return await sdkClient.Order.create(MARKET, orderPayload);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed creating shipping order";
    throw new AppError({ status: 500, message: message, cause: error });
  }
};
