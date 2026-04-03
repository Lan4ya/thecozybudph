import { motion } from "framer-motion";
import { Button } from "@/lib/ui/__shadcn__/button";
import { formatPriceCents } from "@/lib/utils/format";
import { useNavigate } from "react-router";

// Reuse total from PaymentDetails or compute via store
const totalCents = 82700; // ₱827 example

const BottomBar = () => {
  const navigate = useNavigate();

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
      className="fixed bottom-0 left-0 w-full bg-card border-t border-border/40 py-4 px-6 flex items-center justify-between z-50"
    >
      <div className="text-sm">
        <span className="text-muted-foreground">Total:</span>
        <span className="ml-2 font-bold text-foreground">
          {formatPriceCents(totalCents)}
        </span>
      </div>
      <Button onClick={handlePlaceOrder} className="px-8 font-semibold">
        Place Order
      </Button>
    </motion.div>
  );
};

export default BottomBar;
