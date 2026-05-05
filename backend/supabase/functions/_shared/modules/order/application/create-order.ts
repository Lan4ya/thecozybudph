import { DrizzleClient } from "../../../db/client.ts";
import { AppError } from "../../../errors/Errors.ts";
import { getShippingQuotation } from "@shared/integrations/lalamove/get-quotation.ts";
import {
  cartItems,
  CreateOrderInput,
  CreateOrderRes,
  orderAddressesSnapshot,
  orderItemsSnapshots,
  orders,
  InsertOrder,
  payments,
} from "@shared/schemas/index.ts";
import { AddressRepository } from "../../address/address-repository.ts";
import { OrderRepository } from "../mod.ts";
import { calculatePassOnFee } from "../../../integrations/paymongo/calculate-pass-on-fee.ts";
import { CartRepository } from "../../cart/cart-repository.ts";
import { and, eq, inArray } from "drizzle-orm";

export const createOrder = async (
  db: DrizzleClient,
  profileId: string,
  payload: CreateOrderInput,
): Promise<CreateOrderRes> => {
  const address = await AddressRepository.getById(db, payload.addressId);

  if (!address) throw AppError.notFound("Addresss not found");

  const { id: _id, ...orderAddress } = address;

  const variantIds = payload.items
    .map((item) => item.variantId)
    .filter(Boolean);

  console.log({ variantIds });

  const existingVariants = await OrderRepository.getDetailsByVariantIds(
    db,
    variantIds,
  );

  // console.log({ existingVariants });

  const variantMap = new Map(
    existingVariants.map(({ id, ...rest }) => [id, { variantId: id, ...rest }]),
  );

  const missingIds = variantIds.filter((id) => !variantMap.has(id));
  if (missingIds.length) {
    throw AppError.badRequest(
      `The following product variant ids are not available: ${missingIds.join(", ")}`,
    );
  }

  // Merge order item details from DB with payload details
  const orderItems = payload.items.map((item) => {
    const variant = variantMap.get(item.variantId);

    if (!variant) {
      throw AppError.badRequest(`Variant not found: ${item.variantId}`);
    }

    return {
      ...variant,
      quantity: item.quantity,
      cardMessages: item.cardMessages,
    };
  });

  // Calculate prices
  const subtotalCents = orderItems.reduce(
    (sum, item) => sum + item.priceCents * item.quantity,
    0,
  );
  const shippingQuote = await getShippingQuotation(payload.shippingQuoteId);
  const shippingCents = Math.round(
    Number(shippingQuote.priceBreakdown.total) * 100,
  );
  const discountCents = 0;
  const totalPriceCents = subtotalCents + shippingCents - discountCents;
  const passOnFee = calculatePassOnFee(
    totalPriceCents,
    payload.paymentMethodType,
  );
  const sellingPriceCents = totalPriceCents + passOnFee;

  const now = new Date();

  const order = {
    profileId,
    subtotalCents,
    shippingCents,
    passOnFee,
    totalCents: sellingPriceCents,
    discountCents,
    status: "to_pay",
    source: payload.source,
    serviceType: payload.serviceType,
    expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
  } satisfies InsertOrder;

  return db.rls(async (tx) => {
    // Insert order
    const [pendingOrder] = await tx
      .insert(orders)
      .values(order)
      .returning({ id: orders.id });

    // Insert order items snapshot
    await tx
      .insert(orderItemsSnapshots)
      .values(
        orderItems.map((item) => ({
          ...item,
          orderId: pendingOrder.id,
        })),
      )
      .returning();

    // Insert order address snapshot
    await tx
      .insert(orderAddressesSnapshot)
      .values({ ...orderAddress, orderId: pendingOrder.id })
      .returning();

    // Delete the item(s) from user cart if the order came from cart and not directly from shop
    if (order.source === "cart") {
      const cart = await CartRepository.getCartByProfileId(db, order.profileId);

      const variantIds = orderItems.reduce<string[]>((acc, item) => {
        const id = item.variantId;
        if (id) acc.push(id);
        return acc;
      }, []);

      await tx
        .delete(cartItems)
        .where(
          and(
            eq(cartItems.cartId, cart.id),
            inArray(cartItems.productVariantId, variantIds),
          ),
        );
    }

    // Insert payment
    const [payment] = await tx
      .insert(payments)
      .values({
        orderId: pendingOrder.id,
        profileId,
        currency: "PHP",
        status: "pending",
        isActive: true,
      })
      .returning({ id: payments.id });

    return { orderId: pendingOrder.id, paymentId: payment.id };
  });
};
