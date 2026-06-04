import { useQuery } from "@tanstack/react-query";
import type { AddressData } from "@cozybud/schemas";
import { AddressAPI } from "@/api/address";

export const defaultAddressQK = "default-address";

export const getDefaultAddressQueryOptions = {
  queryKey: [defaultAddressQK],
  queryFn: AddressAPI.getDefaultAddress,
  meta: { persist: true }, // persist localStorage,
};

export const useDefaultAddressQuery = ({
  enabled,
}: { enabled?: boolean } = {}) => {
  return useQuery<AddressData | null>({
    ...getDefaultAddressQueryOptions,
    enabled,
  });
};

export const addressesQK = "all-addresses";

export const getAddressesQueryOptions = {
  queryKey: [addressesQK],
  queryFn: AddressAPI.getAddresses,
  meta: { persist: true }, // persist localStorage
};

export const useAddressesQuery = ({ enabled }: { enabled?: boolean } = {}) => {
  return useQuery<AddressData[]>({ ...getAddressesQueryOptions, enabled });
};
