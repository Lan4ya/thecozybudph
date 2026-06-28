import { DrizzleClient } from "@shared/db/client.ts";
import { AppError } from "@shared/errors/Errors.ts";
import {
  cartItems,
  carts,
  CreateOrderRes,
  idempotencyKeys,
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

export const CREATE_ORDER_IDEMPOTENCY_OPERATION = "create_order";

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
    fromCart: boolean;
    order: InsertOrder;
    orderAddress: PreparedOrderAddress;
    orderItems: PreparedOrderItem[];
    snapshotUrlByHash: Map<string, string>;
    idempotencyKey: string;
    requestHash: string;
  },
): Promise<CreateOrderRes> => {
  const {
    order,
    orderAddress,
    orderItems,
    profileId,
    snapshotUrlByHash,
    idempotencyKey,
    requestHash,
    fromCart,
  } = params;

  const { lat: latitude, lng: longitude } =
    await Geoapify.getCoordsByAddress(orderAddress);

  return db.admin.transaction(async (tx) => {
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

    // Rm items from user's cart if the order came from cart
    if (fromCart === true) {
      const [cart] = await tx
        .select({ id: carts.id })
        .from(carts)
        .where(eq(carts.profileId, profileId))
        .limit(1);

      if (cart) {
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

    const response = {
      orderId: pendingOrder.id,
      paymentId: payment.id,
    };

    // Complete create-order idempotency
    const [completedIdempotencyKey] = await tx
      .update(idempotencyKeys)
      .set({
        status: "completed",
        responsePayload: response,
        errorPayload: null,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(idempotencyKeys.profileId, profileId),
          eq(idempotencyKeys.operation, CREATE_ORDER_IDEMPOTENCY_OPERATION),
          eq(idempotencyKeys.idempotencyKey, idempotencyKey),
          eq(idempotencyKeys.requestHash, requestHash),
          eq(idempotencyKeys.status, "processing"),
        ),
      )
      .returning({ id: idempotencyKeys.id });

    if (!completedIdempotencyKey) {
      throw AppError.conflict({
        message: "Failed to finalize idempotent create-order request",
      });
    }

    return response;
  });
};
