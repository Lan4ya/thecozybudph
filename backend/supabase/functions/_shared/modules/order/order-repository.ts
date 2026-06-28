import { shipments } from "@shared/schemas/drizzle/shipments.ts";
import {
  cartItems,
  DBOrderStatus,
  InsertPendingOrder,
  orderAddressesSnapshot,
  orderItemsSnapshots,
  orders,
  payments,
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
      if (order.fromCart === true) {
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

  getOrderStatus: (db: DrizzleClient, id: string) =>
    db.rls(async (tx) => {
      const row = await tx.query.orders.findFirst({
        columns: { status: true },
        where: eq(orders.id, id),
      });

      return row;
    }),

  getById: (db: DrizzleClient, id: string) => {
    return db.rls(async (tx) => {
      const order = await tx.query.orders.findFirst({
        where: and(eq(orders.id, id)),
      });
      return order;
    });
  },

  getByIdAdmin: (db: DrizzleClient, id: string) => {
    return db.admin.query.orders.findFirst({
      where: and(eq(orders.id, id)),
    });
  },

  getOrderWithItems: (
    db: DrizzleClient,
    orderId: string,
    profileId: string,
  ) => {
    return db.rls(async (tx) => {
      const [orderWithAddress] = await tx
        .select({
          // Order details
          id: orders.id,
          paymentId: payments.id,
          shipmentOrderId: shipments.lalamoveOrderId,
          createdAt: orders.createdAt,
          expiresAt: orders.expiresAt,
          status: orders.status,
          serviceType: orders.serviceType,
          subtotalCents: orders.subtotalCents,
          discountCents: orders.discountCents,
          shippingCents: orders.shippingCents,
          passOnFee: orders.passOnFee,
          totalCents: orders.totalCents,

          // Address snapshot
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
        .leftJoin(shipments, eq(shipments.orderId, orders.id))
        .innerJoin(payments, and(eq(payments.orderId, orders.id)))
        .innerJoin(
          orderAddressesSnapshot,
          eq(orderAddressesSnapshot.orderId, orders.id),
        )
        .where(and(eq(orders.id, orderId), eq(orders.profileId, profileId)))
        .limit(1);

      if (!orderWithAddress) return null;

      const allItems = await tx
        .select({
          orderId: orderItemsSnapshots.orderId,
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
        .where(eq(orderItemsSnapshots.orderId, orderId));

      const grouped = Object.groupBy(allItems, (item) => item.orderId);
      const itemsForOrder = grouped[orderId] ?? [];

      return {
        id: orderWithAddress.id,
        paymentId: orderWithAddress.paymentId,
        shipmentOrderId: orderWithAddress.shipmentOrderId,
        createdAt: orderWithAddress.createdAt,
        expiresAt: orderWithAddress.expiresAt,
        status: orderWithAddress.status,
        serviceType: orderWithAddress.serviceType,
        subtotalCents: orderWithAddress.subtotalCents,
        discountCents: orderWithAddress.discountCents,
        shippingCents: orderWithAddress.shippingCents,
        passOnFee: orderWithAddress.passOnFee,
        totalCents: orderWithAddress.totalCents,
        address: orderWithAddress.address,
        items: itemsForOrder,
      };
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

      const ordersData = await tx
        .select({
          id: orders.id,
          paymentId: payments.id,
          status: orders.status,
          totalCents: orders.totalCents,
          expiresAt: orders.expiresAt,
          createdAt: orders.createdAt,
        })
        .from(orders)
        .innerJoin(payments, and(eq(payments.orderId, orders.id)))
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

      if (ordersData.length === 0) {
        return [];
      }

      const orderIds = ordersData.map((o) => o.id);

      const allItems = await tx
        .select({
          orderId: orderItemsSnapshots.orderId,
          id: orderItemsSnapshots.id,
          quantity: orderItemsSnapshots.quantity,
          name: orderItemsSnapshots.name,
          category: orderItemsSnapshots.category,
          primaryImageUrl: orderItemsSnapshots.primaryImageUrl,
          variantAttributes: orderItemsSnapshots.variantAttributes,
          priceCents: orderItemsSnapshots.priceCents,
        })
        .from(orderItemsSnapshots)
        .where(inArray(orderItemsSnapshots.orderId, orderIds));

      const itemsByOrderId = Object.groupBy(allItems, (item) => item.orderId);

      return ordersData.map((order) => ({
        id: order.id,
        paymentId: order.paymentId,
        status: order.status,
        totalCents: order.totalCents,
        expiresAt: order.expiresAt,
        createdAt: order.createdAt,
        items: itemsByOrderId[order.id] ?? [],
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
    },
  ) => {
    const { orderId, status } = params;
    const [row] = await db.admin
      .update(orders)
      .set({
        status,
      })
      .where(eq(orders.id, orderId))
      .returning({ id: orders.id, status: orders.status });

    if (!row) {
      throw new Error(`Order not found: ${orderId}`);
    }

    return row.status as DBOrderStatus;
  },
};
