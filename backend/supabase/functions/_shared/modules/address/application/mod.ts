import { createAddress } from "./create-address.ts";
import { getAddresses } from "./get-addresses.ts";
import { updateAddress } from "./update-address.ts";
import { getDefaultAddress } from "./get-default-address.ts";

export const AddressActions = {
  getDefaultAddress,
  createAddress,
  getAddresses,
  updateAddress,
};
