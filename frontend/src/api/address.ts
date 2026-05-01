import { apiClient } from "@/lib/axios/client";
import isDev from "@/lib/utils/isDev";
import {
  type Address,
  type CreateAddressInput,
  type UpdateAddressInput,
} from "@TheCozyBud/schemas";

export const AddressAPI = {
  createAddress: async (payload: CreateAddressInput): Promise<Address> => {
    return apiClient.post("/address", payload);
  },

  udpateAddress: async (
    payload: UpdateAddressInput,
    addressId: string,
  ): Promise<Address> => {
    return apiClient.patch(`/address/${addressId}`, payload);
  },

  // gets all the address the user has
  getAddresses: async (): Promise<Address[]> => {
    isDev && console.log("fetching addresses");
    return apiClient.get("/address");
  },

  getDefaultAddress: async (): Promise<Address | null> => {
    isDev && console.log("fetching default address");
    return apiClient.get("/address/default");
  },
};
