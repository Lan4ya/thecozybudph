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
  Calendar,
} from "lucide-react";
import { MetaBadge } from "@/components/MetaBadge";
import { ProgressiveImage } from "@/components/ProgressiveImage";
import { format } from "date-fns";

export type QueryOrderRes = {
  id: string;
  paymentId: string;
  status: "toPay" | "toShip" | "toReceive" | "fulfilled" | "cancelled";
  totalCents: number;
  expiresAt: Date;
  createdAt: Date;
  items: {
    id: string;
    quantity: number;
    name: string;
    category: string;
    primaryImageUrl: string;
    variantAttributes: Record<string, string>;
    priceCents: number;
  }[];
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
  const { items } = order;

  return (
    <Link
      to={`/profile/my-purchases/order/${order.id}`}
      className="group block overflow-hidden rounded-4xl border bg-card shadow-sm transition-all hover:border-primary/40 hover:shadow-md active:scale-[0.99]"
    >
      <div className="flex flex-col h-full">
        {/* Header: Order ID & Status */}
        <div className="flex items-center justify-between p-5 border-b border-border/30 bg-muted/5">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">
              <Calendar className="h-3 w-3" />
              <span>{format(order.createdAt, "MMM d, yyyy")}</span>
            </div>
            <p className="text-[10px] font-mono text-muted-foreground/50">
              #{order.id.slice(-6).toUpperCase()}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider",
                status.badge,
              )}
            >
              <StatusIcon className="h-3 w-3" />
              {status.label}
            </div>
            {order.status === "toPay" && (
              <div className="flex items-center gap-1 text-[9px] font-bold text-yellow-600 uppercase tracking-tighter">
                <Clock className="h-2.5 w-2.5" />
                <span>Expires {format(order.expiresAt, "h:mm a")}</span>
              </div>
            )}
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 p-5 space-y-4">
          {items.map((item, idx) => (
            <div
              key={item.id}
              className={cn(
                "flex gap-4",
                idx > 0 && "pt-4 border-t border-border/20",
              )}
            >
              {/* Item Image */}
              <div className="relative size-20 shrink-0 overflow-hidden rounded-xl border bg-primary/5">
                {item.primaryImageUrl ? (
                  <ProgressiveImage
                    src={item.primaryImageUrl}
                    isEager={true}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-muted">
                    <Package className="h-6 w-6 text-muted-foreground/40" />
                  </div>
                )}
              </div>

              {/* Item Details */}
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <h3 className="font-bold text-sm lg:text-base line-clamp-1">
                  {item.name}
                </h3>
                <div className="mt-1 flex flex-wrap gap-1">
                  {Object.entries(item.variantAttributes).map(([key, val]) => (
                    <MetaBadge
                      key={key}
                      label={key}
                      value={val}
                      className="px-1 py-0 text-xs lg:text-sm"
                    />
                  ))}
                </div>
                <p className="mt-1 text-xs lg:text-sm text-muted-foreground font-medium">
                  Qty: {item.quantity} × {formatPriceCents(item.priceCents)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer: Total & CTA */}
        <div className="mt-auto border-t border-border/30">
          <div className="flex items-center justify-between p-5">
            <div className="flex flex-col">
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                Order Total
              </p>
              <p className="text-md font-black text-primary leading-none mt-1">
                {formatPriceCents(order.totalCents)}
              </p>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold text-primary/70 uppercase tracking-widest group-hover:text-primary transition-colors">
              Details
              <ChevronRight className="size-4" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
