import { useState } from "react";
import { formatPriceCents } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

// ─── Tabs configuration ──────────────────────────────────
const ORDER_STATUS_TABS = [
  { status: "to_pay", label: "To Pay" },
  { status: "to_ship", label: "To Ship" },
  { status: "to_receive", label: "To Receive" },
  { status: "completed", label: "Completed" },
  { status: "cancelled", label: "Cancelled" },
] as const;

type OrderStatus = (typeof ORDER_STATUS_TABS)[number]["status"];

// ─── Mock orders ──────────────────────────────────────────
interface MockOrder {
  id: string;
  status: OrderStatus;
  orderDate: string;
  totalCents: number;
  items: { name: string; quantity: number }[];
  shippingAddress: string;
}

const MOCK_ORDERS: MockOrder[] = [
  {
    id: "order-001",
    status: "to_pay",
    orderDate: "2025-04-20",
    totalCents: 4500_00, // ₱4,500
    items: [
      { name: "Romantic Red Roses", quantity: 2 },
      { name: "Sunflower Delight", quantity: 1 },
    ],
    shippingAddress: "123 Main St, Quezon City",
  },
  {
    id: "order-002",
    status: "to_ship",
    orderDate: "2025-04-18",
    totalCents: 3200_00,
    items: [{ name: "Tulip Rainbow", quantity: 1 }],
    shippingAddress: "456 Elm St, Mandaluyong",
  },
  {
    id: "order-003",
    status: "to_receive",
    orderDate: "2025-04-15",
    totalCents: 8900_00,
    items: [{ name: "Wildflower Mix", quantity: 3 }],
    shippingAddress: "789 Oak St, Makati",
  },
  {
    id: "order-004",
    status: "completed",
    orderDate: "2025-04-10",
    totalCents: 12000_00,
    items: [
      { name: "Cherry Blossom", quantity: 1 },
      { name: "Silver Vase Arrangement", quantity: 1 },
    ],
    shippingAddress: "321 Pine St, Pasig",
  },
  {
    id: "order-005",
    status: "cancelled",
    orderDate: "2025-04-05",
    totalCents: 5400_00,
    items: [{ name: "Romantic Red Roses", quantity: 1 }],
    shippingAddress: "654 Maple St, Taguig",
  },
  {
    id: "order-006",
    status: "to_pay",
    orderDate: "2025-04-19",
    totalCents: 6700_00,
    items: [{ name: "Sunflower Delight", quantity: 2 }],
    shippingAddress: "987 Cedar St, Pasay",
  },
  {
    id: "order-007",
    status: "to_ship",
    orderDate: "2025-04-16",
    totalCents: 4100_00,
    items: [{ name: "Tulip Rainbow", quantity: 2 }],
    shippingAddress: "111 Birch St, Manila",
  },
];

// ─── Helper: status badge color ───────────────────────────
const statusBadgeClasses: Record<OrderStatus, string> = {
  to_pay: "bg-yellow-100 text-yellow-800 border-yellow-300",
  to_ship: "bg-blue-100 text-blue-800 border-blue-300",
  to_receive: "bg-orange-100 text-orange-800 border-orange-300",
  completed: "bg-green-100 text-green-800 border-green-300",
  cancelled: "bg-red-100 text-red-800 border-red-300",
};

const statusLabel: Record<OrderStatus, string> = {
  to_pay: "To Pay",
  to_ship: "To Ship",
  to_receive: "To Receive",
  completed: "Completed",
  cancelled: "Cancelled",
};

// ─── Component ────────────────────────────────────────────
const MyPurchases = () => {
  const [activeTab, setActiveTab] = useState<OrderStatus>("to_pay");

  const filteredOrders = MOCK_ORDERS.filter(
    (order) => order.status === activeTab,
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">My Purchases</h1>
        <p className="text-sm text-muted-foreground mt-1">
          View and track your orders
        </p>
      </div>

      {/* Status Tabs */}
      <div className="mb-6 overflow-x-auto -mx-4 px-4">
        <div className="flex gap-2 min-w-max" role="tablist">
          {ORDER_STATUS_TABS.map(({ status, label }) => (
            <button
              key={status}
              role="tab"
              aria-selected={activeTab === status}
              onClick={() => setActiveTab(status)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-colors border",
                activeTab === status
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:border-primary/50",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">
          No orders with this status yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-card border rounded-xl p-5 shadow-sm hover:shadow transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs text-muted-foreground font-mono">
                    {order.id.toUpperCase()}
                  </p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {order.orderDate}
                  </p>
                </div>
                <span
                  className={cn(
                    "text-xs font-semibold px-2.5 py-1 rounded-full border",
                    statusBadgeClasses[order.status],
                  )}
                >
                  {statusLabel[order.status]}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <p className="text-sm">
                  {order.items.length}{" "}
                  {order.items.length === 1 ? "item" : "items"}
                </p>
                <ul className="text-xs text-muted-foreground space-y-0.5">
                  {order.items.map((item, idx) => (
                    <li key={idx}>
                      {item.name} × {item.quantity}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex justify-between items-end border-t pt-3">
                <p className="text-sm text-muted-foreground">
                  {order.shippingAddress}
                </p>
                <p className="font-semibold text-primary">
                  {formatPriceCents(order.totalCents)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyPurchases;
