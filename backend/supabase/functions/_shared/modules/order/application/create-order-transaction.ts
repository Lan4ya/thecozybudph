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
} from "./create-order-prep.ts";

export const persistCreateOrderTransaction = (
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

    await tx
      .insert(orderAddressesSnapshot)
      .values({ ...orderAddress, orderId: pendingOrder.id });

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
        isActive: true,
      })
      .returning({ id: payments.id });

    return {
      orderId: pendingOrder.id,
      paymentId: payment.id,
    };
  });
};
