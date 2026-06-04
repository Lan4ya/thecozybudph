import { useNavigate } from "react-router";
import { Plus } from "lucide-react";
import type { AddressData } from "@cozybud/schemas";
import { Button } from "@/lib/ui/__shadcn__/button";
import { Input } from "@/lib/ui/__shadcn__/input";
import AddressListSkeleton from "@/lib/ui/skeletons/AddressListSkeleton";
import { useAddressesQuery } from "@/hooks/useAddressQuery";
import { useCheckoutStore } from "@/store/useCheckoutStore";

export default function AddressSelection() {
  const navigate = useNavigate();

  const {
    data: addresses = [],
    error: queryError,
    isFetching,
  } = useAddressesQuery();

  const checkoutAddress = useCheckoutStore((state) => state.address);
  const setCheckoutAddress = useCheckoutStore((state) => state.setAddress);

  if (isFetching) return <AddressListSkeleton />;
  if (queryError) throw queryError;

  const getCheckoutSessionId = (): string | undefined => {
    return useCheckoutStore.getState().checkout?.sessionId;
  };

  const handleSelect = (address: AddressData) => {
    setCheckoutAddress(address);
    navigate(-1);
  };

  const handleEdit = (address: AddressData) => {
    const id = getCheckoutSessionId();
    if (!id) return;
    navigate(`/checkout/${id}/address/${address.id}/edit`);
  };

  const handleCreate = () => {
    const id = getCheckoutSessionId();
    if (!id) return;
    navigate(`/checkout/${id}/address/create`);
  };

  const isAddDisabled = addresses.length >= 10;

  return (
    <>
      <div className="max-w-7xl space-y-12 lg:space-y-24 pb-32 pt-6 custom-container">
        {/* Header */}
        <div className="grid grid-cols-3 items-center border-b border-border/40 pb-3 pt-2 backdrop-blur">
          <h1 className="col-span-3 md:col-start-2 md:col-span-1 text-center text-header">
            Address Selection
          </h1>

          <Button
            type="button"
            disabled={isAddDisabled}
            onClick={handleCreate}
            className="rounded-2xl justify-self-end hidden md:inline-flex"
          >
            <Plus /> Add address
          </Button>
        </div>

        {/* Selection */}
        {addresses.length === 0 ? (
          <div className="mt-40 text-center text-muted-foreground">
            No address found. <br /> Click "Add address" to create one.
          </div>
        ) : (
          <ul className="flex flex-col gap-5">
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
                  className="hover:shadow-md cursor-pointer bg-card rounded-xl p-5 shadow-sm border border-border/30"
                  onClick={() => handleSelect(address)}
                >
                  <div className="flex gap-5">
                    <div className="shrink-0">
                      <Input
                        readOnly
                        type="radio"
                        name="address"
                        value={address.id}
                        checked={checkoutAddress?.id === address.id}
                        className="cursor-pointer"
                      />
                    </div>

                    <div className="flex-1 flex justify-between mb-3">
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p className="line-clamp-2 text-foreground font-medium">
                          {address.fullName}
                        </p>
                        <p>{address.phoneNumber}</p>
                        <p className="text-muted-foreground">
                          {parts.join(", ")}
                        </p>
                      </div>

                      <Button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(address);
                        }}
                        variant="minimal"
                        size="sm"
                        className="border rounded-full  hover:text-primary/90 text-primary gap-1 self-start"
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Mobile Bottom Bar */}
      <div className="custom-container fixed inset-x-0 bottom-0 z-30 flex items-center justify-center py-4 bg-background/90 backdrop-blur border-t border-border/40 md:hidden">
        <Button
          type="button"
          disabled={isAddDisabled}
          onClick={handleCreate}
          className="h-10 w-full rounded-xl"
        >
          <Plus /> Add address
        </Button>
      </div>
    </>
  );
}
