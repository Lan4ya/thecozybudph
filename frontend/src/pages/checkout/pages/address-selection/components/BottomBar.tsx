import { Button } from "@/lib/ui/__shadcn__/button";
import { useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import type { Address } from "@cozybud/schemas";
import { checkoutAddressesQK } from "@/pages/checkout/hooks/useAddressQuery";

const BottomBar = ({ onCreate }: { onCreate: () => void }) => {
  const qc = useQueryClient();
  const addresses = (qc.getQueryData([checkoutAddressesQK]) as Address[]) ?? [];

  return (
    <div className="flex-center fixed inset-x-0 bottom-0 z-30 md:hidden md:static border-t border-border/60 bg-background/90 px-4 py-4 backdrop-blur">
      <Button
        type="submit"
        disabled={addresses.length >= 10}
        onClick={onCreate}
        className="h-12 w-full rounded-xl"
      >
        <Plus /> Add address
      </Button>
    </div>
  );
};

export default BottomBar;
