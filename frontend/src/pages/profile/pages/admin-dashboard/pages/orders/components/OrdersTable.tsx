import type { AdminOrderItem, AdminOrderListItem } from "@TheCozyBud/schemas";
import { Loader2 } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { formatPriceCents } from "@/lib/utils/format";

type OrdersTableProps = {
  orders: AdminOrderListItem[];
  isLoading: boolean;
  hasError: boolean;
  selectedOrderId: string | null;
  onRowClick: (order: AdminOrderListItem) => void;
};

function formatDate(date: Date) {
  return date.toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatAddress(order: AdminOrderListItem) {
  const { city, province, region } = order.address;
  return [city, province, region].filter(Boolean).join(", ") || "No address";
}

export function getOrderItemCount(items: AdminOrderItem[]): number {
  return items.reduce((acc, item) => acc + item.quantity, 0);
}

export function OrdersTable({
  orders,
  isLoading,
  hasError,
  selectedOrderId,
  onRowClick,
}: OrdersTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                ORDER
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                RECIPIENT
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                STATUS
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                ITEMS
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                TOTAL
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                CREATED
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-12 text-center text-muted-foreground"
                >
                  <Loader2 className="mx-auto mb-2 size-5 animate-spin" />
                  Loading orders...
                </td>
              </tr>
            ) : hasError ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-12 text-center text-destructive"
                >
                  Failed to load orders.
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-12 text-center text-muted-foreground"
                >
                  No orders found.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr
                  key={order.id}
                  onClick={() => onRowClick(order)}
                  className={`cursor-pointer border-t transition-colors hover:bg-muted/40 ${
                    selectedOrderId === order.id ? "bg-muted/30" : ""
                  }`}
                >
                  <td className="px-4 py-3 text-left">
                    <div className="font-mono text-xs text-primary">
                      {order.id.slice(0, 8)}...
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {order.profileId.slice(0, 8)}...
                    </div>
                  </td>

                  <td className="px-4 py-3 text-left">
                    <div className="font-medium">
                      {order.address.name || "N/A"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatAddress(order)}
                    </div>
                  </td>

                  <td className="px-4 py-3 text-left">
                    <StatusBadge status={order.status} />
                  </td>

                  <td className="px-4 pl-7 py-3 text-left">
                    {getOrderItemCount(order.items)}
                  </td>

                  <td className="px-4 py-3 text-left font-medium">
                    {formatPriceCents(order.totalCents)}
                  </td>

                  <td className="px-4 py-3 text-left whitespace-nowrap text-xs text-muted-foreground">
                    {formatDate(order.createdAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
