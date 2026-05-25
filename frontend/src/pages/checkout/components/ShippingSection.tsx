import { motion } from "framer-motion";
import { RotateCw, Truck } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { capitalizeFirstLetter } from "@/lib/utils/format";
import { useQuery } from "@tanstack/react-query";
import { useCheckoutStore } from "../store/useCheckoutStore";
import { CheckoutShippingOptionSkeleton } from "@/lib/ui/skeletons/CheckoutShippingOptionSkeleton";
import { useEffect } from "react";
import { ShipmentAPI } from "@/api";
import { Button } from "@/lib/ui/__shadcn__/button";
import { createShippingQuoteQK } from "../queryKeys";

const ShippingSection = () => {
  const addressStore = useCheckoutStore((s) => s.address);
  const setShipping = useCheckoutStore((s) => s.setShipping);
  const shipping = useCheckoutStore((s) => s.shipping);

  const {
    data: quotations,
    error,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: createShippingQuoteQK(addressStore),
    queryFn: () => {
      if (!addressStore) throw new Error("Missing address");

      return ShipmentAPI.createShippingQuote({
        recipientAddress: {
          addressLine: addressStore.addressLine,
          postalCode: addressStore.postalCode,
          region: addressStore.region,
          city: addressStore.city,
          province: addressStore.province ?? undefined,
          barangay: addressStore.barangay.toLowerCase().startsWith("barangay")
            ? addressStore.barangay
            : `Barangray ${addressStore.barangay}`,
        },
      });
    },
    meta: { persist: true },
    enabled: !!addressStore,
  });

  useEffect(() => {
    if (!quotations || quotations.length === 0) return;

    // if (!shipping) {
    const first = quotations[0];

    setShipping({
      fee: Number(first.priceBreakdown.total),
      serviceType: first.serviceType.toLowerCase(),
      quotationId: first.id,
    });
    // }
  }, [quotations, setShipping]);

  const handleSelect = (
    serviceType: string,
    shippingPrice: number,
    quotationId: string,
  ) => {
    setShipping({
      quotationId,
      fee: shippingPrice,
      serviceType: serviceType.toLowerCase(),
    });
  };

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
        {!isFetching && error && (
          <div className="text-destructive flex justify-baseline items-baseline gap-3 text-sm">
            Failed loading shipping options. Make sure you're using a valid
            address then try again.
            <Button size="icon-sm" onClick={() => refetch()}>
              <RotateCw onClick={() => refetch()} />
            </Button>
          </div>
        )}

        {isFetching && <CheckoutShippingOptionSkeleton />}

        {!isFetching &&
          quotations &&
          quotations.map((quote) => {
            const normalizedServiceType = quote.serviceType.toLowerCase();
            return (
              <label
                key={quote.id}
                className={cn(
                  "flex items-start justify-between p-3 rounded-lg border cursor-pointer transition-all",
                  shipping?.serviceType === normalizedServiceType
                    ? "border-primary bg-primary/5"
                    : "border-border/40 hover:border-primary/50",
                )}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="shippingOption"
                    value={normalizedServiceType}
                    checked={shipping?.serviceType === normalizedServiceType}
                    onChange={() =>
                      handleSelect(
                        normalizedServiceType,
                        Number(quote.priceBreakdown.total),
                        quote.id,
                      )
                    }
                    className="mt-1 text-primary focus:ring-primary"
                  />

                  <div>
                    <p className="font-medium text-foreground">
                      {capitalizeFirstLetter(normalizedServiceType)}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      Estimated around 4-7 business days
                    </p>
                  </div>
                </div>

                <p className="font-semibold text-sm text-foreground">
                  ₱{quote.priceBreakdown.total}
                </p>
              </label>
            );
          })}
      </div>
    </motion.div>
  );
};

export default ShippingSection;
