import type { AdminOrderItem, AdminOrderListItem } from "@cozybud/schemas";
import { StatusBadge } from "./StatusBadge";
import { formatPriceCents } from "@/lib/utils/format";
import { Spinner } from "@/lib/ui/__shadcn__/spinner";

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
        <table className="w-full lg:table-fixed text-sm">
          <thead className="">
            <tr>
              <th className="pr-4 pl-8 py-3 text-left font-medium text-muted-foreground">
                ORDER
              </th>
              <th className="w-[24%] px-4 py-3 text-left font-medium text-muted-foreground">
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
                  <Spinner className="size-5 mx-auto" />
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
                  className={`cursor-pointer border-t transition-colors hover:bg-accent/15 ${
                    selectedOrderId === order.id ? "bg-accent/30" : ""
                  }`}
                >
                  <td className="pr-4 pl-8 py-3 text-left">
                    <div className="font-mono text-xs text-primary">
                      {order.id.slice(0, 8)}...
                    </div>
                    <div className=" text-xs text-muted-foreground">
                      {order.profileId.slice(0, 8)}...
                    </div>
                  </td>

                  <td className="px-4 py-3 text-left">
                    <div className="truncate font-medium">
                      {order.address.name || "N/A"}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">
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
