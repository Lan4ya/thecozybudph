import { useLocation } from "react-router";
import { type Address } from "@TheCozyBud/schemas";
import { useState } from "react";
import CreateAddressForm from "./components/CreateAddressForm";
import EditAddressForm from "./components/EditAddressForm";
import AddressList from "./components/AddressList";
import { motion } from "framer-motion";
import BottomBar from "./components/BottomBar";

export type AddressSelectionStatus = "selecting" | "editing" | "creating";
const statuses = ["selecting", "editing", "creating"] as const;

const AddressSelection = () => {
  const locState = useLocation().state as AddressSelectionStatus;
  const initialStatus: AddressSelectionStatus = statuses.includes(locState)
    ? locState
    : "selecting";

  const [status, setStatus] = useState<AddressSelectionStatus>(initialStatus);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  return (
    <>
      {status === "selecting" && (
        <>
          <div className="max-w-7xl custom-container">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="sticky top-0 z-20 mb-6 flex-center border-b border-border/40 bg-background/90 pb-3 pt-8 backdrop-blur"
            >
              <h1 className="text-xl font-semibold text-foreground">
                Address Selection
              </h1>
            </motion.div>

            <AddressList
              onEdit={(address) => {
                setStatus("editing");
                setEditingAddress(address);
              }}
            />
          </div>

          <BottomBar onCreate={() => setStatus("creating")} />
        </>
      )}

      {status === "creating" && (
        <CreateAddressForm closeForm={() => setStatus("selecting")} />
      )}

      {status === "editing" && editingAddress !== null && (
        <EditAddressForm
          closeForm={() => setStatus("selecting")}
          address={editingAddress}
        />
      )}
    </>
  );
};

export default AddressSelection;
