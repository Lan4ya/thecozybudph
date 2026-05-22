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

  getOrder: (db: DrizzleClient, id: string) => {
    return db.rls(async (tx) => {
      const [orderRow] = await tx
        .select({
          id: orders.id,
          profileId: orders.profileId,
          createdAt: orders.createdAt,
          status: orders.status,
          serviceType: orders.serviceType,
          subtotalCents: orders.subtotalCents,
          discountCents: orders.discountCents,
          shippingCents: orders.shippingCents,
          passOnFee: orders.passOnFee,
          totalCents: orders.totalCents,
          expiresAt: orders.expiresAt,

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
        .from(orders)
        .innerJoin(
          orderAddressesSnapshot,
          eq(orderAddressesSnapshot.orderId, orders.id),
        )
        .where(eq(orders.id, id));

      if (!orderRow) {
        return null;
      }

      const items = await tx
        .select({
          id: orderItemsSnapshots.id,
          productId: orderItemsSnapshots.productId,
          productVariantId: orderItemsSnapshots.productVariantId,
          quantity: orderItemsSnapshots.quantity,
          cardMessages: orderItemsSnapshots.cardMessages,
          name: orderItemsSnapshots.name,
          collection: orderItemsSnapshots.collection,
          category: orderItemsSnapshots.category,
          primaryImageUrl: orderItemsSnapshots.primaryImageUrl,
          variantAttributes: orderItemsSnapshots.variantAttributes,
          priceCents: orderItemsSnapshots.priceCents,
        })
        .from(orderItemsSnapshots)
        .where(eq(orderItemsSnapshots.orderId, id));

      return {
        ...orderRow,
        items,
      };
    });
  },

  getById: (db: DrizzleClient, id: string) => {
    return db.rls(async (tx) => {
      const order = await tx.query.orders.findFirst({
        where: and(eq(orders.id, id)),
      });
      return order;
    });
  },

  queryOrders: (
    db: DrizzleClient,
    profileId: string,
    params: {
      status: DBOrderStatus;
      limit: number;
      offset: number;
    },
  ) => {
    return db.rls(async (tx) => {
      const { status, limit, offset } = params;

      const statusCondition =
        status === "to_ship"
          ? inArray(orders.status, ["to_ship", "shipped", "paid"])
          : eq(orders.status, status);

      const orderRows = await tx
        .select({
          id: orders.id,
          createdAt: orders.createdAt,
          status: orders.status,
          serviceType: orders.serviceType,
          subtotalCents: orders.subtotalCents,
          discountCents: orders.discountCents,
          shippingCents: orders.shippingCents,
          passOnFee: orders.passOnFee,
          totalCents: orders.totalCents,
          expiresAt: orders.expiresAt,

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
        .from(orders)
        .innerJoin(
          orderAddressesSnapshot,
          eq(orderAddressesSnapshot.orderId, orders.id),
        )
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

      const orderIds = orderRows.map((o) => o.id);

      if (orderIds.length === 0) {
        return [];
      }

      const items = await tx
        .select({
          orderId: orderItemsSnapshots.orderId,

          id: orderItemsSnapshots.id,
          productId: orderItemsSnapshots.productId,
          productVariantId: orderItemsSnapshots.productVariantId,
          quantity: orderItemsSnapshots.quantity,
          cardMessages: orderItemsSnapshots.cardMessages,
          name: orderItemsSnapshots.name,
          collection: orderItemsSnapshots.collection,
          category: orderItemsSnapshots.category,
          primaryImageUrl: orderItemsSnapshots.primaryImageUrl,
          variantAttributes: orderItemsSnapshots.variantAttributes,
          priceCents: orderItemsSnapshots.priceCents,
        })
        .from(orderItemsSnapshots)
        .where(inArray(orderItemsSnapshots.orderId, orderIds));

      const itemsByOrder = Object.groupBy(items, (i) => i.orderId);

      return orderRows.map((o) => ({
        ...o,
        items: itemsByOrder[o.id] ?? [],
      }));
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
        ...(shippingOrderId !== undefined ? { shipmentOrderId: shippingOrderId } : {}),
      })
      .where(eq(orders.id, orderId))
      .returning({ status: orders.status });
    return row.status as DBOrderStatus;
  },
};
