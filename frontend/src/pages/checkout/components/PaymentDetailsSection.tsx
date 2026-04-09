import { motion } from "framer-motion";
import { formatPriceCents } from "@/lib/utils/format";
import { Separator } from "@/lib/ui/__shadcn__/separator"; // if you have one, else use border
import { useCheckoutStore } from "../store/useCheckoutStore";
import { calculatePassOnFee } from "../calculatePassOnFee";
import { useEffect } from "react";

const PaymentDetailsSection = () => {
  const orderItems = useCheckoutStore((s) => s.orderItems);
  const shipping = useCheckoutStore((s) => s.shipping);
  const payment = useCheckoutStore((s) => s.payment);
  const setPayment = useCheckoutStore((s) => s.setPayment);

  const shippingCents = (shipping?.fee ?? 0) * 100;
  const subtotalCents = orderItems.reduce(
    (sum, item) => sum + item.priceCents * item.quantity,
    0,
  );

  const passOnFeeCents = calculatePassOnFee(
    subtotalCents,
    payment?.type ?? "gcash",
  );

  const total = shippingCents + subtotalCents + passOnFeeCents;

  useEffect(() => {
    setPayment({
      total,
    });
  }, []);

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
          <span>{formatPriceCents(subtotalCents)}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-muted-foreground">Shipping Subtotal</span>
          <span>{formatPriceCents(shippingCents)}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-muted-foreground">Admin fee</span>
          <span>{formatPriceCents(passOnFeeCents)}</span>
        </div>

        <Separator />

        <div className="flex justify-between font-semibold text-foreground text-base pt-1">
          <span>Total Payment</span>
          <span className="text-primary">{formatPriceCents(total)}</span>
        </div>
      </div>
      <div className="mt-4 text-xs text-muted-foreground text-center lg:text-left">
        Taxes included. Shipping and discounts calculated at checkout.
      </div>
    </motion.div>
  );
};

export default PaymentDetailsSection;
