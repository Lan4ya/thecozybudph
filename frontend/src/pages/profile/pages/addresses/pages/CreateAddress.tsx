import CreateAddressForm from "@/pages/checkout/pages/address-create/CreateAddressForm";
import { useNavigate } from "react-router";

const CreateAddress = () => {
  const navi = useNavigate();

  const handleSuccessSideEffect = () => {
    navi("/profile/addresses", { replace: true });
  };

  return <CreateAddressForm onSuccessSideEffect={handleSuccessSideEffect} />;
};

export default CreateAddress;
