import { AppError } from "@shared/errors/Errors.ts";
import { GetOrderItemRes } from "@shared/schemas/index.ts";
import { DrizzleClient } from "../../../db/client.ts";
import { OrderRepository } from "../order-repository.ts";
import { toCustomerStatus } from "@shared/modules/order/to-order-status.ts";

export const getOrderItem = async (
  db: DrizzleClient,
  orderId: string,
  profileId: string,
): Promise<GetOrderItemRes> => {
  const order = await OrderRepository.getOrderItem(db, orderId, profileId);

  if (!order) {
    throw AppError.notFound({ message: "Order not found" });
  }

  return {
    ...order,
    status: toCustomerStatus(order.status),
  };
};
