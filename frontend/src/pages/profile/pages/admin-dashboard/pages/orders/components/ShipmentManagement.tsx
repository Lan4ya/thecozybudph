import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ShipmentAPI } from "@/api/shipment";
import { Button } from "@/lib/ui/__shadcn__/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/lib/ui/__shadcn__/card";
import { Input } from "@/lib/ui/__shadcn__/input";
import { Label } from "@/lib/ui/__shadcn__/label";
import {
  Truck,
  Package,
  AlertCircle,
  RefreshCw,
  Plus,
  XCircle,
  ExternalLink,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useAuthStore } from "@/store/useAuthStore";
import type { GetOrderItemRes } from "@cozybud/schemas";

type ShipmentManagementProps = {
  orderItem: GetOrderItemRes;
};

const ShipmentManagement = ({ orderItem }: ShipmentManagementProps) => {
  const queryClient = useQueryClient();
  const session = useAuthStore((state) => state.session);
  const isAdmin = session?.user?.app_metadata?.role === "admin";
  const [priorityFee, setPriorityFee] = useState("");

  const {
    data: shipmentDetails,
    isLoading: isLoadingDetails,
    refetch,
  } = useQuery({
    queryKey: ["shipment-details", orderItem.shipmentOrderId],
    queryFn: () => ShipmentAPI.getShippingOrder(orderItem.shipmentOrderId!),
    enabled: !!orderItem.shipmentOrderId,
  });

  const shipMutation = useMutation({
    mutationFn: () =>
      ShipmentAPI.shipOrder(orderItem.orderId, {
        sender: {
          address: {
            fullName: "CozyBud Admin",
            phoneNumber: "+639170000000",
            region: "NCR",
            city: "Mandaluyong",
            province: "Metro Manila",
            postalCode: "1550",
            barangay: "Barangka Ilaya",
            addressLine: "Edsa Corner Pioneer Street",
          },
        },
        recipient: {
          address: orderItem.address,
          remarks: "Handle with care",
        },
        serviceType: orderItem.serviceType,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order-item", orderItem.id] });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => ShipmentAPI.cancelShipOrder(orderItem.orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order-item", orderItem.id] });
    },
  });

  const addFeeMutation = useMutation({
    mutationFn: () =>
      ShipmentAPI.addPriorityFee({
        orderId: orderItem.shipmentOrderId!,
        fee: priorityFee,
      }),
    onSuccess: () => {
      setPriorityFee("");
      refetch();
    },
  });

  if (!orderItem.shipmentOrderId && !isAdmin) return null;

  const error =
    shipMutation.error || cancelMutation.error || addFeeMutation.error;

  return (
    <Card className="border-2 border-primary/10">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
          <Truck className="h-4 w-4 text-primary" />
          {isAdmin ? "Shipment Management" : "Shipment Tracking"}
        </CardTitle>
        <CardDescription className="text-xs">
          {isAdmin
            ? "Admin actions for order shipment."
            : "Track your order delivery status."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {orderItem.shipmentOrderId ? (
          <div className="space-y-4">
            <div className="rounded-lg bg-primary/5 p-4 border border-primary/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-muted-foreground uppercase">
                  Status
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => refetch()}
                  disabled={isLoadingDetails}
                >
                  <RefreshCw
                    className={cn(
                      "h-3 w-3",
                      isLoadingDetails && "animate-spin",
                    )}
                  />
                </Button>
              </div>
              {isLoadingDetails ? (
                <div className="h-5 w-24 bg-primary/10 animate-pulse rounded" />
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">
                      {String(shipmentDetails?.status || "Unknown")}
                    </span>
                  </div>

                  {shipmentDetails?.driverId && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <User className="h-3.5 w-3.5" />
                      Driver Assigned: {shipmentDetails.driverId}
                    </div>
                  )}

                  {shipmentDetails?.shareLink && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full h-8 text-[10px] uppercase font-bold tracking-wider"
                      asChild
                    >
                      <a
                        href={shipmentDetails.shareLink}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="mr-2 h-3 w-3" />
                        Track with Lalamove
                      </a>
                    </Button>
                  )}
                </div>
              )}
              <div className="mt-3 text-[10px] font-mono text-muted-foreground pt-2 border-t border-primary/5">
                Lalamove ID: {orderItem.shipmentOrderId}
              </div>
            </div>

            {isAdmin && (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label
                    htmlFor="priorityFee"
                    className="text-xs font-bold uppercase text-muted-foreground"
                  >
                    Add Priority Fee
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="priorityFee"
                      placeholder="e.g. 50"
                      value={priorityFee}
                      onChange={(e) => setPriorityFee(e.target.value)}
                      className="h-8 text-xs"
                    />
                    <Button
                      size="sm"
                      className="h-8 px-3"
                      disabled={!priorityFee || addFeeMutation.isPending}
                      onClick={() => addFeeMutation.mutate()}
                    >
                      {addFeeMutation.isPending ? (
                        <RefreshCw className="h-3 w-3 animate-spin" />
                      ) : (
                        <Plus className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex items-end">
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full h-8 text-xs font-bold"
                    onClick={() => {
                      if (
                        confirm(
                          "Are you sure you want to cancel this shipment?",
                        )
                      ) {
                        cancelMutation.mutate();
                      }
                    }}
                    disabled={cancelMutation.isPending}
                  >
                    {cancelMutation.isPending ? (
                      <RefreshCw className="h-3 w-3 animate-spin mr-2" />
                    ) : (
                      <XCircle className="h-3 w-3 mr-2" />
                    )}
                    Cancel Shipment
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          isAdmin && (
            <div className="flex flex-col items-center justify-center py-6 space-y-4 text-center">
              <Package className="h-10 w-10 text-muted-foreground/30" />
              <div className="space-y-1">
                <p className="text-sm font-medium">No active shipment</p>
                <p className="text-xs text-muted-foreground">
                  This order hasn't been booked for shipping yet.
                </p>
              </div>
              {(orderItem.status === "toShip" ||
                orderItem.status === "paid") && (
                <Button
                  className="w-full sm:w-auto px-8"
                  onClick={() => shipMutation.mutate()}
                  disabled={shipMutation.isPending}
                >
                  {shipMutation.isPending ? (
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Truck className="h-4 w-4 mr-2" />
                  )}
                  Book Shipment Now
                </Button>
              )}
            </div>
          )
        )}

        {isAdmin && error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
            <p className="text-xs text-destructive font-medium">
              {error instanceof Error ? error.message : String(error)}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ShipmentManagement;
