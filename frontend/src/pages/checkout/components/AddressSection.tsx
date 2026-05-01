import { motion } from "framer-motion";
import { MapPin, ChevronRight } from "lucide-react";
import { useDefaultAddressQuery } from "../hooks/useAddressQuery";
import { NavLink, useParams } from "react-router";
import { useCheckoutStore } from "../store/useCheckoutStore";
import { Skeleton } from "@/lib/ui/__shadcn__/skeleton";
import { useEffect } from "react";
import ErrorDialogue from "@/components/ErrorDialogue";

const AddressSection = () => {
  const addressStore = useCheckoutStore((s) => s.address);
  const setAddress = useCheckoutStore((s) => s.setAddress);
  const { sessionId } = useParams();

  const {
    data: defaultAddress,
    error,
    isFetching,
    // Only fetch if there's no address in the store (i.e. on first load when user haven't selected an address yet)
  } = useDefaultAddressQuery({ enabled: !addressStore });

  useEffect(() => {
    if (!addressStore && defaultAddress) setAddress(defaultAddress);
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
        {addressStore && (
          <NavLink
            className="flex-center text-primary hover:text-primary/90"
            to={`/checkout/${sessionId}/address-selection`}
            state={"editing"}
          >
            Edit <ChevronRight />
          </NavLink>
        )}
      </div>

      {!addressStore ? (
        <div className="text-sm text-muted-foreground">
          No address yet. Please{" "}
          <NavLink
            className="text-link"
            to={`/checkout/${sessionId}/address-selection`}
            state={"selecting"}
          >
            create one
          </NavLink>
        </div>
      ) : (
        <div className="space-y-1 text-sm">
          <p className="font-medium text-foreground">{addressStore.fullName}</p>
          <p className="text-muted-foreground">{addressStore.phoneNumber}</p>
          <p className="text-muted-foreground">
            {addressStore.addressLine},{" "}
            {addressStore.barangay.toLowerCase().startsWith("baran")
              ? ""
              : "Barangay"}{" "}
            {addressStore.barangay}, {addressStore.city},{" "}
            {addressStore.province}, {addressStore.region},{" "}
            {addressStore.postalCode}
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default AddressSection;
