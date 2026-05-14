import {
  cartItems,
  DBOrderStatus,
  InsertPendingOrder,
  orderAddressesSnapshot,
  orderItemsSnapshots,
  orders,
  productCategories,
  productCollections,
  products,
  productVariants,
} from "@shared/schemas/index.ts";
import { and, eq, inArray } from "drizzle-orm";
import { DrizzleClient } from "../../db/client.ts";
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

  getOrders: (
    db: DrizzleClient,
    profileId: string,
    params: {
      status: DBOrderStatus;
      limit?: number;
      offset?: number;
    },
  ) => {
    return db.rls((tx) => {
      const { status, limit = 20, offset = 0 } = params;
      return tx.query.orders.findMany({
        where: and(
          eq(orders.profileId, profileId),
          status ? eq(orders.status, status) : undefined,
        ),
        columns: {
          profileId: false,
          shipmentOrderId: false,
          source: false,
          updatedAt: false,
        },
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
          imageUrls: products.imageUrls,
          primaryImageHash: products.primaryImageHash,

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

  updateStatus: async (
    db: DrizzleClient,
    params: {
      orderId: string;
      status: DBOrderStatus;
      shippingOrderId?: string;
    },
  ) => {
    const { orderId, ...rest } = params;
    const [row] = await db.admin
      .update(orders)
      .set(rest)
      .where(eq(orders.id, orderId))
      .returning({ status: orders.status });
    return row.status;
  },
};
