import { OrderItemsRow, OrdersRow } from "../db/order.ts";
import { SnakeToCamel } from "../utils/snakeToCamelCase.ts";

export type Order = SnakeToCamel<OrdersRow>;
export type OrderItems = SnakeToCamel<OrderItemsRow>;
