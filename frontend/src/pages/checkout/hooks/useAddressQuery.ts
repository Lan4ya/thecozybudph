import { useQuery } from "@tanstack/react-query";
import type { Address } from "@TheCozyBud/types";
import { AddressAPI } from "@/api/address";

export const checkouotDefaultAddressQK = "checkout-default-address";

export const getDefaultAddressQueryOptions = {
  queryKey: [checkouotDefaultAddressQK],
  queryFn: AddressAPI.getDefaultAddress,
  meta: { persist: true }, // persist localStorage,
};

export const checkoutAddressesQK = "checkout-addresses";

export const getAddressesQueryOptions = {
  queryKey: [checkoutAddressesQK],
  queryFn: AddressAPI.getAddresses,
  meta: { persist: true }, // persist localStorage
};

export const useDefaultAddressQuery = ({
  enabled,
}: { enabled?: boolean } = {}) => {
  return useQuery<Address | null>({
    ...getDefaultAddressQueryOptions,
    enabled,
  });
};

export const useAddressesQuery = ({ enabled }: { enabled?: boolean } = {}) => {
  return useQuery<Address[]>({ ...getAddressesQueryOptions, enabled });
};
