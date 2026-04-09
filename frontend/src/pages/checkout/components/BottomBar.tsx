import { motion } from "framer-motion";
import { Button } from "@/lib/ui/__shadcn__/button";
import { formatPriceCents } from "@/lib/utils/format";
import { useNavigate } from "react-router";
import { useCheckoutStore } from "../store/useCheckoutStore";

const BottomBar = () => {
  const navigate = useNavigate();
  const total = useCheckoutStore((s) => s.payment)?.total;

  const handlePlaceOrder = () => {
    // TODO: integrate with checkout API and payment flow
    console.log("Placing order...");
    // navigate to success or payment redirect
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="fixed bottom-0 left-0 w-full bg-card border-t border-border/40  z-50"
    >
      <div className=" py-4 px-6 flex items-center justify-between max-w-7xl mx-auto">
        <div className="text-sm">
          <span className="text-muted-foreground">Total:</span>
          <span className="text-primary ml-2 font-bold text-foreground">
            {total && formatPriceCents(total)}
          </span>
        </div>
        <Button onClick={handlePlaceOrder} className="px-8 font-semibold">
          Place Order
        </Button>
      </div>
    </motion.div>
  );
};

export default BottomBar;
