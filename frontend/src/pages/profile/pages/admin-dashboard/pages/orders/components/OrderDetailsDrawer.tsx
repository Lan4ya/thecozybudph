import type { AdminOrderListItem } from "@cozybud/schemas";
import type { LucideIcon } from "lucide-react";
import { ProductImage } from "@/components/products/ProductImage";
import { Button } from "@/lib/ui/__shadcn__/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/lib/ui/__shadcn__/drawer";
import { formatPriceCents } from "@/lib/utils/format";
import { StatusBadge } from "./StatusBadge";
import { getOrderItemCount } from "./OrdersTable";
import { useToast } from "@/providers/ToastProvider";
import { AdminAPI } from "@/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/providers/TanstackQueryProvider";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
  MapPin,
  Package,
  RotateCw,
  Truck,
  XCircle,
} from "lucide-react";
import { Spinner } from "@/lib/ui/__shadcn__/spinner";
import { cn } from "@/lib/utils/cn";
import { useAdminOrdersPageState } from "../hooks/useAdminOrdersPageState";
import { ProgressiveImage } from "@/components/ProgressiveImage";
import { useAdminOrdersQuery } from "../hooks/useAdminOrdersQuery";
import { useState, useLayoutEffect } from "react";

type OrderDetailsDrawerProps = {
  orderId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const SHIPMENT_STATUS_MAP: Record<
  string,
  { label: string; className: string; icon: LucideIcon }
> = {
  ASSIGNING_DRIVER: {
    label: "Assigning Driver",
    className: "bg-blue-100 text-blue-800 border-blue-200",
    icon: Clock,
  },
  ON_GOING: {
    label: "Ongoing",
    className: "bg-blue-100 text-blue-800 border-blue-200",
    icon: Truck,
  },
  PICKED_UP: {
    label: "Picked Up",
    className: "bg-indigo-100 text-indigo-800 border-indigo-200",
    icon: Package,
  },
  COMPLETED: {
    label: "Completed",
    className: "bg-emerald-100 text-emerald-800 border-emerald-200",
    icon: CheckCircle2,
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-rose-100 text-rose-800 border-rose-200",
    icon: XCircle,
  },
  REJECTED: {
    label: "Rejected",
    className: "bg-rose-100 text-rose-800 border-rose-200",
    icon: AlertCircle,
  },
  EXPIRED: {
    label: "Expired",
    className: "bg-slate-100 text-slate-800 border-slate-200",
    icon: Clock,
  },
};

const POD_STATUS_MAP: Record<string, { label: string; className: string }> = {
  PENDING: { label: "Pending", className: "bg-slate-100 text-slate-600" },
  DELIVERED: {
    label: "Delivered",
    className: "bg-emerald-100 text-emerald-700",
  },
  SIGNED: { label: "Signed", className: "bg-emerald-100 text-emerald-700" },
  FAILED: { label: "Failed", className: "bg-rose-100 text-rose-700" },
};

function formatDate(dateVal: Date | string | null | undefined) {
  if (!dateVal) return "N/A";
  const date = typeof dateVal === "string" ? new Date(dateVal) : dateVal;
  if (isNaN(date.getTime())) return "N/A";

  return date.toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function formatAddress(order: AdminOrderListItem) {
  const { addressLine, barangay, city, province, region, postalCode } =
    order.address;

  return [addressLine, barangay, city, province, region, postalCode]
    .filter(Boolean)
    .join(", ");
}

export function OrderDetailsDrawer({
  orderId,
  open,
  onOpenChange,
}: OrderDetailsDrawerProps) {
  const { addToast } = useToast();
  const { query } = useAdminOrdersPageState();
  const { queryKey: adminOrdersQK } = useAdminOrdersQuery(query);

  const [isPollingCancellation, setIsPollingCancellation] = useState(false);
  const [animationCompleted, setAnimationCompleted] = useState(false);

  useLayoutEffect(() => {
    if (!open) {
      return;
    }

    const timer = setTimeout(() => {
      setAnimationCompleted(true);
    }, 300);

    return () => {
      clearTimeout(timer);
      setAnimationCompleted(false);
    };
  }, [open]);

  const { data: order, isLoading: isLoadingOrder } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => AdminAPI.getOrder(orderId!),
    enabled: open && !!orderId && animationCompleted,
    meta: { persist: true },
  });

  const {
    data: shipment,
    isLoading: isLoadingShipment,
    refetch: refetchShipment,
    isFetching: isFetchingShipment,
  } = useQuery({
    queryKey: ["shipment", order?.id],
    queryFn: () => AdminAPI.getShipmentOrder(order!.id),
    enabled: open && !!order?.id && animationCompleted,
    meta: { persist: true },
  });

  const { mutate: shipOrder, isPending: isShipping } = useMutation({
    mutationFn: () => {
      if (!order?.id)
        throw new Error("Order ID is required to create shipment");

      return AdminAPI.createShipmentOrder(
        {
          remarks: "Handle with care - shipped from order details drawer",
        },
        order?.id,
      );
    },
    onSuccess: (_shipment) => {
      console.log({ adminOrdersQK });

      addToast("Shipment booked!", "success");

      queryClient.invalidateQueries({
        queryKey: ["order", orderId],
      });
      queryClient.invalidateQueries({
        queryKey: ["shipment", order?.id],
      });
      queryClient.invalidateQueries({ queryKey: adminOrdersQK });
    },
    onError: (err) => {
      addToast(err?.message || "Failed to book shipment", "error");
    },
  });

  const { mutate: cancelShipment, isPending: isCancelling } = useMutation({
    mutationFn: async () => {
      if (!order?.id)
        throw new Error("Order ID is required to create shipment");

      return await AdminAPI.cancelShipmentOrder(order?.id);
    },
    onSuccess: () => {
      addToast("Cancellation request sent, please wait a moment", "info");

      queryClient.invalidateQueries({ queryKey: ["shipment", order?.id] });
      setIsPollingCancellation(true);

      // Poll 5 times, 5sec interval
      let count = 0;
      const interval = setInterval(async () => {
        count++;
        const { data: updated } = await refetchShipment();

        if (updated?.shipmentStatus === "CANCELLED" || count >= 5) {
          clearInterval(interval);

          // Refetch order/s if shipment successfully transitioned to CANCELLED
          queryClient.invalidateQueries({
            queryKey: ["order", orderId],
          });
          queryClient.invalidateQueries({ queryKey: adminOrdersQK });
          setIsPollingCancellation(false);
        }
      }, 5000);
    },
    onError: (err) => {
      addToast(err?.message || "Failed to cancel shipment", "error");
    },
  });

  const shipmentStatus =
    shipment && order
      ? SHIPMENT_STATUS_MAP[shipment.shipmentStatus ?? ""] || {
          label: shipment.shipmentStatus || "N/A",
          className: "bg-slate-100 text-slate-800 border-slate-200",
          icon: Package,
        }
      : null;

  const isActuallyLoading = !animationCompleted || isLoadingOrder;

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent
        data-vaul-no-drag
        className="data-[vaul-drawer-direction=right]:h-full data-[vaul-drawer-direction=right]:w-full data-[vaul-drawer-direction=right]:max-w-none sm:data-[vaul-drawer-direction=right]:max-w-none md:data-[vaul-drawer-direction=right]:w-176 md:data-[vaul-drawer-direction=right]:max-w-176 bg-card"
      >
        {isActuallyLoading ? (
          <div className="flex h-full items-center justify-center">
            <Spinner className="size-8" />
          </div>
        ) : !order ? null : (
          <>
            <DrawerHeader className="border-b">
              <div className="flex items-center select-text justify-between gap-4">
                <div>
                  <DrawerTitle>Order Details</DrawerTitle>
                  <p className="mt-1 font-mono text-xs text-muted-foreground">
                    {order.id}
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onOpenChange(false)}
                >
                  Close
                </Button>
              </div>
            </DrawerHeader>

            <div className="space-y-6 overflow-y-auto select-text p-4 pb-8 md:p-6 md:pb-10">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-md border bg-background p-3">
                  <div className="text-xs text-muted-foreground">Status</div>
                  <div className="mt-1">
                    <StatusBadge status={order.status} />
                  </div>
                </div>
                <div className="rounded-md border bg-background p-3">
                  <div className="text-xs text-muted-foreground">Total</div>
                  <div className="text-primary mt-1 text-lg font-semibold">
                    {formatPriceCents(order.totalCents)}
                  </div>
                </div>
                <div className="rounded-md border bg-background p-3">
                  <div className="text-xs text-muted-foreground">Created</div>
                  <div className="mt-1 text-sm">
                    {formatDate(order.createdAt)}
                  </div>
                </div>
                <div className="rounded-md border bg-background p-3">
                  <div className="text-xs text-muted-foreground">Updated</div>
                  <div className="mt-1 text-sm">
                    {formatDate(order.updatedAt)}
                  </div>
                </div>
              </div>
              <section className="space-y-2">
                <h3 className="text-sm font-semibold">Recipient</h3>
                <div className="rounded-md border bg-background p-3 text-sm text-muted-foreground">
                  {order.address.name || "No name information"}
                </div>
              </section>
              <section className="space-y-2">
                <h3 className="text-sm font-semibold">Address</h3>
                <div className="rounded-md border bg-background p-3 text-sm text-muted-foreground">
                  {formatAddress(order) || "No address information"}
                </div>
              </section>
              <section className="space-y-2">
                <h3 className="text-sm font-semibold">Phone Number</h3>
                <div className="rounded-md border bg-background p-3 text-sm text-muted-foreground">
                  {order.address.phone || "No phone information"}
                </div>
              </section>

              {/*  Order Items */}
              <section className="space-y-3">
                <h3 className="text-sm font-semibold">
                  Order Items ({getOrderItemCount(order.items)})
                </h3>
                {order.items.length === 0 ? (
                  <div className="rounded-md border bg-background p-4 text-sm text-muted-foreground">
                    No items found for this order.
                  </div>
                ) : (
                  <div className="space-y-3 bg-background">
                    {order.items.map((item, index) => (
                      <article
                        key={`${item.orderId}-${index}`}
                        className="rounded-md border p-3"
                      >
                        <div className="flex gap-3">
                          <div className="size-20 shrink-0 overflow-hidden rounded-md border">
                            <ProductImage
                              src={item.image ?? "/no-image-light.webp"}
                              alt={item.name}
                              roundedSize="md"
                            />
                          </div>
                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="line-clamp-2 font-medium">
                              {item.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {formatPriceCents(item.priceCents)} x{" "}
                              {item.quantity}
                            </div>
                            <div className="text-sm font-medium">
                              Line Total:{" "}
                              {formatPriceCents(
                                item.priceCents * item.quantity,
                              )}
                            </div>
                            {isRecord(item.attributes) &&
                            Object.keys(item.attributes).length > 0 ? (
                              <div className="pt-1 text-xs text-muted-foreground">
                                {Object.entries(item.attributes).map(
                                  ([key, value]) => (
                                    <div key={key}>
                                      {key}: {String(value)}
                                    </div>
                                  ),
                                )}
                              </div>
                            ) : null}
                          </div>
                        </div>

                        {item.cardMessages.length > 0 ? (
                          <div className="mt-3 space-y-2 border-t pt-3">
                            <div className="text-xs font-medium text-muted-foreground">
                              Card Messages
                            </div>
                            {item.cardMessages.map((message, messageIndex) => (
                              <div
                                key={messageIndex}
                                className="rounded-md bg-background p-2 text-xs text-muted-foreground"
                              >
                                #{messageIndex + 1}: {message || "(empty)"}
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </article>
                    ))}
                  </div>
                )}
              </section>

              <section className="grid grid-cols-2 gap-3">
                <div className="rounded-md border bg-background p-3">
                  <div className="text-xs text-muted-foreground">Subtotal</div>
                  <div className="mt-1 text-sm font-medium">
                    {formatPriceCents(order.subtotalCents)}
                  </div>
                </div>
                <div className="rounded-md border bg-background p-3">
                  <div className="text-xs text-muted-foreground">Shipping</div>
                  <div className="mt-1 text-sm font-medium">
                    {formatPriceCents(order.shippingCents)}
                  </div>
                </div>
                <div className="rounded-md border bg-background p-3">
                  <div className="text-xs text-muted-foreground">Discount</div>
                  <div className="mt-1 text-sm font-medium">
                    {formatPriceCents(order.discountCents)}
                  </div>
                </div>

                <div className="rounded-md border bg-background p-3">
                  <div className="text-xs text-muted-foreground">
                    Pass On Fee
                  </div>
                  <div className="mt-1 text-sm font-medium">
                    {formatPriceCents(order.passOnFee)}
                  </div>
                </div>
                <div className="rounded-md border bg-background p-3">
                  <div className="text-xs text-muted-foreground">
                    Expires At
                  </div>
                  <div className="mt-1 text-sm font-medium">
                    {formatDate(order.expiresAt)}
                  </div>
                </div>
              </section>

              {/* Shipment Section */}
              <section className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Truck className="size-4" />
                    Lalamove Shipment
                  </h3>
                  {shipment && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => refetchShipment()}
                        disabled={isFetchingShipment}
                        className="size-8"
                      >
                        <RotateCw
                          className={cn(
                            "size-3.5",
                            isFetchingShipment && "animate-spin",
                          )}
                        />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="rounded-lg border bg-background overflow-hidden shadow-sm">
                  {isLoadingShipment ? (
                    <div className="flex flex-col items-center justify-center py-10 text-sm text-muted-foreground">
                      <Spinner className="mb-2 size-6" />
                      Retrieving shipment details...
                    </div>
                  ) : shipment ? (
                    <div className="divide-y">
                      {/* Status Header */}
                      <div className="p-4 bg-accent/5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1.5">
                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                              Current Status
                            </div>
                            <div
                              className={cn(
                                "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border shadow-sm",
                                shipmentStatus?.className,
                              )}
                            >
                              {shipmentStatus && (
                                <shipmentStatus.icon className="size-3.5" />
                              )}
                              {shipmentStatus?.label}
                            </div>
                          </div>

                          {(shipment.shipmentStatus === "ASSIGNING_DRIVER" ||
                            shipment.shipmentStatus === "ON_GOING") && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => cancelShipment()}
                              disabled={isCancelling || isPollingCancellation}
                              className="h-9 shadow-sm"
                            >
                              {isCancelling ? (
                                <Spinner className="size-3.5" />
                              ) : (
                                <XCircle className="size-3.5" />
                              )}
                              {isPollingCancellation
                                ? "Cancelling..."
                                : "Cancel Booking"}
                            </Button>
                          )}

                          {(shipment.shipmentStatus === "CANCELLED" ||
                            shipment.shipmentStatus === "REJECTED" ||
                            shipment.shipmentStatus === "EXPIRED") && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => shipOrder()}
                              disabled={isShipping}
                              className="h-9 shadow-sm font-bold"
                            >
                              {isShipping ? (
                                <Spinner className="size-3.5" />
                              ) : (
                                <RotateCw className="size-3.5" />
                              )}
                              Rebook Lalamove
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Cancellation Details */}
                      {shipment.shipmentStatus === "CANCELLED" &&
                        (shipment.cancelParty || shipment.cancelReason) && (
                          <div className="p-4 bg-background border-b border-rose-100 space-y-2">
                            <div className="flex items-center gap-2 text-rose-800">
                              <AlertCircle className="size-4" />
                              <span className="text-[10px] font-bold uppercase tracking-wider">
                                Cancellation Details
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              {shipment.cancelParty && (
                                <div className="space-y-1">
                                  <div className="text-[10px] font-bold text-rose-900/60 uppercase">
                                    Cancelled By
                                  </div>
                                  <div className="text-xs font-medium text-rose-900">
                                    {shipment.cancelParty}
                                  </div>
                                </div>
                              )}
                              {shipment.cancelReason && (
                                <div className="space-y-1">
                                  <div className="text-[10px] font-bold text-rose-900/60 uppercase">
                                    Reason
                                  </div>
                                  <div className="text-xs font-medium text-rose-900">
                                    {shipment.cancelReason}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                      {/* Shipment Info Grid */}
                      <div className="p-4 grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <div className="text-[10px] font-bold text-muted-foreground uppercase">
                            Lalamove ID
                          </div>
                          <div className="text-xs font-mono font-medium truncate">
                            {shipment.lalamoveOrderId || "N/A"}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-[10px] font-bold text-muted-foreground uppercase">
                            Cost
                          </div>
                          <div className="text-xs font-semibold text-primary">
                            {shipment.totalCents !== null
                              ? formatPriceCents(shipment.totalCents)
                              : "TBD"}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-[10px] font-bold text-muted-foreground uppercase">
                            Created At
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatDate(shipment.createdAt)}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-[10px] font-bold text-muted-foreground uppercase">
                            Scheduled
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {shipment.scheduleAt
                              ? formatDate(shipment.scheduleAt)
                              : "Immediate"}
                          </div>
                        </div>
                      </div>

                      {/* Driver Section */}
                      {shipment.driverName ? (
                        <div className="p-4 space-y-3">
                          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                            Driver
                          </div>
                          <div className="flex items-center gap-4 p-3 rounded-md border bg-accent/5">
                            <div className="size-12 rounded-full border bg-muted overflow-hidden shrink-0 shadow-inner">
                              <ProgressiveImage
                                decoding="sync"
                                isEager={true}
                                src={
                                  shipment.driverImageUrl ||
                                  "/fallback-avatar.webp"
                                }
                                alt="Driver"
                              />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-sm">
                                {shipment.driverName}
                              </div>

                              <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                                <span>{shipment.driverPhone}</span>
                                {shipment.driverPlateNumber && (
                                  <>
                                    <span>•</span>
                                    <span className="font-mono px-1 rounded text-[10px]">
                                      {shipment.driverPlateNumber}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col gap-1.5">
                              {shipment.driverShareLink && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  asChild
                                  className="h-8 text-[10px] px-2.5"
                                >
                                  <a
                                    href={shipment.driverShareLink}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    <MapPin className="mr-1.5 size-3" />
                                    Live Location
                                  </a>
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : shipment.shipmentStatus === "ASSIGNING_DRIVER" ? (
                        <div className="p-6 text-center space-y-2">
                          <Spinner className="mx-auto size-5 text-primary opacity-50" />
                          <p className="text-xs text-muted-foreground font-medium">
                            Waiting for a driver to accept the booking...
                          </p>
                        </div>
                      ) : null}

                      {/* Tracking and Link */}
                      {shipment.shareLink && (
                        <div className="p-4 flex items-center justify-between gap-4">
                          <div className="text-xs font-medium text-muted-foreground">
                            Customer Tracking Link
                          </div>
                          <Button
                            variant="link"
                            size="sm"
                            asChild
                            className="h-auto p-0 text-xs font-bold"
                          >
                            <a
                              href={shipment.shareLink}
                              target="_blank"
                              rel="noreferrer"
                            >
                              View on Lalamove{" "}
                              <ExternalLink className="ml-1.5 size-3" />
                            </a>
                          </Button>
                        </div>
                      )}

                      {/* POD Section */}
                      {(shipment.PODStatus || shipment.PODImageUrl) && (
                        <div className="p-4 space-y-3">
                          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                            Delivery Evidence (POD)
                          </div>
                          <div className="rounded-md border p-3 space-y-4 bg-accent/5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold">
                                Status
                              </span>
                              <span
                                className={cn(
                                  "text-[10px] px-2 py-0.5 rounded-sm font-bold uppercase border",
                                  (
                                    POD_STATUS_MAP[
                                      shipment.PODStatus as string
                                    ] || POD_STATUS_MAP.PENDING
                                  ).className,
                                )}
                              >
                                {
                                  (
                                    POD_STATUS_MAP[
                                      shipment.PODStatus as string
                                    ] || POD_STATUS_MAP.PENDING
                                  ).label
                                }
                              </span>
                            </div>

                            {shipment.PODImageUrl && (
                              <div className="space-y-2">
                                <span className="text-xs font-semibold">
                                  Photo Confirmation
                                </span>
                                <div className="group relative aspect-video overflow-hidden rounded-md border-2 border-background shadow-sm">
                                  <img
                                    src={shipment.PODImageUrl}
                                    alt="Proof of Delivery"
                                    className="size-full object-cover transition-transform group-hover:scale-105"
                                  />
                                  <a
                                    href={shipment.PODImageUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="absolute bottom-2 right-2 p-2 bg-background/90 rounded-lg shadow-lg backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <ExternalLink className="size-4" />
                                  </a>
                                </div>
                              </div>
                            )}

                            {shipment.PODDeliveredAt && (
                              <div className="flex items-center justify-between pt-1 text-[10px] text-muted-foreground border-t border-dashed">
                                <span>Time of Delivery</span>
                                <span className="font-medium text-foreground">
                                  {formatDate(shipment.PODDeliveredAt)}
                                </span>
                              </div>
                            )}

                            {shipment.PODStatus === "FAILED" &&
                              shipment.PODFailedAt && (
                                <div className="flex items-center justify-between pt-1 text-[10px] text-rose-600 border-t border-dashed border-rose-200">
                                  <span>Time of Failure</span>
                                  <span className="font-medium">
                                    {formatDate(shipment.PODFailedAt)}
                                  </span>
                                </div>
                              )}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-8 text-center space-y-4">
                      {order.status === "toPay" ? (
                        <div className="flex flex-col items-center gap-3 py-2">
                          <div className="size-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                            <Clock className="size-6" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-bold text-amber-900">
                              Payment Pending
                            </p>
                            <p className="text-xs text-amber-700/80 max-w-60 mx-auto">
                              Shipment cannot be booked until the customer
                              completes their payment.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-5 py-2">
                          <div className="space-y-1.5">
                            <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto">
                              <Package className="size-6" />
                            </div>
                            <p className="text-sm font-bold">
                              No Active Shipment
                            </p>
                            <p className="text-xs text-muted-foreground max-w-[260px] mx-auto leading-relaxed">
                              This order is paid and ready for dispatch. Book a
                              Lalamove rider to begin delivery.
                            </p>
                          </div>
                          <Button
                            className="mx-auto h-11 shadow-md font-bold"
                            onClick={() => shipOrder()}
                            disabled={isShipping}
                          >
                            {isShipping ? <Spinner /> : <Truck />}
                            Book Lalamove
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </section>
            </div>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}
