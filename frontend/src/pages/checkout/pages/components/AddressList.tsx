import { Button } from "@/lib/ui/__shadcn__/button";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { useAddressesQuery } from "../../hooks/useAddressQuery";
import type { Address } from "@TheCozyBud/schemas";
import { Input } from "@/lib/ui/__shadcn__/input";

const AddressList = ({ onEdit }: { onEdit: (address: Address) => void }) => {
  const {
    data: addresses,
    error: queryError,
    isFetching,
  } = useAddressesQuery();

  if (isFetching) return <div>loading...</div>;

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
      {addresses.map((address, i) => (
        <motion.li
          key={address.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 * i + 1 }}
          className="bg-card rounded-xl p-5 shadow-sm border border-border/30"
        >
          <div className="flex gap-5">
            <div className="">
              <Input type="radio" />
            </div>

            <div className="flex-1 flex justify-between mb-3">
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>{address.fullName}</p>
                <p>{address.phoneNumber}</p>
                <p>{address.addressLine}</p>
                <p>
                  {address.barangay}, {address.city}, {address.province}{" "}
                  {address.postalCode}
                </p>
              </div>

              <Button
                onClick={() => onEdit(address)}
                variant="minimal"
                size="sm"
                className="text-primary gap-1"
              >
                Edit <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </motion.li>
      ))}
    </ul>
  );
};

export default AddressList;
