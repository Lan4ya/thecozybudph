import { AppError } from "@shared/errors/Errors.ts";
import {
  CustomerOrderStatus,
  DBOrderStatus,
  QueryOrdersRes,
} from "@shared/schemas/index.ts";
import { QueryOrdersInput } from "@shared/schemas/types/api/order.ts";
import { toSnakeCase } from "drizzle-orm/casing";
import { DrizzleClient } from "../../../db/client.ts";
import { OrderRepository } from "../order-repository.ts";

function mapToCustomerStatus(status: string): CustomerOrderStatus {
  switch (status) {
    case "to_pay":
      return "toPay";

    // since this is for customers view, we won't show full details.
    // so we compress all these 3 statuses into 'toShip'.
    case "paid":
      return "toShip";
    case "to_ship":
      return "toShip";
    case "shipped":
      return "toShip";

    case "to_receive":
      return "toReceive";

    case "fulfilled":
      return "fulfilled";

    case "cancelled":
      return "cancelled";

    default:
      throw AppError.internal(
        "Internal server error",
        `Invariant violation: Invalid customer order status: ${status}`,
      );
  }
}

export const queryOrders = async (
  db: DrizzleClient,
  profileId: string,
  query: QueryOrdersInput,
): Promise<QueryOrdersRes> => {
  const { status, ...rest } = query;

  const dbStatus = toSnakeCase(status) as DBOrderStatus;

  const orders = await OrderRepository.queryOrders(db, profileId, {
    status: dbStatus,
    ...rest,
  });

  console.log({ orders });

  return orders.map((order) => ({
    ...order,
    status: mapToCustomerStatus(order.status),
  }));
};
