import { useParams, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { OrderAPI } from "@/api";
import { FlowerSpinner } from "@/components/RouteLoaderSpinner";
import { Button } from "@/lib/ui/__shadcn__/button";
import { formatPriceCents } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { 
  ArrowLeft, 
  ChevronRight, 
  MapPin, 
  Package, 
  Truck, 
  CreditCard, 
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle
} from "lucide-react";

const statusConfig = {
  toPay: {
    label: "To Pay",
    icon: Clock,
    color: "text-yellow-600 bg-yellow-50 border-yellow-200",
    description: "Waiting for payment confirmation."
  },
  toShip: {
    label: "To Ship",
    icon: Package,
    color: "text-blue-600 bg-blue-50 border-blue-200",
    description: "Your order is being prepared for shipment."
  },
  toReceive: {
    label: "To Receive",
    icon: Truck,
    color: "text-orange-600 bg-orange-50 border-orange-200",
    description: "Your order is on its way to you."
  },
  fulfilled: {
    label: "Completed",
    icon: CheckCircle2,
    color: "text-green-600 bg-green-50 border-green-200",
    description: "Order has been successfully delivered."
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    color: "text-red-600 bg-red-50 border-red-200",
    description: "This order has been cancelled."
  }
} as const;

const OrderDetails = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  const { data: order, isLoading, error } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => OrderAPI.getOrder(orderId!),
    enabled: !!orderId,
  });

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex-center">
        <FlowerSpinner />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <h2 className="text-2xl font-bold">Failed to load order</h2>
        <p className="mt-2 text-muted-foreground">
          We couldn't find the order you're looking for.
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

  const status = statusConfig[order.status];
  const StatusIcon = status.icon;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:px-6 lg:py-12">
      <button 
        onClick={() => navigate("/profile/my-purchases")}
        className="group mb-8 flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Back to Purchases
      </button>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Order Status Header */}
          <section className={cn("rounded-3xl border p-6 md:p-8", status.color)}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-xs opacity-80">
                  <StatusIcon className="h-4 w-4" />
                  {status.label}
                </div>
                <h1 className="mt-2 text-2xl font-bold md:text-3xl">
                  Order #{order.id.slice(-8).toUpperCase()}
                </h1>
                <p className="mt-2 text-sm font-medium opacity-90">
                  {status.description}
                </p>
              </div>
            </div>
          </section>

          {/* Items Section */}
          <section className="space-y-4">
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <Package className="h-5 w-5 text-primary" />
              Order Items ({order.items.length})
            </h2>
            <div className="divide-y rounded-3xl border bg-card">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4 p-4 md:p-6">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border bg-primary/5 md:h-24 md:w-24">
                    <img 
                      src={item.primaryImageUrl} 
                      alt={item.name} 
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-between py-1">
                    <div>
                      <h3 className="font-semibold text-sm md:text-base leading-tight">
                        {item.name}
                      </h3>
                      {item.variantAttributes && (
                        <p className="mt-1 text-xs text-muted-foreground font-medium">
                          {Object.entries(item.variantAttributes as Record<string, string>)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(", ")}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-sm font-medium">
                        {formatPriceCents(item.priceCents)} × {item.quantity}
                      </p>
                      <p className="font-bold text-primary">
                        {formatPriceCents(item.priceCents * item.quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Shipping Address */}
          <section className="space-y-4">
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <MapPin className="h-5 w-5 text-primary" />
              Delivery Address
            </h2>
            <div className="rounded-3xl border bg-card p-6 md:p-8">
              <div className="space-y-1">
                <p className="font-bold text-lg text-primary">{order.address.fullName}</p>
                <p className="text-foreground font-medium">{order.address.phoneNumber}</p>
                <div className="mt-4 space-y-0.5 text-sm text-muted-foreground font-medium">
                  <p>{order.address.addressLine}</p>
                  <p>{order.address.barangay}, {order.address.city}</p>
                  <p>{order.address.province}, {order.address.region}</p>
                  <p>{order.address.postalCode}</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Order Summary */}
          <section className="space-y-4">
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <Receipt className="h-5 w-5 text-primary" />
              Payment Summary
            </h2>
            <div className="rounded-3xl border-2 border-primary/10 bg-card p-6 shadow-sm">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-muted-foreground font-medium">
                  <span>Subtotal</span>
                  <span className="font-bold text-foreground">
                    {formatPriceCents(order.subtotalCents)}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground font-medium">
                  <span>Shipping Fee</span>
                  <span className="font-bold text-foreground">
                    {formatPriceCents(order.shippingCents)}
                  </span>
                </div>
                {order.discountCents > 0 && (
                  <div className="flex justify-between text-green-600 font-bold">
                    <span>Discount</span>
                    <span>
                      -{formatPriceCents(order.discountCents)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground font-medium">
                  <span>Service Fee</span>
                  <span className="font-bold text-foreground">
                    {formatPriceCents(order.passOnFee)}
                  </span>
                </div>
                <div className="my-4 border-t-2 border-dashed border-primary/10 pt-4 flex justify-between items-end">
                  <span className="font-black text-base">Total</span>
                  <span className="text-2xl font-black text-primary">
                    {formatPriceCents(order.totalCents)}
                  </span>
                </div>
              </div>

              {order.status === "toPay" && (
                <Button className="mt-6 w-full rounded-full py-6 font-bold text-base shadow-lg shadow-primary/20">
                  <CreditCard className="mr-2 h-5 w-5" />
                  Pay Now
                </Button>
              )}
            </div>
          </section>

          {/* Delivery Details */}
          <section className="space-y-4">
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <Truck className="h-5 w-5 text-primary" />
              Service Details
            </h2>
            <div className="rounded-3xl border bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-muted-foreground font-medium">Delivery Method</span>
                <span className="text-sm font-bold uppercase text-primary">{order.serviceType}</span>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-primary/5 p-4 border border-primary/10">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-background border-2 border-primary/20 shadow-sm">
                  <Truck className="h-5 w-5 text-primary" />
                </div>
                <div className="text-xs">
                  <p className="font-bold text-primary">Standard Delivery</p>
                  <p className="text-primary/60 mt-0.5 font-medium">Estimated delivery in 1-3 business days.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Timeline / Info */}
          <div className="rounded-3xl bg-primary/5 p-6 border border-primary/10">
            <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-primary" />
              Need help?
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              If you have any questions about your order, please contact our support team with your Order ID.
            </p>
            <Button variant="link" className="px-0 h-auto text-xs font-bold mt-2">
              Contact Support <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
