import z from "zod";
import { orderStatusSchema } from "../../zod/index.ts";

export type OrderStatus = z.infer<typeof orderStatusSchema>;

export type Order = {
  id: string;
  profileId: string;
  source: string;
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  createdAt: Date;
  updatedAt: Date;
  status: OrderStatus;
  discountCents: number;
};

export type OrderItem = {
  id: string;
  cardMessages: string[];
  quantity: number;
  category: string;
  collection: string | null;
  name: string;
  orderId: string;
  priceCents: number;
  primaryImageUrl: string;
  productId: string | null;
  productVariantId: string | null;
  variantAttributes: Record<string, string>;
};
