import { and, eq, inArray } from "drizzle-orm";
import { DrizzleClient } from "../../db/client.ts";
import { cartItems } from "../../db/schema/carts.ts";
import {
  orderAddressesSnapshot,
  orderItemsSnapshots,
  orders,
} from "../../db/schema/orders.ts";
import { payments } from "../../db/schema/payments.ts";
import { InsertCheckout } from "../../db/types/checkout.ts";
import { CartRepository } from "../cart/cart-repository.ts";

export const CheckoutRepository = {
  insertCheckOut: (db: DrizzleClient, inserts: InsertCheckout) => {
    return db.rls(async (tx) => {
      const { order, items, address, payment } = inserts;

      // Insert order
      const [insertedPendingOrder] = await tx
        .insert(orders)
        .values(order)
        .returning();

      // Insert order items snapshot
      const insertedPendingOrderItems = await tx
        .insert(orderItemsSnapshots)
        .values(
          items.map((item) => ({
            ...item,
            orderId: insertedPendingOrder.id,
          })),
        )
        .returning();

      // Insert order address snapshot
      const [insertedOrderAddressSnapshot] = await tx
        .insert(orderAddressesSnapshot)
        .values({ ...address, orderId: insertedPendingOrder.id })
        .returning();

      // Insert payment
      const [insertedPendingPayment] = await tx
        .insert(payments)
        .values({
          ...payment,
          orderId: insertedPendingOrder.id,
        })
        .returning();

      // Delete the item(s) from user cart if the order came from cart and not directly from shop
      if (order.source === "cart") {
        const cart = await CartRepository.getCartByProfileId(
          db,
          order.profileId,
        );

        const variantIds = items.reduce<string[]>((acc, item) => {
          const id = item.productVariantId;
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

      return {
        insertedPendingOrder,
        insertedPendingOrderItems,
        insertedOrderAddressSnapshot,
        insertedPendingPayment,
      };
    });
  },
};
