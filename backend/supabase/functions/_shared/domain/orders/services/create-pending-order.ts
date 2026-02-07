import { SupabaseType } from "@shared/types.d.ts";
import { CreateOrderInput } from "@shared/types/index.ts";
import { OrderRepository } from "../order-repository.ts";
import { AddressRepository } from "../../address/address-repository.ts";

export const createPendingOrder = async (
  supabase: SupabaseType,
  payload: CreateOrderInput,
  profileId: string,
) => {
  const verifiedAddress = await AddressRepository.assertAddressOwnership(
    supabase,
    profileId,
    payload.addressId,
  );

  const orderDBInsert = {
    address_id: verifiedAddress.id,
    profile_id: profileId,
    status: "awaiting_payment", // default value
    subtotal_cents: payload.subtotalCents,
    shipping_cents: payload.shippingCents,
    discount_cents: payload.discountCents,
    total_cents: payload.totalCents,
  };

  const pendingOrder = await OrderRepository.insertOrder(
    supabase,
    orderDBInsert,
  );

  const orderItemsDBInsert = payload.orderItems.map((item) => ({
    product_id: item.productId,
    name: item.name,
    quantity: item.quantity,
    price_cents: item.priceCents,
    order_id: pendingOrder.id,
  }));

  const orderItems = await OrderRepository.insertOrderItems(
    supabase,
    orderItemsDBInsert,
  );

  return { pendingOrder, orderItems };
};
