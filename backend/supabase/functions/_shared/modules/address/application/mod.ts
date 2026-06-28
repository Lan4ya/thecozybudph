import { createAddress } from "./create-address.ts";
import { getAddresses } from "./get-addresses.ts";
import { updateAddress } from "./update-address.ts";
import { getDefaultAddress } from "./get-default-address.ts";
import { deleteAddress } from "./delete-address.ts";

export const AddressActions = {
  getDefaultAddress,
  deleteAddress,
  createAddress,
  getAddresses,
  updateAddress,
};
