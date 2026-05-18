import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";

import { OrderAPI } from "@/api";

import { cn } from "@/lib/utils/cn";
import { formatPriceCents } from "@/lib/utils/format";

import type { QueryOrdersInput, QueryOrdersRes } from "@cozybud/schemas";
import { FlowerSpinner } from "@/components/RouteLoaderSpinner";
import { Button } from "@/lib/ui/__shadcn__/button";
import { Calendar, Package, Receipt, Truck } from "lucide-react";

const ORDER_STATUS_TABS = [
  { status: "toPay", label: "To Pay" },
  { status: "toShip", label: "To Ship" },
  { status: "toReceive", label: "To Receive" },
  { status: "fulfilled", label: "Completed" },
  { status: "cancelled", label: "Cancelled" },
] as const;

type OrderStatus = (typeof ORDER_STATUS_TABS)[number]["status"];

const statusBadgeClasses: Record<OrderStatus, string> = {
  toPay: "bg-yellow-100 text-yellow-800 border-yellow-200",
  toShip: "bg-blue-100 text-blue-800 border-blue-200",
  toReceive: "bg-orange-100 text-orange-800 border-orange-200",
  fulfilled: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

const statusLabel: Record<OrderStatus, string> = {
  toPay: "To Pay",
  toShip: "To Ship",
  toReceive: "To Receive",
  fulfilled: "Completed",
  cancelled: "Cancelled",
};

const serviceTypeLabel: Record<QueryOrdersRes[number]["serviceType"], string> =
  {
    motorcycle: "Motorcycle",
    sedan: "Sedan",
  };

function toDate(value: Date | string | null | undefined): Date | null {
  if (!value) return null;

  if (value instanceof Date) {
    return value;
  }

  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatDate(value: Date | string | null | undefined): string {
  const date = toDate(value);

  if (!date) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-PH", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(date);
}

function OrderCard({ order }: { order: QueryOrdersRes[number] }) {
  const createdAt = formatDate(order.createdAt);

  return (
    <Link
      to={`/profile/my-purchases/${order.id}`}
      className="group block overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:border-primary/30 hover:shadow-md active:scale-[0.98]"
    >
      <div className="flex flex-col h-full">
        {/* Header with Status */}
        <div className="flex items-center justify-between p-4 border-b bg-background">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span>{createdAt}</span>
          </div>
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
              statusBadgeClasses[order.status],
            )}
          >
            {statusLabel[order.status]}
          </span>
        </div>

        {/* Content */}
        <div className="flex flex-1 gap-4 p-4">
          {/* Order Image */}
          {order.items[0]?.primaryImageUrl && (
            <div className="h-[100px] w-[100px] shrink-0 overflow-hidden rounded-xl border bg-primary/5">
              <img
                src={order.items[0].primaryImageUrl}
                alt={order.items[0].name}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
              />
            </div>
          )}

          <div className="flex-1 min-w-0 space-y-3">
            <div className="space-y-1">
              <p className="text-[10px] font-mono uppercase text-muted-foreground tracking-tighter">
                #{order.id.slice(0, 8)}...
              </p>
              <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors">
                {order.items.length}{" "}
                {order.items.length === 1 ? "Item" : "Items"}
              </h3>
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-1 text-[11px] bg-primary/5 px-2 py-1 rounded-md text-primary/80 font-medium">
                <Truck className="h-3 w-3" />
                <span>{serviceTypeLabel[order.serviceType]}</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] bg-primary/5 px-2 py-1 rounded-md text-primary/80 font-medium">
                <Package className="h-3 w-3" />
                <span>Order #{order.id.slice(-4)}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-end items-end gap-1">
            <p className="text-[10px] text-muted-foreground font-medium">
              Total Amount
            </p>
            <p className="text-base font-bold text-primary">
              {formatPriceCents(order.totalCents)}
            </p>
          </div>
        </div>

        {/* Footer/Action Hint */}
        <div className="px-4 py-2 bg-primary/5 text-[10px] font-semibold text-primary/70 text-right uppercase tracking-widest border-t border-primary/5 opacity-0 group-hover:opacity-100 transition-opacity">
          View Details →
        </div>
      </div>
    </Link>
  );
}

const MyPurchases = () => {
  const [activeTab, setActiveTab] = useState<OrderStatus>("toPay");

  const queryParams: QueryOrdersInput = useMemo(
    () => ({
      status: activeTab,
      limit: 20,
      offset: 0,
    }),
    [activeTab],
  );

  const { data, error, refetch, isFetching } = useQuery({
    queryKey: ["orders", queryParams],
    queryFn: () => OrderAPI.queryOrders(queryParams),
  });

  const orders = data ?? [];

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-8 px-4 py-8 md:px-6 lg:px-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-ivy-ora-display">
            My Purchases
          </h1>
          <p className="text-muted-foreground">
            Manage and track your shopping history
          </p>
        </div>
      </div>

      <div className="sticky top-0 z-10 -mx-4 px-4 bg-background/80 backdrop-blur-sm border-b md:relative md:top-auto md:mx-0 md:px-0 md:bg-transparent md:backdrop-blur-none md:border-none">
        <div className="overflow-x-auto pb-4 pt-2 no-scrollbar">
          <div
            className="flex min-w-max gap-3"
            role="tablist"
            aria-label="Order status tabs"
          >
            {ORDER_STATUS_TABS.map(({ status, label }) => (
              <button
                key={status}
                type="button"
                role="tab"
                aria-selected={activeTab === status}
                onClick={() => setActiveTab(status)}
                className={cn(
                  "rounded-xl px-5 py-2.5 text-sm font-semibold transition-all border-2",
                  activeTab === status
                    ? "border-primary bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                    : "border-border bg-card text-muted-foreground hover:border-primary/30",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isFetching ? (
        <div className="h-64 flex-center">
          <FlowerSpinner />
        </div>
      ) : error ? (
        <div className="rounded-3xl border-2 border-dashed border-destructive/20 bg-destructive/5 p-10 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <Receipt className="text-destructive h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold mb-1">Failed to load orders</h3>
          <p className="text-muted-foreground mb-6 max-w-xs mx-auto text-sm">
            {error?.message ||
              "Something went wrong while fetching your purchases."}
          </p>
          <Button
            onClick={() => refetch()}
            variant="default"
            className="rounded-full px-8"
          >
            Try Again
          </Button>
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-primary/10 bg-primary/5 py-24 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Package className="text-primary h-8 w-8" />
          </div>
          <h3 className="text-xl font-bold mb-1 text-primary">
            No orders found
          </h3>
          <p className="text-primary/60">
            You don't have any orders in this category yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fill,minmax(350px,1fr))] gap-6">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyPurchases;
