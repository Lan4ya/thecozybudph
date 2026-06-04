import { motion } from "framer-motion";
import { formatPriceCents } from "@/lib/utils/format";
import { Separator } from "@/lib/ui/__shadcn__/separator"; // if you have one, else use border
import { calculatePassOnFee } from "../calculatePassOnFee";
import { useEffect } from "react";
import { HelpCircle } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/lib/ui/__shadcn__/popover";
import { useCheckoutStore } from "@/store/useCheckoutStore";

const PaymentDetailsSection = () => {
  const orderItems = useCheckoutStore((s) => s.orderItemsUI);
  const shipping = useCheckoutStore((s) => s.shipping);
  const payment = useCheckoutStore((s) => s.payment);
  const setPayment = useCheckoutStore((s) => s.setPayment);
  const shippingQuoteId = useCheckoutStore((s) => s.shipping?.quotationId);
  const addressId = useCheckoutStore((s) => s.address?.id);

  const shippingCents = Math.round((shipping?.fee ?? 0) * 100);
  const subtotalCents = orderItems.reduce(
    (sum, item) => sum + item.priceCents * item.quantity,
    0,
  );
  const discountCents = 0;
  const baseTotalCents = subtotalCents + shippingCents - discountCents;

  const passOnFeeCents = calculatePassOnFee(
    baseTotalCents,
    payment?.type ?? "gcash",
  );

  const total = baseTotalCents + passOnFeeCents;

  useEffect(() => setPayment({ total }), [total, setPayment]);

  if (!payment?.type || !shippingQuoteId || !addressId) return null;

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
          <div className="flex items-center gap-1 text-muted-foreground">
            <span>Admin fee</span>
            <Popover>
              <PopoverTrigger asChild>
                <button className="hover:text-foreground transition-colors cursor-help">
                  <HelpCircle className="size-3.5" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-4 text-xs">
                <h4 className="font-semibold mb-1">Admin Fee</h4>
                <p className="text-muted-foreground">
                  This fee is charged by PayMongo, our payment service provider,
                  calculated based on your chosen payment method.
                </p>
              </PopoverContent>
            </Popover>
          </div>
          <span>{formatPriceCents(passOnFeeCents)}</span>
        </div>

        <Separator />

        <div className="flex justify-between font-semibold text-foreground text-base pt-1">
          <span>Total Payment</span>
          <span className="text-primary">{formatPriceCents(total)}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default PaymentDetailsSection;
