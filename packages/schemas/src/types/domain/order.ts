import z from "zod";
// import { createInsertSchema, createSelectSchema } from "drizzle-zod";
// import { orders } from "../../drizzle/orders.ts";
import { orderSourceSchema, orderStatusSchema } from "../../zod/order.ts";

// export const insertOrderSchema = createInsertSchema(orders);
// export const selectOrderSchema = createSelectSchema(orders);
// export type OrderDBA = z.infer<typeof selectOrderSchema>;
// export type OrderDB = z.infer<typeof insertOrderSchema>;
export type OrderStatus = z.infer<typeof orderStatusSchema>;
export type OrderSource = z.infer<typeof orderSourceSchema>;

export type Order = {
  id: string;
  profileId: string;
  source: OrderSource;
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
