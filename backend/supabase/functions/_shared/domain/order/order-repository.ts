import { SupabaseType } from "@shared/types.d.ts";
import { DrizzleClient } from "../../db/client.ts";
import {
  productCategories,
  productCollections,
  products,
  productVariants,
} from "../../db/schema/products.ts";
import { and, eq, inArray } from "drizzle-orm";
import { InsertPendingOrder } from "../../db/types/orders.ts";
import {
  orderAddressesSnapshot,
  orderItemsSnapshots,
  orders,
} from "../../db/schema/orders.ts";
import { CartRepository } from "../cart/cart-repository.ts";
import { cartItems } from "../../db/schema/carts.ts";

export const OrderRepository = {
  insertPendingOrder: (db: DrizzleClient, inserts: InsertPendingOrder) => {
    return db.rls(async (tx) => {
      const { order, items, address } = inserts;

      // Insert order
      const [pendingOrder] = await tx
        .insert(orders)
        .values(order)
        .returning({ id: orders.id });

      // Insert order items snapshot
      await tx
        .insert(orderItemsSnapshots)
        .values(
          items.map((item) => ({
            ...item,
            orderId: pendingOrder.id,
          })),
        )
        .returning();

      // Insert order address snapshot
      await tx
        .insert(orderAddressesSnapshot)
        .values({ ...address, orderId: pendingOrder.id })
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

      return pendingOrder.id;
    });
  },

  updateStatus: async (s: SupabaseType, orderId: string, status: string) => {
    const { data, error } = await s
      .from("orders")
      .update({ status: "confirmed" })
      .eq("id", orderId)
      .eq("status", status)
      .select()
      .single();

    return { data, error };
  },

  getByIdAndProfileId: (db: DrizzleClient, id: string, profileId: string) =>
    db.rls(async (tx) => {
      const order = await tx.query.orders.findFirst({
        where: and(eq(orders.id, id), eq(orders.profileId, profileId)),
      });
      return order;
    }),

  getDetailsByVariantIds: (db: DrizzleClient, variantIds: string[]) => {
    return db.rls(async (tx) => {
      return await tx
        .select({
          id: productVariants.id,
          productId: productVariants.productId,
          priceCents: productVariants.priceCents,
          variantAttributes: productVariants.attributes,

          name: products.name,
          primaryImageUrl: products.primaryImageUrl,

          collection: productCollections.name,
          category: productCategories.name,
        })
        .from(productVariants)
        .innerJoin(products, eq(products.id, productVariants.productId))
        .leftJoin(
          productCollections,
          eq(productCollections.id, products.productCollectionId),
        )
        .innerJoin(
          productCategories,
          eq(productCategories.id, products.productCategoryId),
        )
        .where(inArray(productVariants.id, variantIds));
    });
  },
};
