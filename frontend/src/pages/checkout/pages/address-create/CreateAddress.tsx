import { defaultAddressQK } from "@/hooks/useAddressQuery";
import type { AddressData } from "@cozybud/schemas";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import CreateAddressForm from "./CreateAddressForm";
import { useCheckoutStore } from "@/store/useCheckoutStore";

const CreateAddress = () => {
  const sessId = useCheckoutStore((state) => state.checkout?.sessionId);
  const setAddress = useCheckoutStore((state) => state.setAddress);
  const queryClient = useQueryClient();
  const navi = useNavigate();

  const route = `/checkout/${sessId}/address/selection`;

  const handleSuccessSideEffect = (newAddress: AddressData) => {
    queryClient.invalidateQueries({ queryKey: [defaultAddressQK] });
    setAddress(newAddress);
    navi(route, { replace: true });
  };

  return <CreateAddressForm onSuccessSideEffect={handleSuccessSideEffect} />;
};

export default CreateAddress;
