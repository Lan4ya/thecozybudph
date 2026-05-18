import { cn } from "@/lib/utils/cn";
import type { OrderStatus } from "@cozybud/schemas";

const statusMap: Record<OrderStatus, { label: string; className: string }> = {
  toPay: {
    label: "To Pay",
    className: "bg-amber-100 text-amber-800 border border-amber-200",
  },

  paid: {
    label: "Paid",
    className: "bg-teal-100 text-teal-800 border border-teal-200",
  },

  toShip: {
    label: "To Ship",
    className: "bg-blue-100 text-blue-800 border border-blue-200",
  },

  shipped: {
    label: "Shipped",
    className: "bg-indigo-100 text-indigo-800 border border-indigo-200",
  },

  toReceive: {
    label: "To Receive",
    className: "bg-violet-100 text-violet-800 border border-violet-200",
  },

  fulfilled: {
    label: "Fulfilled",
    className: "bg-emerald-200 text-emerald-800 border border-emerald-200",
  },

  cancelled: {
    label: "Cancelled",
    className: "bg-rose-100 text-rose-800 border border-rose-200",
  },

  expired: {
    label: "Expired",
    className: "bg-slate-100 text-slate-600 border border-slate-200",
  },
};

type Props = {
  status: OrderStatus;
};

export function StatusBadge({ status }: Props) {
  const map = statusMap[status];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        map.className,
      )}
    >
      {map.label}
    </span>
  );
}
