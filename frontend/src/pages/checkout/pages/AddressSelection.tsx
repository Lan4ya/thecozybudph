import { useLocation, useNavigate } from "react-router";
import { type Address } from "@TheCozyBud/types";
import { useState } from "react";
import CreateAddressForm from "./components/CreateAddressForm";
import EditAddressForm from "./components/EditAddressForm";
import { useCheckoutStore } from "../store/useCheckoutStore";
import BottomBar from "./components/BottomBar";
import AddressList from "./components/AddressList";

type State =
  | { type: "selecting" }
  | { type: "creating" }
  | { type: "editing"; address: Address | null };

const AddressSelection = () => {
  const locState = useLocation().state;
  const navigate = useNavigate();
  const setCheckoutAddress = useCheckoutStore((state) => state.setAddress);

  const [state, setState] = useState<State>(() => {
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
        <div className="sticky top-0 z-20 mb-6 flex-center border-b border-border/40 bg-background/90 pb-3 pt-8 backdrop-blur">
          <h1 className="text-xl font-semibold text-foreground">
            Address Selection
          </h1>
        </div>

        <AddressList onEdit={handleEdit} onSelect={handleSelect} />
      </div>

      <BottomBar onCreate={handleCreate} />
    </>
  );
};

export default AddressSelection;
