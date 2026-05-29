import { motion } from "framer-motion";
import { Truck } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useCheckoutStore } from "../store/useCheckoutStore";
import { CheckoutShippingOptionSkeleton } from "@/lib/ui/skeletons/CheckoutShippingOptionSkeleton";
import { useEffect } from "react";
import { ShipmentAPI } from "@/api";
import { createShippingQuoteQK } from "../queryKeys";
import { ShippingOption } from "./ShippingOption";

const SERVICE_TYPES = ["motorcycle", "sedan"] as const;

const ShippingSection = () => {
  const addressStore = useCheckoutStore((s) => s.address);
  const setShipping = useCheckoutStore((s) => s.setShipping);
  const shipping = useCheckoutStore((s) => s.shipping);

  const {
    data: quotations,
    error,
    isFetching,
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

    const first = quotations[0];

    setShipping({
      fee: Number(first.priceBreakdown.total),
      serviceType: first.serviceType.toLowerCase(),
      quotationId: first.id,
    });
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
          <h2 className="font-semibold text-foreground">
            Shipping Option{" "}
            <span className="text-muted-foreground text-sm">(Lalamove)</span>
          </h2>
        </div>
      </div>

      <div className="space-y-3">
        {!isFetching && error && (
          <div className="text-destructive text-sm">
            Failed loading shipping options. Make sure the address you're using
            is serviceable to Lalamove. See full list of{" "}
            <a
              href="https://www.lalamove.com/en-ph/serviceable-areas"
              target="_blank"
              rel="noopener noreferrer"
              className="text-link"
            >
              serviceable areas
            </a>
          </div>
        )}

        {isFetching && <CheckoutShippingOptionSkeleton />}

        {!isFetching && (
          <>
            {SERVICE_TYPES.map((type) => {
              const quote = quotations?.find(
                (q) => q.serviceType.toLowerCase() === type,
              );
              const isSelected = shipping?.serviceType === type;

              return (
                <ShippingOption
                  key={type}
                  serviceType={type}
                  isSelected={isSelected}
                  price={quote?.priceBreakdown.total}
                  disabled={!quote}
                  onSelect={
                    quote
                      ? () =>
                          handleSelect(
                            type,
                            Number(quote.priceBreakdown.total),
                            quote.id,
                          )
                      : undefined
                  }
                />
              );
            })}
          </>
        )}
      </div>
    </motion.div>
  );
};

export default ShippingSection;
