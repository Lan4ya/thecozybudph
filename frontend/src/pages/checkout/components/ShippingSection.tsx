import { AdminAPI } from "@/api";
import { CheckoutShippingOptionSkeleton } from "@/lib/ui/skeletons/CheckoutShippingOptionSkeleton";
import { cn } from "@/lib/utils/cn";
import { capitalizeFirstLetter } from "@/lib/utils/format";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Truck, XCircle } from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router";

const SERVICE_TYPES = ["motorcycle", "sedan"] as const;

import type { AddressData } from "@cozybud/schemas";
import { useCheckoutStore } from "@/store/useCheckoutStore";

export const createShippingQuoteQK = (address: AddressData | null) => [
  "shipping-quote",
  address,
];

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

      return AdminAPI.createShipmentQuote({
        recipientAddressId: addressStore.id,
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

      <div className="text-sm space-y-3">
        {isFetching && <CheckoutShippingOptionSkeleton />}

        {!isFetching && error && (
          <div className="flex gap-3 border border-destructive/15 bg-destructive/5 rounded-xl p-4 text-sm max-w-xl">
            <div className="shrink-0 p-1 rounded-full text-destructive">
              <XCircle className="size-5" />
            </div>

            <div className="space-y-1">
              <h5 className="font-semibold text-destructive leading-none">
                Failed to retrieve shipping prices
              </h5>
              <p className="text-muted-foreground leading-relaxed">
                Make sure the address you're using is serviceable to Lalamove.
                See the full list of{" "}
                <Link
                  to="https://www.lalamove.com/en-ph/serviceable-areas"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-link"
                >
                  serviceable areas
                </Link>
                .
              </p>
            </div>
          </div>
        )}

        {!isFetching && !error && (
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

interface ShippingOptionProps {
  serviceType: string;
  price?: string | number;
  isSelected: boolean;
  onSelect?: () => void;
  disabled?: boolean;
}

const ShippingOption = ({
  serviceType,
  price,
  isSelected,
  onSelect,
  disabled = false,
}: ShippingOptionProps) => {
  const normalizedServiceType = serviceType.toLowerCase();

  return (
    <label
      className={cn(
        "flex items-start justify-between p-3 rounded-lg border transition-all",
        !disabled
          ? "cursor-pointer"
          : "cursor-not-allowed opacity-60 grayscale-[0.5]",
        isSelected && !disabled
          ? "border-primary bg-primary/5"
          : "border-border/40",
        !disabled && !isSelected && "hover:border-primary/50",
      )}
    >
      <div className="flex items-start gap-3">
        <input
          type="radio"
          name="shippingOption"
          value={normalizedServiceType}
          checked={isSelected}
          onChange={!disabled ? onSelect : undefined}
          disabled={disabled}
          className={cn(
            "mt-1 text-primary focus:ring-primary",
            disabled && "cursor-not-allowed",
          )}
        />

        <div>
          <p className="font-medium text-foreground">
            {capitalizeFirstLetter(normalizedServiceType)}
          </p>

          <p className="pl-px text-xs text-muted-foreground">
            {normalizedServiceType === "sedan" && "recommended for safety"}
          </p>
        </div>
      </div>

      {price !== undefined && !disabled && (
        <p className="font-semibold text-sm text-foreground">₱{price}</p>
      )}
    </label>
  );
};

export default ShippingSection;
