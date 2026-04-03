import { motion } from "framer-motion";
import { formatPriceCents } from "@/lib/utils/format";
import { Separator } from "@/lib/ui/__shadcn__/separator"; // if you have one, else use border

// Mock data – replace with actual cart/order totals
const orderTotals = {
  merchandiseSubtotal: 77900, // ₱779
  productProtection: 4700, // ₱47
  shipping: 3600, // ₱36
  adminFee: 1600, // ₱16
  shippingDiscount: -3600, // -₱36
  voucherDiscount: -1500, // -₱15
};

const totalCents = Object.values(orderTotals).reduce(
  (sum, val) => sum + val,
  0,
);

const PaymentDetailsSection = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-card rounded-xl p-5 shadow-sm border border-border/30"
    >
      <h2 className="font-semibold text-foreground mb-4">Payment Details</h2>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Merchandise Subtotal</span>
          <span>{formatPriceCents(orderTotals.merchandiseSubtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">
            Product Protection Subtotal
          </span>
          <span>{formatPriceCents(orderTotals.productProtection)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Shipping Subtotal</span>
          <span>{formatPriceCents(orderTotals.shipping)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Admin fee</span>
          <span>{formatPriceCents(orderTotals.adminFee)}</span>
        </div>
        <div className="flex justify-between text-green-600">
          <span>Shipping Discount</span>
          <span>
            -{formatPriceCents(Math.abs(orderTotals.shippingDiscount))}
          </span>
        </div>
        <div className="flex justify-between text-green-600">
          <span>Voucher Discount</span>
          <span>
            -{formatPriceCents(Math.abs(orderTotals.voucherDiscount))}
          </span>
        </div>
        <Separator className="my-2 bg-border/50" />
        <div className="flex justify-between font-semibold text-foreground text-base pt-1">
          <span>Total Payment</span>
          <span>{formatPriceCents(totalCents)}</span>
        </div>
      </div>
      <div className="mt-4 text-xs text-muted-foreground text-center">
        Taxes included. Shipping and discounts calculated at checkout.
      </div>
    </motion.div>
  );
};

export default PaymentDetailsSection;
