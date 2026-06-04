import { eq } from "drizzle-orm";
import { toCamelCase } from "drizzle-orm/casing";
import {
  AdminOrderListItem,
  orders,
  orderAddressesSnapshot,
  orderItemsSnapshots,
  AdminGetOrderData,
} from "@shared/schemas/index.ts";
import { DrizzleClient } from "../../../db/client.ts";
import { OrderStatus } from "../../../schemas/index.ts";

export const getOrder = async (
  db: DrizzleClient,
  orderId: string,
): Promise<AdminGetOrderData | null> => {
  // Fetch the order with its address
  const [orderRow] = await db.admin
    .select({
      id: orders.id,
      profileId: orders.profileId,
      status: orders.status,
      serviceType: orders.serviceType,

      subtotalCents: orders.subtotalCents,
      discountCents: orders.discountCents,
      shippingCents: orders.shippingCents,
      passOnFee: orders.passOnFee,
      totalCents: orders.totalCents,

      createdAt: orders.createdAt,
      updatedAt: orders.updatedAt,
      expiresAt: orders.expiresAt,

      // address
      fullName: orderAddressesSnapshot.fullName,
      phoneNumber: orderAddressesSnapshot.phoneNumber,
      postalCode: orderAddressesSnapshot.postalCode,
      region: orderAddressesSnapshot.region,
      province: orderAddressesSnapshot.province,
      city: orderAddressesSnapshot.city,
      barangay: orderAddressesSnapshot.barangay,
      addressLine: orderAddressesSnapshot.addressLine,
    })
    .from(orders)
    .innerJoin(
      orderAddressesSnapshot,
      eq(orderAddressesSnapshot.orderId, orders.id),
    )
    .where(eq(orders.id, orderId));

  if (!orderRow) {
    return null;
  }

  // Fetch items for this order
  const items = await db.admin
    .select({
      orderId: orderItemsSnapshots.orderId,
      name: orderItemsSnapshots.name,
      image: orderItemsSnapshots.primaryImageUrl,
      attributes: orderItemsSnapshots.variantAttributes,
      quantity: orderItemsSnapshots.quantity,
      cardMessages: orderItemsSnapshots.cardMessages,
      priceCents: orderItemsSnapshots.priceCents,
      category: orderItemsSnapshots.category,
      collection: orderItemsSnapshots.collection,
    })
    .from(orderItemsSnapshots)
    .where(eq(orderItemsSnapshots.orderId, orderId));

  const result: AdminOrderListItem = {
    id: orderRow.id,
    profileId: orderRow.profileId,
    status: toCamelCase(orderRow.status) as OrderStatus,
    serviceType: orderRow.serviceType,

    subtotalCents: orderRow.subtotalCents,
    passOnFee: orderRow.passOnFee,
    discountCents: orderRow.discountCents,
    shippingCents: orderRow.shippingCents,
    totalCents: orderRow.totalCents,

    createdAt: orderRow.createdAt!,
    updatedAt: orderRow.updatedAt!,
    expiresAt: orderRow.expiresAt,

    items: items ?? [],

    address: {
      name: orderRow.fullName,
      phone: orderRow.phoneNumber,
      postalCode: orderRow.postalCode,
      region: orderRow.region,
      province: orderRow.province,
      city: orderRow.city,
      barangay: orderRow.barangay,
      addressLine: orderRow.addressLine,
    },
  };

  return result;
};
