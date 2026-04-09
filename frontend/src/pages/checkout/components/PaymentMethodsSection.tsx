import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CreditCard, ChevronRight } from "lucide-react";
import { Button } from "@/lib/ui/__shadcn__/button";
import { cn } from "@/lib/utils/cn";
import { useCheckoutStore } from "../store/useCheckoutStore";
import { useAuthStore } from "@/store/useAuthStore";

type PaymentMethod = {
  id: string;
  name: string;
  icon?: string;
  description?: string;
  badge?: string;
};

const paymentMethods: PaymentMethod[] = [
  {
    id: "gcash",
    name: "GCash",
    // icon: "📱",
    description: "Scan QR or pay via app",
  },
  // {
  //   id: "bpi",
  //   name: "BPI",
  //   badge: "Activate",
  //   // description: "₱100 off on top of vouchers",
  // },
];

const PaymentMethodsSection = () => {
  const [selectedId, setSelectedId] = useState(paymentMethods[0].id);
  const setPayment = useCheckoutStore((s) => s.setPayment);
  const session = useAuthStore((s) => s.session);
  // const payment = useCheckoutStore((s) => s.payment);

  const email = session?.user?.email;
  // TODO: prefer users name in DB after api for that is available
  const userName = session?.user?.user_metadata?.name ?? email?.split("@")[0];

  useEffect(() => {
    const p = useCheckoutStore.getState().payment;

    if (!p)
      setPayment({
        billing: {
          name: userName || "",
          email: email || "",
        },
        type: "gcash",
      });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-card rounded-xl p-5 shadow-sm border border-border/30"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CreditCard className="size-5 text-primary" />
          <h2 className="font-semibold text-foreground">Payment Method</h2>
        </div>
        {/* <Button variant="minimal" size="sm" className="text-primary gap-1"> */}
        {/*   View All <ChevronRight className="size-4" /> */}
        {/* </Button> */}
      </div>

      <div className="space-y-3">
        {paymentMethods.map((method) => (
          <label
            key={method.id}
            className={cn(
              "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all",
              selectedId === method.id
                ? "border-primary bg-primary/5"
                : "border-border/40 hover:border-primary/50",
            )}
            onClick={() => setSelectedId(method.id)}
          >
            <div className="flex items-center gap-3">
              <input
                type="radio"
                name="payment"
                value={method.id}
                checked={selectedId === method.id}
                onChange={() => setSelectedId(method.id)}
                className="text-primary focus:ring-primary"
              />
              <div>
                <div className="flex items-center gap-2">
                  {method.icon && (
                    <span className="text-lg">{method.icon}</span>
                  )}
                  <span className="font-medium text-foreground">
                    {method.name}
                  </span>
                  {method.badge && (
                    <span className="text-xs text-primary font-semibold bg-primary/10 px-2 py-0.5 rounded-full">
                      {method.badge}
                    </span>
                  )}
                </div>
                {method.description && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {method.description}
                  </p>
                )}
              </div>
            </div>
          </label>
        ))}
      </div>
    </motion.div>
  );
};

export default PaymentMethodsSection;
