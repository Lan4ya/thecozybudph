import { DrizzleClient } from "@shared/db/client.ts";
import { AppError } from "@shared/errors/Errors.ts";
import { OrderRepository } from "@shared/modules/order/order-repository.ts";
import { toCustomerStatus } from "@shared/modules/order/to-order-status.ts";
import { GetOrderStatusRes } from "@shared/schemas/index.ts";

export const getOrderStatus = async (
  db: DrizzleClient,
  orderId: string,
): Promise<GetOrderStatusRes> => {
  const data = await OrderRepository.getOrderStatus(db, orderId);

  if (!data) {
    throw AppError.notFound({ message: "Order not found" });
  }

  return {
    status: toCustomerStatus(data.status),
  };
};
