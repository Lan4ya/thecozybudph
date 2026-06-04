import { useNavigate, useLoaderData } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { OrderAPI } from "@/api";
import { RouteLoaderFlowerSpinner } from "@/components/RouteLoaderSpinner";
import { Button } from "@/lib/ui/__shadcn__/button";
import { formatPriceCents } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { MetaBadge } from "@/components/MetaBadge";
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
import { ProgressiveImage } from "@/components/ProgressiveImage";
import { EmptyOrErrorState } from "@/components/EmptyOrErrorState";
import { useState, useEffect } from "react";
import { intervalToDuration, isPast } from "date-fns";
import { usePaymentStore } from "@/store/usePaymentStore";

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
  const orderId = useLoaderData<string>();

  const {
    data: order,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => OrderAPI.getOrderWithItems(orderId!),
    enabled: !!orderId,
  });

  const [timeLeft, setTimeLeft] = useState<string | null>(null);

  useEffect(() => {
    if (order?.status !== "toPay" || !order.expiresAt) {
      setTimeLeft(null);
      return;
    }

    const updateTicker = () => {
      if (isPast(order.expiresAt!)) {
        setTimeLeft("00:00:00");
        return;
      }

      const duration = intervalToDuration({
        start: new Date(),
        end: order.expiresAt!,
      });

      const hours = String(duration.hours ?? 0).padStart(2, "0");
      const minutes = String(duration.minutes ?? 0).padStart(2, "0");
      const seconds = String(duration.seconds ?? 0).padStart(2, "0");

      setTimeLeft(`${hours}:${minutes}:${seconds}`);
    };

    updateTicker();
    const interval = setInterval(updateTicker, 1000);
    return () => clearInterval(interval);
  }, [order?.status, order?.expiresAt]);

  const navi = useNavigate();

  const handlePayNow = () => {
    if (!order) return;
    usePaymentStore.getState().setWillPay(true);

    navi(`/payment/${order.paymentId}/confirm`, {
      state: {
        orderId: order.id,
      },
    });
  };

  if (isLoading) {
    return <RouteLoaderFlowerSpinner />;
  }

  if (error || !order) {
    if (error?.status === 404) {
      return (
        <EmptyOrErrorState
          title={"Order not found"}
          description="We couldn't find the order you're looking for."
        />
      );
    }
    throw error;
  }

  const status = statusConfig[order.status];
  const StatusIcon = status.icon;

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-8">
      <section className={cn("rounded-2xl border p-5", status.color)}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider opacity-80 mb-1">
              <StatusIcon className="h-3.5 w-3.5 shrink-0" />
              {status.label}
            </div>
            <h1 className="text-lg md:text-xl font-medium tracking-tight leading-snug">
              Order #{order.id.slice(-6).toUpperCase()}
            </h1>
            <p className="mt-1 text-xs opacity-85 leading-relaxed">
              {status.description}
            </p>
          </div>

          {timeLeft && (
            <div className="flex flex-col items-end shrink-0">
              <span className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">
                Expires In
              </span>
              <div className="bg-white/40 backdrop-blur-sm rounded-xl px-3 py-1.5 border border-white/20 shadow-sm flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 animate-pulse" />
                <span className="font-mono text-lg font-black tracking-tighter tabular-nums">
                  {timeLeft}
                </span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Product & Payment Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Product Items - Left */}
        <div className="lg:col-span-2 space-y-4">
          {order.items.map((item) => (
            <div
              key={item.orderId}
              className="rounded-2xl border bg-card overflow-hidden"
            >
              <div className="flex flex-col sm:flex-row gap-5 p-5">
                {/* Image */}
                <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl border bg-primary/5">
                  <ProgressiveImage
                    src={item.primaryImageUrl}
                    isEager={true}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                  <div className="space-y-2">
                    {/* Category */}
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary/70">
                      <Tag className="h-3 w-3 shrink-0" />
                      <span className="truncate">{item.category}</span>
                    </div>

                    {/* Product Name & Collection */}
                    <div>
                      <h2 className="text-base font-medium leading-snug">
                        {item.name}
                      </h2>
                      {item.collection && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {item.collection}
                        </p>
                      )}
                    </div>

                    {/* Variants */}
                    {Object.keys(item.variantAttributes).length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {Object.entries(item.variantAttributes).map(
                          ([key, val]) => (
                            <MetaBadge
                              key={key}
                              label={key}
                              value={val as string}
                              className="text-xs px-2 py-0.5"
                            />
                          ),
                        )}
                      </div>
                    )}

                    {/* Card Messages */}
                    {item.cardMessages.length > 0 && (
                      <div className="pt-2 border-t border-border/50 mt-2">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1">
                          Messages
                        </p>
                        <div className="space-y-0.5">
                          {item.cardMessages.map((msg, i) => (
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
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-0.5">
                        Item Total
                      </p>
                      <p className="text-lg font-bold text-primary">
                        {formatPriceCents(item.priceCents * item.quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
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
                  {formatPriceCents(order.subtotalCents)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium">
                  {formatPriceCents(order.shippingCents)}
                </span>
              </div>
              {order.discountCents > 0 && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Discount</span>
                  <span>-{formatPriceCents(order.discountCents)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Service Fee</span>
                <span className="font-medium">
                  {formatPriceCents(order.passOnFee)}
                </span>
              </div>
              <div className="pt-2 border-t border-primary/10 mt-3 flex justify-between items-baseline">
                <span className="text-xs font-bold text-foreground">Total</span>
                <span className="text-xl font-bold text-primary">
                  {formatPriceCents(order.totalCents)}
                </span>
              </div>
            </div>

            {order.status === "toPay" && (
              <Button
                onClick={handlePayNow}
                className="mt-4 w-full rounded-lg py-2.5 text-xs font-bold"
              >
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
                {order.address.fullName}
              </p>
              <p className="text-xs text-muted-foreground">
                {order.address.phoneNumber}
              </p>
            </div>
            <div className="text-xs text-foreground space-y-1 border-t border-border/50 pt-2.5">
              <p>{order.address.addressLine}</p>
              <p>
                {order.address.barangay}, {order.address.city}
              </p>
              <p>
                {order.address.province}, {order.address.region}{" "}
                {order.address.postalCode}
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
              value={order.serviceType}
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
    </div>
  );
};

export default OrderDetails;
