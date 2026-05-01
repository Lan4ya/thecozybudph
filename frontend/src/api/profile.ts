import { apiClient } from "@/lib/axios/client";

import type {
  Address,
  CreateAddressInput,
  UpdateAddressInput,
} from "@TheCozyBud/schemas";

export const ProfileAPI = {
  createAddress: async (payload: CreateAddressInput): Promise<Address> => {
    return apiClient.post("/address", payload);
  },

  udpateAdress: async (
    payload: UpdateAddressInput,
    addressId: string,
  ): Promise<Address> => {
    return apiClient.patch(`/address/${addressId}`, payload);
  },

  getAddress: async (): Promise<Address> => {
    return apiClient.post("/address");
  },
};

