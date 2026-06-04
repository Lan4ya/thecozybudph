import {
  type AddressData,
  type CreateAddressInput,
  type UpdateAddressInput,
} from "@cozybud/schemas";
import { client, unwrapData } from "./_client";
import isDev from "@/lib/utils/isDev";

export const AddressAPI = {
  createAddress: async (payload: CreateAddressInput): Promise<AddressData> => {
    const { data } = await client.address.POST("/address", {
      body: payload,
    });
    return unwrapData(data, "POST /address");
  },

  updateAddress: async (
    payload: UpdateAddressInput,
    addressId: string,
  ): Promise<AddressData> => {
    const { data } = await client.address.PATCH("/address/{id}", {
      params: { path: { id: addressId } },
      body: payload,
    });
    return unwrapData(data, "PATCH /address");
  },

  getAddresses: async (): Promise<AddressData[]> => {
    const { data } = await client.address.GET("/address");
    isDev && console.log("fetching addresses...");
    return unwrapData(data, "GET /address");
  },

  getDefaultAddress: async (): Promise<AddressData | null> => {
    const { data } = await client.address.GET("/address/default");
    return unwrapData(data, "GET /address/default");
  },
};
