import { DrizzleClient } from "../../../db/client.ts";
import { AppError } from "../../../errors/Errors.ts";
import { createShippingOrder } from "../../../integrations/lalamove/create-order.ts";
import { createShippingQuotation } from "../../../integrations/lalamove/create-quotation.ts";
import { AdminShipOrderInput } from "../../../schemas/index.ts";
import { OrderRepository } from "../../order/mod.ts";
import { AdminRepository } from "../admin-repository.ts";

export const shipOrder = async (
  db: DrizzleClient,
  orderId: string,
  payload: AdminShipOrderInput,
) => {
  const order = await OrderRepository.getById(db, orderId);
  if (!order) throw AppError.notFound("Order not found");

  const { remarks, address: recipientFullAddress } = payload.recipient;
  const {
    fullName: recipientFullName,
    phoneNumber: recipientPhone,
    ...recipientAddress
  } = recipientFullAddress;

  const { address: senderFullAddress } = payload.sender;
  const {
    fullName: senderFullName,
    phoneNumber: senderPhone,
    ...senderAddress
  } = senderFullAddress;

  const [quotation] = await createShippingQuotation({
    senderAddress,
    recipientAddress,
    serviceType: payload.serviceType,
  });
  const senderStop = quotation.stops[0];
  const recipientStop = quotation.stops[1];

  const shippingOrder = await createShippingOrder({
    quotationId: quotation.id,
    sender: {
      stopId: senderStop.id!,
      name: senderFullName,
      phone: senderPhone,
    },
    recipients: [
      {
        stopId: recipientStop.id!,
        name: recipientFullName,
        phone: recipientPhone,
        remarks: remarks ?? "",
      },
    ],
    isPODEnabled: true,
    isRecipientSMSEnabled: true,
    // partner?: string | undefined;
    // metadata?: Record<string, unknown> | undefined;
  });

  const status = await AdminRepository.updateStatus(db, {
    orderId,
    status: "to_ship",
    shippingOrderId: shippingOrder.id,
  });

  return {
    orderId: order.id,
    status,
  };
};
