import { AppError } from "@shared/errors/Errors.ts";
import {
  CustomerOrderStatus,
  QueryOrdersRes,
} from "@shared/schemas/index.ts";
import { DrizzleClient } from "../../../db/client.ts";
import { OrderRepository } from "../order-repository.ts";

function mapToCustomerStatus(status: string): CustomerOrderStatus {
  switch (status) {
    case "to_pay":
      return "toPay";
    case "paid":
    case "to_ship":
    case "shipped":
      return "toShip";
    case "to_receive":
      return "toReceive";
    case "fulfilled":
      return "fulfilled";
    case "cancelled":
      return "cancelled";
    default:
      throw AppError.internal({
        message: "Internal server error",
        cause: `Invariant violation: Invalid customer order status: ${status}`,
      });
  }
}

export const getOrder = async (
  db: DrizzleClient,
  profileId: string,
  orderId: string,
): Promise<QueryOrdersRes[number]> => {
  const order = await OrderRepository.getOrder(db, orderId);

  if (!order) {
    throw AppError.notFound({ message: "Order not found" });
  }

  if (order.profileId !== profileId) {
    throw AppError.forbidden({ message: "You don't have access to this order" });
  }

  return {
    ...order,
    status: mapToCustomerStatus(order.status),
    items: order.items.map((item) => ({
      ...item,
      orderId: order.id,
    })),
  };
};
