// frontend/src/pages/checkout/OrderItemsSection.tsx
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Package } from "lucide-react";
import { ProductImage } from "@/components/products/ProductImage";
import { capitalizeFirstLetter, formatPriceCents } from "@/lib/utils/format";
// import type { OrderItem } from "@TheCozyBud/schemas";
import { useCheckoutStore, type OrderItemUI } from "../store/useCheckoutStore";
import { Button } from "@/lib/ui/__shadcn__/button";
import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { MetaBadge } from "@/components/MetaBadge";

const OrderSummary = () => {
  const orderItemsUI = useCheckoutStore((s) => s.orderItemsUI);

  const subtotalCents = orderItemsUI.reduce(
    (sum, item) => sum + item.priceCents * item.quantity,
    0,
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="bg-card rounded-xl shadow-sm border border-border/30 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center p-5 border-b border-border/30">
        <div className="flex items-center gap-2">
          <Package className="size-5 text-primary" />
          <h2 className="font-semibold text-foreground">Order Summary</h2>
        </div>
      </div>

      {/* Items List */}
      <OrderList orderItems={orderItemsUI} />

      {/* Subtotal Footer */}
      <div className="p-4 border-t border-border/30 flex justify-between items-center">
        <div className="flex-center gap-2">
          <span className="text-sm text-muted-foreground">Subtotal</span>
          <span className="text-xs text-muted-foreground border px-2 py-0.5 rounded-full">
            {orderItemsUI.length} item(s)
          </span>
        </div>
        <span className="font-semibold text-sm text-foreground">
          {formatPriceCents(subtotalCents)}
        </span>
      </div>
    </motion.div>
  );
};

const OrderList = ({ orderItems }: { orderItems: OrderItemUI[] }) => {
  const [expandedItemIds, setExpandedItemIds] = useState<Set<string>>(
    new Set(),
  );

  const toggleItemCardMessage = (id: string) => {
    setExpandedItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="divide-y divide-border/30">
      {orderItems.map((item, idx) => {
        const cardMessages = item.cardMessages.filter(
          (msg) => msg.trim() !== "",
        );
        const isExpanded = expandedItemIds.has(item.variantId);

        return (
          <div key={item.variantId} className="flex flex-col">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * idx }}
              className="p-4 flex items-center gap-4"
            >
              <div className="shrink-0">
                <ProductImage
                  src={item.imageUrl}
                  alt={item.name}
                  className="size-20 rounded-md"
                />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="capitalize line-clamp-2 text-sm">{item.name}</h3>

                {Object.keys(item.attributes).length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {Object.entries(item.attributes).map(([key, val]) => (
                      <MetaBadge key={key} label={key} value={val} />
                    ))}
                  </div>
                )}

                <div className="flex justify-between items-center gap-2 mt-5">
                  <span className="text-sm font-semibold text-primary shrink-0">
                    {formatPriceCents(item.priceCents * item.quantity)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Quantity: {item.quantity}
                  </span>
                </div>
              </div>
            </motion.div>

            <div className="pb-2 px-4">
              <Button
                variant="minimal"
                size="auto"
                className={cn(
                  "text-muted-foreground hover:text-foreground gap-1",
                  isExpanded && "text-foreground hover:text-foreground/90",
                )}
                onClick={() => toggleItemCardMessage(item.variantId)}
              >
                View card message(s)
                <ChevronDown
                  className={`size-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                />
              </Button>
            </div>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  key={item.variantId}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ ease: "easeOut", duration: 0.2 }}
                  className="px-4 pb-4 overflow-hidden"
                >
                  {cardMessages.length ? (
                    <div className="p-2 space-y-1 bg-sidebar rounded-md">
                      {cardMessages.map((msg, i) => (
                        <p
                          key={i}
                          className="text-sm text-foreground/80 italic wrap-break-word"
                        >
                          {i + 1}.) "{capitalizeFirstLetter(msg)}."
                        </p>
                      ))}
                    </div>
                  ) : (
                    <p className="px-2 text-sm text-muted-foreground">
                      No card message
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};

export default OrderSummary;
