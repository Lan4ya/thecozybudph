import type { AdminOrderListItem } from "@cozybud/schemas";
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

type OrderDetailsDrawerProps = {
  order: AdminOrderListItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
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
  order,
  open,
  onOpenChange,
}: OrderDetailsDrawerProps) {
  if (!order) return null;

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="data-[vaul-drawer-direction=right]:h-full data-[vaul-drawer-direction=right]:w-full data-[vaul-drawer-direction=right]:max-w-none md:data-[vaul-drawer-direction=right]:w-[44rem] md:data-[vaul-drawer-direction=right]:max-w-[44rem]">
        <DrawerHeader className="border-b">
          <div className="flex items-center justify-between gap-4">
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

        <div className="space-y-6 overflow-y-auto p-4 md:p-6">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-md border bg-accent/10 p-3">
              <div className="text-xs text-muted-foreground">Status</div>
              <div className="mt-1">
                <StatusBadge status={order.status} />
              </div>
            </div>
            <div className="rounded-md border bg-accent/10 p-3">
              <div className="text-xs text-muted-foreground">Total</div>
              <div className="mt-1 text-lg font-semibold">
                {formatPriceCents(order.totalCents)}
              </div>
            </div>
            <div className="rounded-md border bg-accent/10 p-3">
              <div className="text-xs text-muted-foreground">Created</div>
              <div className="mt-1 text-sm">{formatDate(order.createdAt)}</div>
            </div>
            <div className="rounded-md border bg-accent/10 p-3">
              <div className="text-xs text-muted-foreground">Updated</div>
              <div className="mt-1 text-sm">{formatDate(order.updatedAt)}</div>
            </div>
          </div>

          <section className="space-y-2">
            <h3 className="text-sm font-semibold">Recipient</h3>
            <div className="rounded-md border bg-accent/10 p-3 text-sm text-muted-foreground">
              {order.address.name || "No name information"}
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-semibold">Address</h3>
            <div className="rounded-md border bg-accent/10 p-3 text-sm text-muted-foreground">
              {formatAddress(order) || "No address information"}
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-semibold">Phone Number</h3>
            <div className="rounded-md border bg-accent/10 p-3 text-sm text-muted-foreground">
              {order.address.phone || "No phone information"}
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold">
              Order Items ({getOrderItemCount(order.items)})
            </h3>
            {order.items.length === 0 ? (
              <div className="rounded-md border bg-accent/10 p-4 text-sm text-muted-foreground">
                No items found for this order.
              </div>
            ) : (
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <article
                    key={`${item.orderId}-${index}`}
                    className="rounded-md border p-3"
                  >
                    <div className="flex gap-3">
                      <div className="size-20 shrink-0 overflow-hidden rounded-md border">
                        <ProductImage
                          src={item.image ?? "/no-image-light.png"}
                          alt={item.name}
                          roundedSize="md"
                        />
                      </div>
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="line-clamp-2 font-medium">
                          {item.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatPriceCents(item.priceCents)} x {item.quantity}
                        </div>
                        <div className="text-sm font-medium">
                          Line Total:{" "}
                          {formatPriceCents(item.priceCents * item.quantity)}
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
                            className="rounded-md bg-accent/20 p-2 text-xs text-muted-foreground"
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
            <div className="rounded-md border bg-accent/10 p-3">
              <div className="text-xs text-muted-foreground">Subtotal</div>
              <div className="mt-1 text-sm font-medium">
                {formatPriceCents(order.subtotalCents)}
              </div>
            </div>
            <div className="rounded-md border bg-accent/10 p-3">
              <div className="text-xs text-muted-foreground">Shipping</div>
              <div className="mt-1 text-sm font-medium">
                {formatPriceCents(order.shippingCents)}
              </div>
            </div>
            <div className="rounded-md border bg-accent/10 p-3">
              <div className="text-xs text-muted-foreground">Discount</div>
              <div className="mt-1 text-sm font-medium">
                {formatPriceCents(order.discountCents)}
              </div>
            </div>

            <div className="rounded-md border bg-accent/10 p-3">
              <div className="text-xs text-muted-foreground">Pass On Fee</div>
              <div className="mt-1 text-sm font-medium">
                {formatPriceCents(order.passOnFee)}
              </div>
            </div>
            <div className="rounded-md border bg-accent/10 p-3">
              <div className="text-xs text-muted-foreground">Expires At</div>
              <div className="mt-1 text-sm font-medium">
                {formatDate(order.expiresAt)}
              </div>
            </div>
          </section>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
