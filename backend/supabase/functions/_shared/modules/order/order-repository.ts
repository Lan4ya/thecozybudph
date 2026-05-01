import { SupabaseType } from "@shared/types.d.ts";
import { DrizzleClient } from "../../db/client.ts";
import {
  productCategories,
  productCollections,
  products,
  productVariants,
  orderAddressesSnapshot,
  orderItemsSnapshots,
  orders,
  InsertPendingOrder,
  DBOrderStatus,
  cartItems,
} from "@shared/schemas/index.ts";
import { and, eq, inArray } from "drizzle-orm";
import { CartRepository } from "../cart/cart-repository.ts";

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

  updateStatus: async (
    s: SupabaseType,
    orderId: string,
    status: DBOrderStatus,
  ) => {
    const { data, error } = await s
      .from("orders")
      .update({ status })
      .eq("id", orderId)
      .eq("status", status)
      .select()
      .single();

    return { data, error };
  },

  checkExists: (db: DrizzleClient, id: string) =>
    db.rls(async (tx) => {
      const row = await tx.query.orders.findFirst({
        columns: { id: true },
        where: eq(orders.id, id),
      });

      return !!row;
    }),

  getById: (db: DrizzleClient, id: string) => {
    return db.rls(async (tx) => {
      const order = await tx.query.orders.findFirst({
        where: and(eq(orders.id, id)),
      });
      return order;
    });
  },

  getUserOrders: (
    db: DrizzleClient,
    profileId: string,
    params: {
      status: DBOrderStatus;
      limit: number;
      offset: number;
    },
  ) => {
    return db.rls((tx) => {
      const { status, limit, offset } = params;
      return tx.query.orders.findMany({
        where: and(
          eq(orders.profileId, profileId),
          status ? eq(orders.status, status) : undefined,
        ),
        orderBy: (orders, { desc }) => [desc(orders.createdAt)],
        limit,
        offset,
      });
    });
  },

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
