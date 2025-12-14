import type { CartItemRow } from "../db/cart.ts";
// import type { SnakeToCamel } from "../utils/snakeToCamelCase.ts";

// REQUEST TYPES:

type AddToCartRequest = Pick<CartItemRow, "product_id" | "quantity">;
export type AddToCartRequestBatch = AddToCartRequest[];
export type DeleteCartItemsRequest = { id: string[] };

// RESPONSE TYPES:
