import {
  AdminAnalyticsRes,
  orderAddressesSnapshot,
  orderItemsSnapshots,
  orders,
  profiles,
} from "@shared/schemas/index.ts";
import { and, count, desc, eq, gte, ne, sql, sum } from "drizzle-orm";
import { DrizzleClient } from "../../../db/client.ts";

export const getAnalytics = async (
  db: DrizzleClient,
): Promise<AdminAnalyticsRes> => {
  // Key Metrics
  const [revenueRes] = await db.admin
    .select({ total: sum(orders.totalCents) })
    .from(orders)
    .where(ne(orders.status, "cancelled"));

  const [ordersRes] = await db.admin
    .select({ count: count() })
    .from(orders)
    .where(ne(orders.status, "cancelled"));

  const [customersRes] = await db.admin
    .select({ count: count() })
    .from(profiles);

  // Conversion rate is tricky without a visits table. Mocking it for now.
  const totalRevenue = (Number(revenueRes?.total || 0) / 100).toLocaleString(
    "en-PH",
    {
      style: "currency",
      currency: "PHP",
    },
  );

  // Revenue Trend (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const revenueTrend = await db.admin
    .select({
      date: sql<string>`TO_CHAR(${orders.createdAt}, 'Mon DD')`,
      revenue: sql<number>`SUM(${orders.totalCents}) / 100`,
      orders: count(orders.id),
    })
    .from(orders)
    .where(
      and(ne(orders.status, "cancelled"), gte(orders.createdAt, thirtyDaysAgo)),
    )
    .groupBy(
      sql`TO_CHAR(${orders.createdAt}, 'Mon DD'), TO_CHAR(${orders.createdAt}, 'YYYY-MM-DD')`,
    )
    .orderBy(sql`TO_CHAR(${orders.createdAt}, 'YYYY-MM-DD')`);

  // Category Sales
  const categorySalesRaw = await db.admin
    .select({
      name: orderItemsSnapshots.category,
      value: count(orderItemsSnapshots.id),
    })
    .from(orderItemsSnapshots)
    .innerJoin(orders, eq(orders.id, orderItemsSnapshots.orderId))
    .where(ne(orders.status, "cancelled"))
    .groupBy(orderItemsSnapshots.category);

  const totalItems = categorySalesRaw.reduce(
    (acc, c) => acc + Number(c.value),
    0,
  );
  const colors = ["#ec4899", "#f43f5e", "#f97316", "#eab308", "#8b5cf6"];
  const categorySales = categorySalesRaw.map((c, i) => ({
    name: c.name,
    value:
      totalItems > 0 ? Math.round((Number(c.value) / totalItems) * 100) : 0,
    color: colors[i % colors.length],
  }));

  // Top Products
  const topProducts = await db.admin
    .select({
      name: orderItemsSnapshots.name,
      sales: sum(orderItemsSnapshots.quantity),
      revenue: sql<number>`SUM(${orderItemsSnapshots.priceCents} * ${orderItemsSnapshots.quantity}) / 100`,
    })
    .from(orderItemsSnapshots)
    .innerJoin(orders, eq(orders.id, orderItemsSnapshots.orderId))
    .where(ne(orders.status, "cancelled"))
    .groupBy(orderItemsSnapshots.name)
    .orderBy(
      desc(
        sql`SUM(${orderItemsSnapshots.priceCents} * ${orderItemsSnapshots.quantity})`,
      ),
    )
    .limit(5);

  // Daily Orders
  const dailyOrders = await db.admin
    .select({
      date: sql<string>`TO_CHAR(${orders.createdAt}, 'Dy')`,
      orders: count(orders.id),
    })
    .from(orders)
    .where(
      and(ne(orders.status, "cancelled"), gte(orders.createdAt, thirtyDaysAgo)),
    )
    .groupBy(
      sql`TO_CHAR(${orders.createdAt}, 'Dy'), TO_CHAR(${orders.createdAt}, 'ID')`,
    )
    .orderBy(sql`TO_CHAR(${orders.createdAt}, 'ID')`)
    .limit(7);

  // 6. Customer Acquisition (Mocked because profiles table lacks createdAt)
  const customerAcquisition = [
    { month: "January", customers: 45 },
    { month: "February", customers: 62 },
    { month: "March", customers: 58 },
    { month: "April", customers: 71 },
    { month: "May", customers: 85 },
    { month: "June", customers: 92 },
  ];

  // Recent Transactions
  const recentTransactionsRaw = await db.admin
    .select({
      id: orders.id,
      customer: orderAddressesSnapshot.fullName,
      amount: orders.totalCents,
      status: orders.status,
      date: orders.createdAt,
    })
    .from(orders)
    .innerJoin(
      orderAddressesSnapshot,
      eq(orderAddressesSnapshot.orderId, orders.id),
    )
    .orderBy(desc(orders.createdAt))
    .limit(5);

  const recentTransactions = recentTransactionsRaw.map((t) => ({
    id: `TXN${t.id.slice(0, 4).toUpperCase()}`,
    customer: t.customer,
    amount: (Number(t.amount) / 100).toLocaleString("en-PH", {
      style: "currency",
      currency: "PHP",
    }),
    status:
      t.status === "fulfilled"
        ? "Completed"
        : t.status === "to_pay"
          ? "Pending"
          : "Other",
    date: t.date
      ? new Intl.DateTimeFormat("en-PH", {
          dateStyle: "medium",
          timeStyle: "short",
        }).format(t.date)
      : "Unknown",
  }));

  // 8. Product Performance
  const productPerformance = topProducts.map((p) => ({
    name: p.name,
    views: Math.round(Number(p.sales) * 15.5), // Mocked relative to sales
    clicks: Math.round(Number(p.sales) * 8.2), // Mocked relative to sales
    conversions: Number(p.sales),
    revenue: Number(p.revenue).toLocaleString("en-PH", {
      style: "currency",
      currency: "PHP",
    }),
  }));

  return {
    keyMetrics: {
      totalRevenue: { value: totalRevenue, change: "+0%", positive: true },
      totalOrders: {
        value: String(ordersRes?.count || 0),
        change: "+0%",
        positive: true,
      },
      totalCustomers: {
        value: String(customersRes?.count || 0),
        change: "+0%",
        positive: true,
      },
      conversionRate: { value: "3.2%", change: "+0%", positive: true },
    },
    revenueTrend: revenueTrend.map((r) => ({
      date: r.date,
      revenue: Number(r.revenue),
      orders: Number(r.orders),
    })),
    categorySales,
    topProducts: topProducts.map((p) => ({
      name: p.name,
      sales: Number(p.sales),
      revenue: Number(p.revenue),
    })),
    dailyOrders: dailyOrders.map((d) => ({
      date: d.date,
      orders: Number(d.orders),
    })),
    customerAcquisition,
    recentTransactions,
    productPerformance,
  };
};
