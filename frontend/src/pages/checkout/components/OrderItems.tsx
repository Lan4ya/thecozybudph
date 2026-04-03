// frontend/src/pages/checkout/OrderItemsSection.tsx
import { motion } from "framer-motion";
import { Package, ChevronRight } from "lucide-react";
import { Button } from "@/lib/ui/__shadcn__/button";
import { ProductImage } from "@/components/products/ProductImage";
import { formatPriceCents } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

// Mock order item type – replace with actual data from store/API
export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  primaryImageUrl: string;
  variantAttributes: Record<string, string>;
  quantity: number;
  priceCents: number;
  cardMessages?: string[];
}

// Mock data – replace with real cart/checkout data
const mockOrderItems: OrderItem[] = [
  {
    id: "1",
    productId: "prod_1",
    name: "Bridio M10Pro Wireless Headphones",
    primaryImageUrl: "https://via.placeholder.com/100",
    variantAttributes: { Color: "Black", Model: "M10 Pro" },
    quantity: 1,
    priceCents: 76400, // ₱764
    cardMessages: [],
  },
  {
    id: "2",
    productId: "prod_2",
    name: "Lenovo HT38 Bluetooth Earphone",
    primaryImageUrl: "https://via.placeholder.com/100",
    variantAttributes: { Color: "White" },
    quantity: 1,
    priceCents: 82700, // ₱827
  },
];

const OrderItems = () => {
  const subtotalCents = mockOrderItems.reduce(
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
      <div className="divide-y divide-border/30">
        {mockOrderItems.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 * idx }}
            className="p-4 flex items-center gap-4"
          >
            {/* Product Image */}
            <div className="shrink-0">
              <ProductImage
                src={item.primaryImageUrl}
                alt={item.name}
                className="size-20 rounded-md"
              />
            </div>

            {/* Product Details */}
            <div className="flex-1 min-w-0">
              <h3 className="line-clamp-2 text-sm">{item.name}</h3>

              {/* Variant Attributes */}
              {Object.keys(item.variantAttributes).length > 0 && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {Object.entries(item.variantAttributes).map(([key, val]) => (
                    <span
                      key={key}
                      className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full"
                    >
                      {key}: {val}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex justify-between items-center gap-2 mt-5">
                {/* Price */}
                <span className="text-sm font-semibold text-primary shrink-0">
                  {formatPriceCents(item.priceCents * item.quantity)}
                </span>

                {/* Quantity */}
                <span className="text-xs text-muted-foreground">
                  Qty: {item.quantity}
                </span>
              </div>

              {/* Card Messages (if any) */}
              {/* {item.cardMessages && item.cardMessages.length > 0 && ( */}
              {/*   <div className="mt-2 p-2 bg-muted/20 rounded-md"> */}
              {/*     <p className="text-xs font-medium text-muted-foreground mb-1"> */}
              {/*       Card Message: */}
              {/*     </p> */}
              {/*     {item.cardMessages.map((msg, i) => ( */}
              {/*       <p */}
              {/*         key={i} */}
              {/*         className="text-xs text-foreground/80 italic wrap-break-word" */}
              {/*       > */}
              {/*         “{msg}” */}
              {/*       </p> */}
              {/*     ))} */}
              {/*   </div> */}
              {/* )} */}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Subtotal Footer */}
      <div className="p-4 border-t border-border/30 flex justify-between items-center">
        <div className="flex-center gap-2">
          <span className="text-sm text-muted-foreground">Subtotal</span>
          <span className="text-xs text-muted-foreground border px-2 py-0.5 rounded-full">
            {mockOrderItems.length} item(s)
          </span>
        </div>
        <span className="font-semibold text-sm text-foreground">
          {formatPriceCents(subtotalCents)}
        </span>
      </div>
    </motion.div>
  );
};

export default OrderItems;
