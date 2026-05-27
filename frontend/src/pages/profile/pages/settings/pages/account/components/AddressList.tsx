import { Button } from "@/lib/ui/__shadcn__/button";
import { ChevronRight } from "lucide-react";
import AddressListSkeleton from "@/lib/ui/skeletons/AddressListSkeleton";
import { useAddressesQuery } from "@/pages/checkout/hooks/useAddressQuery";
import { Link } from "react-router";

const AddressList = () => {
  const {
    data: addresses,
    error: queryError,
    isFetching,
  } = useAddressesQuery();

  if (isFetching) return <AddressListSkeleton />;

  if (queryError) throw queryError;

  if (!addresses || addresses.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        No addresses found. Please create one.
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-4">
      {addresses.map((address) => {
        const parts = [
          address.addressLine,
          address.barangay?.toLowerCase().startsWith("barangay")
            ? address.barangay
            : `Barangay ${address.barangay}`,
          address.city,
          address.province,
          address.region,
          address.postalCode,
        ].filter(Boolean);

        return (
          <li
            key={address.id}
            className="bg-background rounded-xl p-5 border border-border/40 transition-shadow hover:shadow-sm"
          >
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm">{address.fullName}</p>
                  {address.isDefault && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      Default
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground space-y-0.5">
                  <p>{address.phoneNumber}</p>
                  <p className="leading-relaxed">{parts.join(", ")}</p>
                </div>
              </div>

              <Link to={`address/${address.id}/edit`}>
                <Button
                  variant="minimal"
                  size="sm"
                  className="text-primary hover:text-primary/80 h-auto p-0 gap-0.5"
                >
                  Edit <ChevronRight className="size-4" />
                </Button>
              </Link>
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default AddressList;
