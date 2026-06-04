import { DrizzleClient } from "@shared/db/client.ts";
import { AppError } from "@shared/errors/Errors.ts";
import {
  cartItems,
  carts,
  CreateOrderRes,
  InsertOrder,
  orderAddressesSnapshot,
  orderItemsSnapshots,
  orders,
  payments,
} from "@shared/schemas/index.ts";
import { and, eq, inArray } from "drizzle-orm";
import {
  PreparedOrderAddress,
  PreparedOrderItem,
} from "./_create-order-prep.ts";
import { Geoapify } from "@shared/integrations/geoapify/mod.ts";

/**
 * Persists the prepared order data to the database within a single transaction.
 *
 * This ensures that we don't end up with partial data (e.g., an order without items).
 * The process includes:
 * 1. Inserting the main `orders` record.
 * 2. Creating snapshots of items and addresses to freeze the order state.
 * 3. Clearing the user's cart if the order originated from it.
 * 4. Initializing a `payments` record for the payment gateway to track.
 *
 * @returns The new order and payment IDs.
 */
export const persistCreateOrderTransaction = async (
  db: DrizzleClient,
  params: {
    profileId: string;
    order: InsertOrder;
    orderAddress: PreparedOrderAddress;
    orderItems: PreparedOrderItem[];
    snapshotUrlByHash: Map<string, string>;
  },
): Promise<CreateOrderRes> => {
  const { order, orderAddress, orderItems, profileId, snapshotUrlByHash } =
    params;

  const { lat: latitude, lng: longitude } =
    await Geoapify.getCoordsByAddress(orderAddress);

  return db.rls(async (tx) => {
    const [pendingOrder] = await tx
      .insert(orders)
      .values(order)
      .returning({ id: orders.id });

    await tx.insert(orderItemsSnapshots).values(
      orderItems.map((item) => {
        const { variantId: productVariantId, primaryImageHash, ...rest } = item;

        const snapshotUrl = snapshotUrlByHash.get(primaryImageHash);

        if (!snapshotUrl) {
          throw AppError.internal({
            message: "Snapshot URL missing",
            cause: `No snapshot URL found for hash: ${primaryImageHash}`,
          });
        }

        return {
          ...rest,
          productVariantId,
          primaryImageUrl: snapshotUrl,
          orderId: pendingOrder.id,
        };
      }),
    );

    await tx.insert(orderAddressesSnapshot).values({
      ...orderAddress,
      latitude,
      longitude,
      orderId: pendingOrder.id,
    });

    if (order.source === "cart") {
      const [cart] = await tx
        .select({ id: carts.id })
        .from(carts)
        .where(eq(carts.profileId, profileId))
        .limit(1);

      const variantIds = orderItems.map((item) => item.variantId);

      await tx
        .delete(cartItems)
        .where(
          and(
            eq(cartItems.cartId, cart.id),
            inArray(cartItems.productVariantId, variantIds),
          ),
        );
    }

    const [payment] = await tx
      .insert(payments)
      .values({
        orderId: pendingOrder.id,
        profileId,
        currency: "PHP",
        status: "pending",
      })
      .returning({ id: payments.id });

    return {
      orderId: pendingOrder.id,
      paymentId: payment.id,
    };
  });
};
