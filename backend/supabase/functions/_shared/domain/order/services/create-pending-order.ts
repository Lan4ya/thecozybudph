import { SupabaseType } from "@shared/types.d.ts";
import { CreateOrderInput } from "@shared/types/index.ts";
import { OrderRepository } from "../order-repository.ts";
import { AddressRepository } from "../../address/address-repository.ts";
import { AppError } from "../../../errors/Errors.ts";

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
    cart_id: payload.cartId,
  };

  const { data: pendingOrder, error: insertOrderErr } =
    await OrderRepository.insertOrder(supabase, orderDBInsert);

  if (insertOrderErr) {
    throw AppError.internal(insertOrderErr.message);
  }

  if (!pendingOrder) {
    throw AppError.internal(
      "Invariant violation: order insert returned no data",
    );
  }

  const orderItemsDBInsert = payload.orderItems.map((item) => ({
    product_id: item.productId,
    name: item.name,
    quantity: item.quantity,
    price_cents: item.priceCents,
    order_id: pendingOrder.id,
  }));

  const { data: insertedOrderItems, error: insertOrderItemsErr } =
    await OrderRepository.insertOrderItems(supabase, orderItemsDBInsert);

  if (insertOrderItemsErr) {
    throw AppError.internal(
      "insertt order failed",
      insertOrderItemsErr.message,
    );
  }

  if (!insertedOrderItems) {
    throw AppError.internal(
      "Invariant violation: order items insert returned no data",
    );
  }

  return { pendingOrder, insertedOrderItems };
};
