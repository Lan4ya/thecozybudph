import { defaultAddressQK } from "@/hooks/useAddressQuery";
import { EditAddressForm } from "./EditAddressForm";
import { useQueryClient } from "@tanstack/react-query";
import type { AddressData } from "@cozybud/schemas";
import { useNavigate } from "react-router";
import { useCheckoutStore } from "@/store/useCheckoutStore";

const EditAddress = () => {
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

  const handleOnGoBack = () => navi(route, { replace: true });

  return (
    <EditAddressForm
      onGoBack={handleOnGoBack}
      onSuccessSideEffect={(newAddress) => handleSuccessSideEffect(newAddress)}
    />
  );
};

export default EditAddress;
