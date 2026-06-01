import {
  AdminOrderListItem,
  AdminQueryOrdersInput,
  AdminQueryOrdersRes,
  DBOrderStatus,
  orderAddressesSnapshot,
  orderItemsSnapshots,
  orders,
} from "@shared/schemas/index.ts";
import {
  camelToSnakeCaseString,
  snakeToCamelString,
} from "@shared/utils/mod.ts";
import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  ilike,
  inArray,
  lte,
  or,
} from "drizzle-orm";
import { DrizzleClient } from "../../../db/client.ts";
import { OrderStatus } from "../../../schemas/index.ts";

const ORDER_SORT_COLUMNS = {
  createdAt: orders.createdAt,
  updatedAt: orders.updatedAt,
  totalCents: orders.totalCents,
} as const;

export const getOrders = async (
  db: DrizzleClient,
  query: AdminQueryOrdersInput,
): Promise<AdminQueryOrdersRes> => {
  const {
    status,
    sortBy = "createdAt",
    sortDir = "desc",
    limit = 20,
    offset = 0,
    search,
    dateFrom,
    dateTo,
  } = query;

  const orderByColumn = ORDER_SORT_COLUMNS[sortBy];
  const orderBy = sortDir === "asc" ? asc(orderByColumn) : desc(orderByColumn);

  const conditions = [];

  if (status) {
    conditions.push(
      eq(
        orders.status,
        camelToSnakeCaseString(status) as unknown as DBOrderStatus,
      ),
    );
  }

  if (search) {
    conditions.push(
      or(
        ilike(orderAddressesSnapshot.fullName, `%${search}%`),
        ilike(orderAddressesSnapshot.city, `%${search}%`),
        ilike(orderAddressesSnapshot.region, `%${search}%`),
        ilike(orderAddressesSnapshot.province, `%${search}%`),
        ilike(orderAddressesSnapshot.barangay, `%${search}%`),
        ilike(orderAddressesSnapshot.addressLine, `%${search}%`),
        ilike(orderAddressesSnapshot.postalCode, `%${search}%`),
      ),
    );
  }

  if (dateFrom) {
    conditions.push(gte(orders.createdAt, new Date(dateFrom)));
  }

  if (dateTo) {
    const end = new Date(dateTo);
    end.setHours(23, 59, 59, 999);
    conditions.push(lte(orders.createdAt, end));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [orderRows, countResult] = await Promise.all([
    db.admin
      .select({
        id: orders.id,
        profileId: orders.profileId,
        status: orders.status,
        shipmentOrderId: orders.shipmentOrderId,
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
      .where(whereClause)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset),

    db.admin
      .select({ count: count() })
      .from(orders)
      .leftJoin(
        orderAddressesSnapshot,
        eq(orderAddressesSnapshot.orderId, orders.id),
      )
      .where(whereClause),
  ]);

  const orderIds = orderRows.map((o) => o.id);

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
    .where(inArray(orderItemsSnapshots.orderId, orderIds));

  const itemsByOrder = Object.groupBy(items, (i) => i.orderId);

  console.log({ items });

  const enrichedOrders: AdminOrderListItem[] = orderRows.map((row) => ({
    id: row.id,
    profileId: row.profileId,
    status: snakeToCamelString(row.status) as OrderStatus,
    shipmentOrderId: row.shipmentOrderId,
    serviceType: row.serviceType,

    subtotalCents: row.subtotalCents,
    passOnFee: row.passOnFee,
    discountCents: row.discountCents,
    shippingCents: row.shippingCents,
    totalCents: row.totalCents,

    createdAt: row.createdAt!,
    updatedAt: row.updatedAt!,
    expiresAt: row.expiresAt,

    items: itemsByOrder[row.id] ?? [],

    address: {
      name: row.fullName,
      phone: row.phoneNumber,
      postalCode: row.postalCode,
      region: row.region,
      province: row.province,
      city: row.city,
      barangay: row.barangay,
      addressLine: row.addressLine,
    },
  }));

  return {
    orders: enrichedOrders,
    meta: {
      total: Number(countResult[0]?.count ?? 0),
      limit,
      offset,
    },
  };
};
