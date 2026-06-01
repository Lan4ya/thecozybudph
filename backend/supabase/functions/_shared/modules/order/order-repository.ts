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
import { and, desc, eq, inArray, ne } from "drizzle-orm";
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

  getOrderItem: (db: DrizzleClient, itemId: string, profileId: string) => {
    return db.rls(async (tx) => {
      const [orderItem] = await tx
        .select({
          // item details
          id: orderItemsSnapshots.id,
          orderId: orders.id,
          shipmentOrderId: orders.shipmentOrderId,
          quantity: orderItemsSnapshots.quantity,
          cardMessages: orderItemsSnapshots.cardMessages,
          name: orderItemsSnapshots.name,
          collection: orderItemsSnapshots.collection,
          category: orderItemsSnapshots.category,
          primaryImageUrl: orderItemsSnapshots.primaryImageUrl,
          variantAttributes: orderItemsSnapshots.variantAttributes,
          priceCents: orderItemsSnapshots.priceCents,

          // order details
          createdAt: orders.createdAt,
          status: orders.status,
          serviceType: orders.serviceType,
          subtotalCents: orders.subtotalCents,
          discountCents: orders.discountCents,
          shippingCents: orders.shippingCents,
          passOnFee: orders.passOnFee,
          totalCents: orders.totalCents,

          address: {
            fullName: orderAddressesSnapshot.fullName,
            postalCode: orderAddressesSnapshot.postalCode,
            region: orderAddressesSnapshot.region,
            city: orderAddressesSnapshot.city,
            province: orderAddressesSnapshot.province,
            barangay: orderAddressesSnapshot.barangay,
            addressLine: orderAddressesSnapshot.addressLine,
            phoneNumber: orderAddressesSnapshot.phoneNumber,
          },
        })
        .from(orderItemsSnapshots)
        .innerJoin(orders, eq(orders.id, orderItemsSnapshots.orderId))
        .innerJoin(
          orderAddressesSnapshot,
          eq(orderAddressesSnapshot.orderId, orderItemsSnapshots.orderId),
        )
        .where(
          and(
            eq(orderItemsSnapshots.id, itemId),
            eq(orders.profileId, profileId),
          ),
        )
        .limit(1);

      if (!orderItem) {
        return null;
      }
      return orderItem;
    });
  },

  queryOrders: (
    db: DrizzleClient,
    profileId: string,
    params: {
      status?: DBOrderStatus;
      limit: number;
      offset: number;
    },
  ) => {
    return db.rls(async (tx) => {
      const { status, limit, offset } = params;

      const statusCondition =
        status === undefined
          ? undefined
          : status === "to_ship"
            ? inArray(orders.status, ["to_ship", "shipped", "paid"])
            : eq(orders.status, status);

      return await tx
        .select({
          id: orders.id,
          status: orders.status,
          totalCents: orders.totalCents,
          expiresAt: orders.expiresAt,

          item: {
            id: orderItemsSnapshots.id,
            quantity: orderItemsSnapshots.quantity,
            name: orderItemsSnapshots.name,
            category: orderItemsSnapshots.category,
            primaryImageUrl: orderItemsSnapshots.primaryImageUrl,
            variantAttributes: orderItemsSnapshots.variantAttributes,
            priceCents: orderItemsSnapshots.priceCents,
          },
        })
        .from(orderItemsSnapshots)
        .innerJoin(orders, eq(orders.id, orderItemsSnapshots.orderId))
        .where(
          and(
            eq(orders.profileId, profileId),
            statusCondition,
            ne(orders.status, "expired"),
          ),
        )
        .orderBy(desc(orders.createdAt))
        .limit(limit)
        .offset(offset);
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
      shippingOrderId?: string | null;
    },
  ) => {
    const { orderId, status, shippingOrderId } = params;
    const [row] = await db.admin
      .update(orders)
      .set({
        status,
        ...(shippingOrderId !== undefined
          ? { shipmentOrderId: shippingOrderId }
          : {}),
      })
      .where(eq(orders.id, orderId))
      .returning({ status: orders.status });
    return row.status as DBOrderStatus;
  },
};
