import { Link } from "react-router";
import { cn } from "@/lib/utils/cn";
import { formatPriceCents } from "@/lib/utils/format";
import {
  Package,
  Truck,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Tag,
} from "lucide-react";
import { MetaBadge } from "@/components/MetaBadge";

export type QueryOrderRes = {
  id: string;
  status: "toPay" | "toShip" | "toReceive" | "fulfilled" | "cancelled";
  totalCents: number;
  expiresAt: Date;
  item: {
    id: string;
    quantity: number;
    name: string;
    category: string;
    primaryImageUrl: string;
    variantAttributes: Record<string, string>;
    priceCents: number;
  };
};

export const statusConfig = {
  toPay: {
    label: "To Pay",
    icon: Clock,
    color: "text-yellow-600 bg-yellow-50 border-yellow-200",
    badge: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  toShip: {
    label: "To Ship",
    icon: Package,
    color: "text-blue-600 bg-blue-50 border-blue-200",
    badge: "bg-blue-100 text-blue-800 border-blue-200",
  },
  toReceive: {
    label: "To Receive",
    icon: Truck,
    color: "text-orange-600 bg-orange-50 border-orange-200",
    badge: "bg-orange-100 text-orange-800 border-orange-200",
  },
  fulfilled: {
    label: "Completed",
    icon: CheckCircle2,
    color: "text-green-600 bg-green-50 border-green-200",
    badge: "bg-green-100 text-green-800 border-green-200",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    color: "text-red-600 bg-red-50 border-red-200",
    badge: "bg-red-100 text-red-800 border-red-200",
  },
} as const;

export function OrderCard({ order }: { order: QueryOrderRes }) {
  const status = statusConfig[order.status];
  const StatusIcon = status.icon;
  const { item } = order;

  return (
    <Link
      to={`/profile/my-purchases/item/${item.id}`}
      className="group block overflow-hidden rounded-3xl border bg-card shadow-sm transition-all hover:border-primary/40 hover:shadow-md active:scale-[0.99]"
    >
      <div className="flex flex-col h-full">
        {/* Header: Category & Status */}
        <div className="flex items-center justify-between p-4 border-b border-border/30 ">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary/80">
            <Tag className="h-3 w-3" />
            <span>{item.category}</span>
          </div>
          <div
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider",
              status.badge,
            )}
          >
            <StatusIcon className="h-3 w-3" />
            {status.label}
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 gap-4 p-5">
          {/* Order Image */}
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border bg-primary/5">
            {item.primaryImageUrl ? (
              <img
                src={item.primaryImageUrl}
                alt={item.name}
                className="h-full w-full object-cover transition-transform"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted">
                <Package className="h-8 w-8 text-muted-foreground/40" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 flex flex-col py-0.5">
            <div className="space-y-1.5">
              <h3 className="font-bold text-sm line-clamp-2 leading-tight">
                {item.name}
              </h3>

              {Object.keys(item.variantAttributes).length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(item.variantAttributes).map(([key, val]) => (
                    <MetaBadge
                      key={key}
                      label={key}
                      value={val}
                      className="px-1.5 py-0 text-[9px]"
                    />
                  ))}
                </div>
              )}

              <p className="text-xs text-muted-foreground font-medium">
                Qty: {item.quantity} × {formatPriceCents(item.priceCents)}
              </p>
            </div>

            <div className="mt-auto pt-4 flex items-end justify-between">
              <div className="flex flex-col">
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                  Total
                </p>
                <p className="text-xl font-black text-primary leading-none">
                  {formatPriceCents(order.totalCents)}
                </p>
              </div>
              <p className="text-[10px] font-mono text-muted-foreground/50">
                #{order.id.slice(-6).toUpperCase()}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Hint */}
        <div className="flex items-center justify-between px-5 py-3 bg-primary/2 text-[10px] font-bold text-primary/70 uppercase tracking-widest border-t border-primary/5 group-hover:bg-primary/5 transition-colors">
          <span className="opacity-0 group-hover:opacity-100 transition-opacity">
            View Order
          </span>
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}
