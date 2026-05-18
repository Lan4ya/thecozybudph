import { DrizzleClient } from "../../../db/client.ts";
import { AppError } from "../../../errors/Errors.ts";
import { cancelShippingOrder } from "../../../integrations/lalamove/cancel-order.ts";
import { OrderRepository } from "../../order/mod.ts";
import { orders } from "../../../schemas/index.ts";
import { eq } from "drizzle-orm";

// About shipping order status:
//
// ASSIGNING_DRIVER → ON_GOING → PICKED_UP → COMPLETED
// (Other possible end/states: CANCELED, REJECTED, EXPIRED)
//
// Cancelable window (Lalamove policy):
//
//  1. While status is ASSIGNING_DRIVER, or
//  2. Within < 5 minutes after it transitions to ON_GOING (matched to driver), regardless of scheduleAt.
//
// Outside that, cancel API returns forbidden (e.g. ERR_CANCELLATION_FORBIDDEN, documented as 409).

export const cancelShipmentOrder = async (
  db: DrizzleClient,
  orderId: string,
) => {
  const order = await db.admin.query.orders.findFirst({
    where: eq(orders.id, orderId),
  });

  if (!order) throw AppError.notFound("Order not found");

  if (order.status !== "to_ship") {
    throw AppError.conflict("Order is not awaiting shipment");
  }

  if (!order.shipmentOrderId) {
    throw AppError.conflict("No shipment exists");
  }

  await cancelShippingOrder(order.shipmentOrderId);

  // regress status: to_pay -> paid
  const status = await OrderRepository.updateStatus(db, {
    orderId: order.id,
    status: "to_pay",
  });

  return {
    orderId: order.id,
    status,
    shipmentStatus: "cancelled",
  };
};
