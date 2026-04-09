import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/lib/ui/__shadcn__/button";
import { useNavigate } from "react-router";

const TopBar = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between py-2 border-b border-border/40"
    >
      <Button
        variant="minimal"
        size="auto"
        onClick={() => navigate(-1)}
        className="text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft />
      </Button>
      <h1 className="text-xl font-semibold text-foreground">Checkout</h1>
      <div className="w-10" /> {/* spacer for alignment */}
    </motion.div>
  );
};

export default TopBar;
