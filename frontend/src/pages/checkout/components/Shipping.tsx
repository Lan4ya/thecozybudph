import { useState } from "react";
import { motion } from "framer-motion";
import { Truck, ChevronRight } from "lucide-react";
import { Button } from "@/lib/ui/__shadcn__/button";
import { cn } from "@/lib/utils/cn";
import { formatPriceCents } from "@/lib/utils/format";

type ShippingOption = {
  id: string;
  name: string;
  priceCents: number;
  estimatedDays: string;
  guarantee?: string;
};

const shippingOptions: ShippingOption[] = [
  {
    id: "standard",
    name: "Standard Local",
    priceCents: 3600, // ₱36 in cents
    estimatedDays: "3-5 business days",
    guarantee: "Get a ₱50 voucher if not attempted by 4 Apr 2026",
  },
  // Add more options like express, etc.
];

const ShippingSection = () => {
  const [selectedId, setSelectedId] = useState(shippingOptions[0].id);
  const selected = shippingOptions.find((opt) => opt.id === selectedId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-card rounded-xl p-5 shadow-sm border border-border/30"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Truck className="size-5 text-primary" />
          <h2 className="font-semibold text-foreground">Shipping Option</h2>
        </div>
        <Button variant="minimal" size="sm" className="text-primary gap-1">
          View All <ChevronRight className="size-4" />
        </Button>
      </div>

      <div className="space-y-3">
        {shippingOptions.map((option) => (
          <label
            key={option.id}
            className={cn(
              "flex items-start justify-between p-3 rounded-lg border cursor-pointer transition-all",
              selectedId === option.id
                ? "border-primary bg-primary/5"
                : "border-border/40 hover:border-primary/50",
            )}
            onClick={() => setSelectedId(option.id)}
          >
            <div className="flex items-start gap-3">
              <input
                type="radio"
                name="shipping"
                value={option.id}
                checked={selectedId === option.id}
                onChange={() => setSelectedId(option.id)}
                className="mt-1 text-primary focus:ring-primary"
              />
              <div>
                <p className="font-medium text-foreground">{option.name}</p>
                <p className="text-xs text-muted-foreground">
                  Guaranteed to get by {option.estimatedDays}
                </p>
                {option.guarantee && (
                  <p className="text-xs text-green-600 mt-1">
                    {option.guarantee}
                  </p>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-sm text-foreground">
                {formatPriceCents(option.priceCents)}
              </p>
              {option.priceCents === 0 && (
                <span className="text-xs text-green-600">Free</span>
              )}
            </div>
          </label>
        ))}
      </div>
    </motion.div>
  );
};

export default ShippingSection;
