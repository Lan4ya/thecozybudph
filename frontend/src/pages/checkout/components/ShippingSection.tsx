import { motion } from "framer-motion";
import { Truck } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { capitalizeFirstLetter } from "@/lib/utils/format";
import { useQuery } from "@tanstack/react-query";
import { LalamoveAPI } from "@/api/lalamove";
import { useCheckoutStore } from "../store/useCheckoutStore";
import { CheckoutShippingOptionSkeleton } from "@/lib/ui/skeletons/CheckoutShippingOption";
import ErrorDialogue from "@/components/ErrorDialogue";
import { useEffect } from "react";

const ShippingSection = () => {
  const addressStore = useCheckoutStore((s) => s.address);
  const setShipping = useCheckoutStore((s) => s.setShipping);
  const shipping = useCheckoutStore((s) => s.shipping);

  const {
    data: quotations,
    error,
    isFetching,
  } = useQuery({
    queryKey: ["lalamove-quote", addressStore?.id] as const,
    queryFn: () => {
      if (!addressStore) throw new Error("Missing address");

      return LalamoveAPI.createQuotes({
        address: {
          addressLine: addressStore.addressLine,
          postalCode: addressStore.postalCode,
          region: addressStore.region,
          city: addressStore.city,
          barangay: addressStore.barangay,
        },
      });
    },
    meta: { persist: true },
    enabled: !!addressStore,
  });

  useEffect(() => {
    if (!quotations || quotations.length === 0) return;

    if (!shipping) {
      const first = quotations[0];

      setShipping({
        fee: Number(first.priceBreakdown.total),
        serviceType: first.serviceType,
      });
    }
  }, [quotations, shipping, setShipping]);

  const handleSelect = (serviceType: string, shippingPrice: number) => {
    setShipping({ fee: shippingPrice, serviceType });
  };

  if (error)
    return (
      <ErrorDialogue
        msg={"Failed getting shipping options. please try again."}
      />
    );

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
          <h2 className="font-semibold text-foreground">Shipping Option </h2>
        </div>
      </div>

      <div className="space-y-3">
        {isFetching ? (
          <CheckoutShippingOptionSkeleton />
        ) : (
          quotations &&
          quotations.map((quote) => {
            return (
              <label
                key={quote.id}
                className={cn(
                  "flex items-start justify-between p-3 rounded-lg border cursor-pointer transition-all",
                  shipping?.serviceType === quote.serviceType
                    ? "border-primary bg-primary/5"
                    : "border-border/40 hover:border-primary/50",
                )}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="shipping"
                    value={quote.serviceType}
                    checked={shipping?.serviceType === quote.serviceType}
                    onChange={() =>
                      handleSelect(
                        quote.serviceType,
                        Number(quote.priceBreakdown.total),
                      )
                    }
                    className="mt-1 text-primary focus:ring-primary"
                  />

                  <div>
                    <p className="font-medium text-foreground">
                      {capitalizeFirstLetter(quote.serviceType)}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      Estimated around 5-7 business days
                    </p>
                  </div>
                </div>

                <p className="font-semibold text-sm text-foreground">
                  ₱{quote.priceBreakdown.total}
                </p>
              </label>
            );
          })
        )}
      </div>
    </motion.div>
  );
};

export default ShippingSection;
