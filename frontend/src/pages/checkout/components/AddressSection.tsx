import { motion } from "framer-motion";
import { MapPin, ChevronRight } from "lucide-react";
import { useDefaultAddressQuery } from "../hooks/useAddressQuery";
import { NavLink, useParams } from "react-router";
import { useCheckoutStore } from "../store/useCheckoutStore";
import { Skeleton } from "@/lib/ui/__shadcn__/skeleton";
import { useEffect } from "react";
import ErrorDialogue from "@/components/ErrorDialogue";

const AddressSection = () => {
  const address = useCheckoutStore((s) => s.address);
  const setAddress = useCheckoutStore((s) => s.setAddress);
  const { sessionId } = useParams();

  const {
    data: defaultAddress,
    error,
    isFetching,
    // Only fetch if there's no address in the store (i.e. user hasn't selected an address yet)
  } = useDefaultAddressQuery({ enabled: !address });

  useEffect(() => {
    if (!address && defaultAddress) setAddress(defaultAddress);
  }, [defaultAddress]);

  if (isFetching) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card rounded-xl py-6 px-5 shadow-sm border border-border/30"
      >
        <div className="mb-5 flex items-center gap-2">
          <MapPin className="size-5 text-primary" />
          <h2 className="font-semibold text-foreground">Delivery Address</h2>
        </div>

        <div className="mt-3 space-y-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-full" />
        </div>
      </motion.div>
    );
  }

  if (error)
    return (
      <ErrorDialogue
        msg={"Failed getting delivery address. please try again."}
      />
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-card rounded-xl p-5 shadow-sm border border-border/30"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <MapPin className="size-5 text-primary" />
          <h2 className="font-semibold text-foreground">Delivery Address</h2>
        </div>
        {address && (
          <NavLink
            className="flex-center text-primary hover:text-primary/90"
            to={`/checkout/${sessionId}/address-selection`}
            state={"editing"}
          >
            Edit <ChevronRight />
          </NavLink>
        )}
      </div>

      {!address ? (
        <div className="text-sm text-muted-foreground">
          No address yet.{" "}
          <NavLink
            className="text-link"
            to={`/checkout/${sessionId}/address-selection`}
            state={"selecting"}
          >
            Create one
          </NavLink>
        </div>
      ) : (
        <div className="space-y-1 text-sm">
          <p className="font-medium text-foreground">{address.fullName}</p>
          <p className="text-muted-foreground">{address.phoneNumber}</p>
          <p className="text-muted-foreground">{address.addressLine}</p>
          <p className="text-muted-foreground">
            {address.barangay}, {address.city}, {address.province}{" "}
            {address.postalCode}
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default AddressSection;
