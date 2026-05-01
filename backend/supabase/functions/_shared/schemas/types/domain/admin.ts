import { OrderStatus } from "./order.ts";

export type AdminOrderItem = {
  orderId: string;
  name: string;
  image: string | null;
  attributes: unknown;
  quantity: number;
  cardMessages: string[];
  priceCents: number;
  category: string | null;
  collection: string | null;
};

export type AdminOrderAddress = {
  name: string;
  phone: string;
  postalCode: string;
  region: string;
  province: string | null;
  city: string;
  barangay: string;
  addressLine: string;
};

export type AdminOrderListItem = {
  id: string;
  profileId: string;
  status: OrderStatus;

  subtotalCents: number;
  discountCents: number;
  shippingCents: number;
  totalCents: number;

  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;

  items: AdminOrderItem[];
  address: AdminOrderAddress;
};
