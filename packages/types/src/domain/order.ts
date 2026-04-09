import { OrdersRow } from "../db/order.ts";
import { SnakeToCamel } from "../utils/snakeToCamelCase.ts";

export type Order = SnakeToCamel<OrdersRow>;
export type OrderItem = {
  cardMessages: string[];
  quantity: number;
  category: string;
  collection: string | null;
  id: string;
  name: string;
  orderId: string;
  priceCents: number;
  primaryImageUrl: string;
  productId: string | null;
  productVariantId: string | null;
  variantAttributes: Record<string, string>;
};
