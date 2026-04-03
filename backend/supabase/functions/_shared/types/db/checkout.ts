import { ProductVariant } from "../domain/product.ts";
import { SnakeToCamel } from "../utils/snakeToCamelCase.ts";
import { OrderAddressSnapshots, OrderItemsRow, OrdersRow } from "./order.ts";
import { PaymentsRow } from "./payment.ts";

export type CreatePendingCheckoutDBInput = {
  order: SnakeToCamel<Omit<OrdersRow, "id" | "created_at" | "updated_at">>;
  items: SnakeToCamel<
    Omit<OrderItemsRow, "id" | "variant_attributes" | "order_id">
  > &
    {
      variantAttributes: ProductVariant["attributes"];
    }[];
  address: SnakeToCamel<Omit<OrderAddressSnapshots, "order_id">>;
  payment: Omit<PaymentsRow, "id" | "created_at" | "updated_at" | "order_id">;
};
