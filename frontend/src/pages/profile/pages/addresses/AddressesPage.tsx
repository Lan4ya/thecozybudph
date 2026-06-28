import { Button } from "@/lib/ui/__shadcn__/button";
import { Plus } from "lucide-react";
import { Link } from "react-router";
import { useAddressesQuery } from "@/hooks/useAddressQuery";
import { RouteLoaderFlowerSpinner } from "@/components/RouteLoaderSpinner";

export default function AddressesPage() {
  const {
    data: addresses,
    error: queryError,
    isFetching,
  } = useAddressesQuery();

  if (isFetching) return <RouteLoaderFlowerSpinner />;

  if (queryError) throw queryError;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 md:px-6 lg:px-8">
      <div className="flex gap-4 justify-between">
        <h1 className="text-header">My Addresses</h1>

        <Link to="add">
          <Button className="rounded-xl">
            <Plus /> Add Address
          </Button>
        </Link>
      </div>

      {!addresses || addresses.length === 0 ? (
        <div className="mt-40 text-center text-muted-foreground">
          No address found. Click "Add adress" to create one.
        </div>
      ) : (
        <div className="bg-card rounded-xl border p-5 md:p-6 shadow-sm">
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
                  <Link
                    to={`${address.id}/edit`}
                    className="flex justify-between items-start gap-4"
                  >
                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">
                          {address.fullName}
                        </p>
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
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
