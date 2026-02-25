import { ProductVariant } from "./product.ts";

export type CartItem = {
  productId: string;
  quantity: number;
  productVariant: ProductVariant;
  cardMessages: string[];
};

export type Cart = {
  items: CartItem[];
};

export type CartItemsDeletionResult = {
  deletedProductIds: string[];
};
