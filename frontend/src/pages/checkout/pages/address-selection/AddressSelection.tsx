import { useLocation, useNavigate } from "react-router";
import { type Address } from "@cozybud/schemas";
import { useState } from "react";
import { useCheckoutStore } from "../../store/useCheckoutStore";
import { Button } from "@/lib/ui/__shadcn__/button";
import { Plus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { checkoutAddressesQK } from "../../hooks/useAddressQuery";
import AddressList from "./components/AddressList";
import CreateAddressForm from "./components/CreateAddressForm";
import EditAddressForm from "./components/EditAddressForm";

type PageState =
  | { type: "selecting" }
  | { type: "creating" }
  | { type: "editing"; address: Address | null };

const AddressSelection = () => {
  const locState = useLocation().state;
  const navigate = useNavigate();
  const setCheckoutAddress = useCheckoutStore((state) => state.setAddress);

  const qc = useQueryClient();
  const addresses = (qc.getQueryData([checkoutAddressesQK]) as Address[]) ?? [];

  const [state, setState] = useState<PageState>(() => {
    if (locState === "creating") return { type: "creating" };
    if (locState === "editing") return { type: "editing", address: null };
    return { type: "selecting" };
  });

  const handleSelect = (address: Address) => {
    setCheckoutAddress(address);
    navigate(-1);
  };

  const handleEdit = (address: Address) => {
    setState({ type: "editing", address });
  };

  const handleCreate = () => {
    setState({ type: "creating" });
  };

  const handleClose = () => {
    setState({ type: "selecting" });
  };

  if (state.type === "creating") {
    return <CreateAddressForm onCloseForm={handleClose} />;
  }

  if (state.type === "editing" && state.address) {
    return (
      <EditAddressForm
        onCloseForm={handleClose}
        updatingAddress={state.address}
      />
    );
  }

  // selecting
  return (
    <>
      <div className="max-w-7xl min-h-screen pb-25 overflow-y-auto custom-container">
        <div className="sticky top-0 z-20 mb-6 grid grid-cols-3 items-center border-b border-border/40 bg-background/90 pb-3 pt-8 backdrop-blur">
          <h1 className="col-span-3 md:col-start-2 md:col-span-1 text-center text-lg font-semibold text-foreground">
            Address Selection
          </h1>

          <Button
            type="submit"
            disabled={addresses.length >= 10}
            onClick={handleCreate}
            className="justify-self-end hidden md:inline-flex rounded-xl"
          >
            <Plus /> Add address
          </Button>
        </div>

        <AddressList onEdit={handleEdit} onSelect={handleSelect} />
      </div>

      <div className="custom-container flex-center fixed inset-x-0 bottom-0 z-30 md:hidden md:static py-2">
        <Button
          type="submit"
          disabled={addresses.length >= 10}
          onClick={handleCreate}
          className="h-10  w-full rounded-xl"
        >
          <Plus /> Add address
        </Button>
      </div>
    </>
  );
};

export default AddressSelection;
