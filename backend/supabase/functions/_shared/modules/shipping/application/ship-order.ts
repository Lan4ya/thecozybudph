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

/**
 * Ships an order using Lalamove.
 *
 * Flow:
 * 1. Validate order exists and is in 'paid' status.
 * 2. Create a Lalamove quotation to get valid stop IDs.
 * 3. Create a Lalamove order using the quotation.
 * 4. Update the local order status to 'to_ship' and store the shipment ID.
 */
export const shipOrder = async (
  db: DrizzleClient,
  orderId: string,
  payload: ShipOrderInput,
) => {
  // 1. Validation
  const order = await db.admin.query.orders.findFirst({
    where: eq(orders.id, orderId),
  });

  if (!order) {
    throw AppError.notFound({ message: "Order not found" });
  }

  // Only paid orders can be shipped
  if (order.status !== "paid") {
    throw AppError.badRequest({
      message: `Cannot ship order with status: ${order.status}. Order must be 'paid'.`,
    });
  }

  // Prevent duplicate shipments
  if (order.shipmentOrderId) {
    throw AppError.badRequest({ message: "Order already has a shipment" });
  }

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

  try {
    // 2. Create Quotation to get valid Stop IDs
    const [quotation] = await createShippingQuotation({
      senderAddress,
      recipientAddress,
      serviceType: payload.serviceType,
    });

    const senderStop = quotation.stops[0];
    const recipientStop = quotation.stops[1];

    if (!senderStop.id || !recipientStop.id) {
      throw AppError.internal({
        message: "Failed to retrieve stop IDs from quotation",
      });
    }

    // 3. Place Order with Lalamove
    const shippingOrder = await createShippingOrder({
      quotationId: quotation.id,
      sender: {
        stopId: senderStop.id,
        name: senderFullName,
        phone: senderPhone,
      },
      recipients: [
        {
          stopId: recipientStop.id,
          name: recipientFullName,
          phone: recipientPhone,
          remarks: remarks ?? "",
        },
      ],
      isPODEnabled: true,
      isRecipientSMSEnabled: true,
    });

    // 4. Update local Order status and store Shipment ID in DB
    const status = await OrderRepository.updateStatus(db, {
      orderId,
      status: "to_ship",
      shippingOrderId: shippingOrder.id,
    });

    return {
      orderId: order.id,
      status: toCamelCase(status) as OrderStatus,
    };
  } catch (error) {
    if (error instanceof AppError) throw error;

    throw new AppError({
      status: 500,
      message:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred during shipping",
      cause: error,
    });
  }
};
