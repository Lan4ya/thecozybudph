import { Button } from "@/lib/ui/__shadcn__/button";
import { ChevronRight } from "lucide-react";
import type { Address } from "@TheCozyBud/schemas";
import { Input } from "@/lib/ui/__shadcn__/input";
import AddressListSkeleton from "@/lib/ui/skeletons/AddressListSkeleton";
import { useAddressesQuery } from "@/pages/checkout/hooks/useAddressQuery";
import { useCheckoutStore } from "@/pages/checkout/store/useCheckoutStore";

const AddressList = ({
  onEdit,
  onSelect,
}: {
  onSelect: (address: Address) => void;
  onEdit: (address: Address) => void;
}) => {
  const {
    data: addresses,
    error: queryError,
    isFetching,
  } = useAddressesQuery();

  const checkoutAddress = useCheckoutStore((state) => state.address);

  if (isFetching) return <AddressListSkeleton />;

  if (queryError) throw queryError;

  if (!addresses || addresses.length === 0) {
    return (
      <div className="mt-40 text-center text-muted-foreground">
        No addresses found. Please create one.
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-5">
      {addresses.map((address) => (
        <li
          key={address.id}
          className="hover:shadow-md cursor-pointer bg-card rounded-xl p-5 shadow-sm border border-border/30"
          onClick={() => onSelect(address)}
        >
          <div className="flex gap-5">
            <div className="shrink-0">
              <Input
                readOnly
                type="radio"
                name="address"
                value={address.id}
                checked={checkoutAddress?.id === address.id}
                className="cursor-pointer "
              />
            </div>

            <div className="flex-1 flex justify-between mb-3">
              <div className="space-y-1 text-sm text-muted-foreground">
                <p className="line-clamp-2">{address.fullName}</p>
                <p className="">{address.phoneNumber}</p>
                <p className="text-muted-foreground">
                  {address.addressLine},{" "}
                  {address.barangay.toLowerCase().startsWith("barangay")
                    ? ""
                    : "Barangay"}{" "}
                  {address.barangay}, {address.city}, {address.province},{" "}
                  {address.region}, {address.postalCode}
                </p>
              </div>

              <Button
                onClick={(e) => {
                  onEdit(address);
                  e.stopPropagation();
                }}
                variant="minimal"
                size="sm"
                className="text-primary gap-1"
              >
                Edit <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default AddressList;
