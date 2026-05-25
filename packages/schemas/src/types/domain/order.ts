import z from "zod";
import {
  customerOrderStatusSchema,
  orderSourceSchema,
  orderStatusSchema,
} from "../../zod/api/order.ts";

export type OrderSource = z.infer<typeof orderSourceSchema>;
export type OrderStatus = z.infer<typeof orderStatusSchema>;

export type CustomerOrderStatus = z.infer<typeof customerOrderStatusSchema>;

export type CustomerOrder = {
  id: string;
  profileId: string;
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  createdAt: Date;
  updatedAt: Date;
  status: CustomerOrderStatus;
  discountCents: number;
};

export type CustomerOrderItem = {
  orderId: string;
  id: string;
  productId: string | null;
  productVariantId: string | null;
  quantity: number;
  cardMessages: string[];
  name: string;
  collection: string | null;
  category: string;
  primaryImageUrl: string;
  variantAttributes: Record<string, string>;
  priceCents: number;
};
