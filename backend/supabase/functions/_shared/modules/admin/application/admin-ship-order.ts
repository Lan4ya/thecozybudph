import { toCamelCase } from "drizzle-orm/casing";
import { DrizzleClient } from "../../../db/client.ts";
import { AppError } from "../../../errors/Errors.ts";
import {
  createShippingOrder,
  createShippingQuotation,
} from "../../../integrations/lalamove/mod.ts";
import { ShipOrderInput, orders, OrderStatus } from "../../../schemas/index.ts";
import { OrderRepository } from "../../order/mod.ts";
import { eq } from "drizzle-orm";

export const shipOrder = async (
  db: DrizzleClient,
  orderId: string,
  payload: ShipOrderInput,
) => {
  const order = await db.admin.query.orders.findFirst({
    where: eq(orders.id, orderId),
  });
  if (!order) throw AppError.notFound({ message: "Order not found" });

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

  const status = await OrderRepository.updateStatus(db, {
    orderId,
    status: "to_ship",
    shippingOrderId: shippingOrder.id,
  });

  return {
    orderId: order.id,
    status: toCamelCase(status) as OrderStatus,
  };
};
