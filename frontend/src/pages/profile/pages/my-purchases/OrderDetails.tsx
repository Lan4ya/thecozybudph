import { useParams, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { OrderAPI } from "@/api";
import { FlowerSpinner } from "@/components/RouteLoaderSpinner";
import { Button } from "@/lib/ui/__shadcn__/button";
import { formatPriceCents } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { MetaBadge } from "@/components/MetaBadge";
import ShipmentManagement from "../admin-dashboard/pages/orders/components/ShipmentManagement";
import {
  ChevronRight,
  MapPin,
  Package,
  Truck,
  CreditCard,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Tag,
} from "lucide-react";

const statusConfig = {
  toPay: {
    label: "To Pay",
    icon: Clock,
    color: "text-yellow-600 bg-yellow-50 border-yellow-200",
    description: "Waiting for payment confirmation.",
  },
  toShip: {
    label: "To Ship",
    icon: Package,
    color: "text-blue-600 bg-blue-50 border-blue-200",
    description: "Your order is being prepared for shipment.",
  },
  toReceive: {
    label: "To Receive",
    icon: Truck,
    color: "text-orange-600 bg-orange-50 border-orange-200",
    description: "Your order is on its way to you.",
  },
  fulfilled: {
    label: "Completed",
    icon: CheckCircle2,
    color: "text-green-600 bg-green-50 border-green-200",
    description: "Order has been successfully delivered.",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    color: "text-red-600 bg-red-50 border-red-200",
    description: "This order has been cancelled.",
  },
} as const;

const OrderDetails = () => {
  const { itemId } = useParams<{ itemId: string }>();
  const navigate = useNavigate();

  const {
    data: orderItem,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["order-item", itemId],
    queryFn: () => OrderAPI.getOrderItem(itemId!),
    enabled: !!itemId,
  });

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex-center">
        <FlowerSpinner />
      </div>
    );
  }

  if (error || !orderItem) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <h2 className="text-2xl font-bold">Failed to load order item</h2>
        <p className="mt-2 text-muted-foreground">
          We couldn't find the item you're looking for.
        </p>
        <Button
          onClick={() => navigate("/profile/my-purchases")}
          className="mt-6 rounded-full"
        >
          Back to Purchases
        </Button>
      </div>
    );
  }

  const status = statusConfig[orderItem.status];
  const StatusIcon = status.icon;

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-8">
      {/* Status Header - Compact & Refined */}
      <section className={cn("rounded-2xl border p-5", status.color)}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider opacity-80 mb-1">
              <StatusIcon className="h-3.5 w-3.5 shrink-0" />
              {status.label}
            </div>
            <h1 className="text-lg md:text-xl font-medium tracking-tight leading-snug">
              Order #{orderItem.id.slice(-6).toUpperCase()}
            </h1>
            <p className="mt-1 text-xs opacity-85 leading-relaxed">
              {status.description}
            </p>
          </div>
        </div>
      </section>

      {/* Product & Payment Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Product Card - Left */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border bg-card overflow-hidden">
            <div className="flex flex-col sm:flex-row gap-5 p-5">
              {/* Image */}
              <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl border bg-primary/5">
                <img
                  src={orderItem.primaryImageUrl}
                  alt={orderItem.name}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Product Info */}
              <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                <div className="space-y-2">
                  {/* Category */}
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary/70">
                    <Tag className="h-3 w-3 shrink-0" />
                    <span className="truncate">{orderItem.category}</span>
                  </div>

                  {/* Product Name & Collection */}
                  <div>
                    <h2 className="text-base font-medium leading-snug">
                      {orderItem.name}
                    </h2>
                    {orderItem.collection && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {orderItem.collection}
                      </p>
                    )}
                  </div>

                  {/* Variants */}
                  {Object.keys(orderItem.variantAttributes).length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {Object.entries(orderItem.variantAttributes).map(
                        ([key, val]) => (
                          <MetaBadge
                            key={key}
                            label={key}
                            value={val}
                            className="text-xs px-2 py-0.5"
                          />
                        ),
                      )}
                    </div>
                  )}

                  {/* Card Messages */}
                  {orderItem.cardMessages.length > 0 && (
                    <div className="pt-2 border-t border-border/50 mt-2">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1">
                        Messages
                      </p>
                      <div className="space-y-0.5">
                        {orderItem.cardMessages.map((msg, i) => (
                          <p
                            key={i}
                            className="text-xs italic text-foreground/80"
                          >
                            "{msg}"
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Price */}
                <div className="flex items-end justify-between gap-4 mt-3 pt-3 border-t border-border/50">
                  <div>
                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
                      Qty: {orderItem.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-0.5">
                      Total Item
                    </p>
                    <p className="text-lg font-bold text-primary">
                      {formatPriceCents(
                        orderItem.priceCents * orderItem.quantity,
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Summary - Right */}
        <section>
          <div className="rounded-2xl border-2 border-primary/10 bg-card p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
              Order Summary
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">
                  {formatPriceCents(orderItem.subtotalCents)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium">
                  {formatPriceCents(orderItem.shippingCents)}
                </span>
              </div>
              {orderItem.discountCents > 0 && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Discount</span>
                  <span>-{formatPriceCents(orderItem.discountCents)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Service Fee</span>
                <span className="font-medium">
                  {formatPriceCents(orderItem.passOnFee)}
                </span>
              </div>
              <div className="pt-2 border-t border-primary/10 mt-3 flex justify-between items-baseline">
                <span className="text-xs font-bold text-foreground">Total</span>
                <span className="text-xl font-bold text-primary">
                  {formatPriceCents(orderItem.totalCents)}
                </span>
              </div>
            </div>

            {orderItem.status === "toPay" && (
              <Button className="mt-4 w-full rounded-lg py-2.5 text-xs font-bold">
                <CreditCard className="mr-2 h-3.5 w-3.5" />
                Pay Now
              </Button>
            )}
          </div>
        </section>
      </div>

      {/* Address & Service */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Delivery Address */}
        <section>
          <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
            <MapPin className="h-4 w-4 text-primary" />
            Delivery
          </h2>
          <div className="rounded-2xl border bg-card p-5 space-y-2.5">
            <div>
              <p className="text-xs text-primary font-bold mb-1">
                {orderItem.address.fullName}
              </p>
              <p className="text-xs text-muted-foreground">
                {orderItem.address.phoneNumber}
              </p>
            </div>
            <div className="text-xs text-foreground space-y-1 border-t border-border/50 pt-2.5">
              <p>{orderItem.address.addressLine}</p>
              <p>
                {orderItem.address.barangay}, {orderItem.address.city}
              </p>
              <p>
                {orderItem.address.province}, {orderItem.address.region}{" "}
                {orderItem.address.postalCode}
              </p>
            </div>
          </div>
        </section>

        {/* Service Details */}
        <section>
          <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
            <Truck className="h-4 w-4 text-primary" />
            Service
          </h2>
          <div className="rounded-2xl border bg-card p-5 space-y-3">
            <MetaBadge
              label="Method"
              value={orderItem.serviceType}
              className="text-xs px-2 py-1"
            />
            <div className="rounded-lg bg-primary/5 p-3 border border-primary/10 flex items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/5 border border-primary/20">
                <Truck className="h-3.5 w-3.5 text-primary" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-primary leading-tight">
                  Standard Delivery
                </p>
                <p className="text-primary/70">1–3 business days</p>
              </div>
            </div>

            {/* Help */}
            <div className="rounded-lg bg-primary/5 p-3 border border-primary/10">
              <p className="text-xs font-bold text-primary flex items-center gap-1.5 mb-1">
                <AlertCircle className="h-3.5 w-3.5" />
                Questions?
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                Contact us with your Order ID.
              </p>
              <Button
                variant="link"
                className="px-0 h-auto text-xs font-bold p-0"
              >
                Get Help <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </div>
        </section>
      </div>

      {/* Admin Shipment Management */}
      <ShipmentManagement orderItem={orderItem} />
    </div>
  );
};

export default OrderDetails;
