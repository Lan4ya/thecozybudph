import { AppError } from "@shared/errors/Errors.ts";
import { GetOrderWithItemsRes } from "@shared/schemas/index.ts";
import { DrizzleClient } from "../../../db/client.ts";
import { OrderRepository } from "../order-repository.ts";
import { toCustomerStatus } from "@shared/modules/order/to-order-status.ts";

export const getOrderItem = async (
  db: DrizzleClient,
  orderId: string,
  profileId: string,
): Promise<GetOrderWithItemsRes> => {
  const order = await OrderRepository.getOrderWithItems(db, orderId, profileId);

  if (!order) {
    throw AppError.notFound({ message: "Order not found" });
  }

  return {
    ...order,
    status: toCustomerStatus(order.status),
    address: order.address,
    items: order.items,
  };
};
