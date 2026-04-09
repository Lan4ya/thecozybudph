import { Button } from "@/lib/ui/__shadcn__/button";
import { useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { checkoutAddressesQK } from "../../hooks/useAddressQuery";
import type { Address } from "@TheCozyBud/types";

const BottomBar = ({ onCreate }: { onCreate: () => void }) => {
  const qc = useQueryClient();
  const addresses = (qc.getQueryData([checkoutAddressesQK]) as Address[]) ?? [];

  return (
    <div className="flex-center fixed inset-x-0 bottom-0 z-30 border-t border-border/60 bg-background/90 px-4 py-4 backdrop-blur md:px-6">
      <Button
        type="submit"
        disabled={addresses.length >= 10}
        onClick={onCreate}
        className="h-12 w-full rounded-2xl md:w-44"
      >
        <Plus /> Add address
      </Button>
    </div>
  );
};

export default BottomBar;
