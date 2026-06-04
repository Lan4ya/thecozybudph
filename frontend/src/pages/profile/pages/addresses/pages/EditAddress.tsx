import { EditAddressForm } from "@/pages/checkout/pages/address-edit/EditAddressForm";
import { useCheckoutStore } from "@/pages/checkout/store/useCheckoutStore";
import type { AddressData } from "@cozybud/schemas";
import { useNavigate } from "react-router";

const EditAddress = () => {
  const setAddress = useCheckoutStore((state) => state.setAddress);
  const navi = useNavigate();

  const handleSuccessSideEffect = (newAddress: AddressData) => {
    setAddress(newAddress);
    navi("/profile/addresses", { replace: true });
  };

  return (
    <EditAddressForm
      onGoBack={() => null}
      onSuccessSideEffect={(newAddress) => handleSuccessSideEffect(newAddress)}
    />
  );
};

export default EditAddress;
