import { ProductOption, ProductVariant } from "./product.ts";

export type CartItem = {
  id: string;
  quantity: number;
  cardMessages: string[];
  isAvailable: boolean; // false is product or variant is deleted
  product: {
    id: string | null;
    options: ProductOption[];
    name: string;
    primaryImageUrl: string;
    variant: ProductVariant;
  } | null;
  // createdAt: Date;
};

export type Cart = {
  items: CartItem[];
};
