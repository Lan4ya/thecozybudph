import Lalamove from "@lalamove/lalamove-js";
import { CreateShippingOrderInput } from "@shared/schemas/index.ts";
import { AppError } from "../../errors/Errors.ts";
import { MARKET, sdkClient } from "./client.ts";

type CreateOrderResult = Awaited<ReturnType<typeof sdkClient.Order.create>>;

export const createShippingOrder = async (
  payload: CreateShippingOrderInput,
): Promise<CreateOrderResult> => {
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
    throw new AppError(500, message, error);
  }
};
