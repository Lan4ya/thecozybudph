import {
  type Address,
  type CreateAddressInput,
  type UpdateAddressInput,
} from "@cozybud/schemas";
import { client, unwrapData } from "./_client";

export const AddressAPI = {
  createAddress: async (payload: CreateAddressInput): Promise<Address> => {
    const { data } = await client.address.POST("/address", payload);
    return unwrapData(data, "GET /address");
  },

  updateAddress: async (
    payload: UpdateAddressInput,
    addressId: string,
  ): Promise<Address> => {
    const { data } = await client.address.PATCH("/address/{id}", {
      params: { path: { id: addressId } },
      body: payload,
    });
    return unwrapData(data, "PATCH /address");
  },

  getAddresses: async (): Promise<Address[]> => {
    const { data } = await client.address.GET("/address");
    return unwrapData(data, "GET /address");
  },

  getDefaultAddress: async (): Promise<Address | null> => {
    const { data } = await client.address.GET("/address/default");
    return unwrapData(data, "GET /address/default");
  },
};
