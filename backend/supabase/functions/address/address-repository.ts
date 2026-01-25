import {
  CreateAddressDBInput,
  UpdateAddressDBInput,
} from "@shared/core/index.ts";
import { SupabaseType } from "@shared/types.d.ts";

export const AddressRepository = {
  createAddress: async (
    supabase: SupabaseType,
    address: CreateAddressDBInput,
  ) => {
    const { data, error } = await supabase
      .from("addresses")
      .insert(address)
      .select("*")
      .single();
    return { data, error };
  },

  updateAddress: async (
    supabase: SupabaseType,
    id: string,
    address: UpdateAddressDBInput,
  ) => {
    const { data, error } = await supabase
      .from("addresses")
      .update(address)
      .select("*")
      .eq("id", id)
      .single();
    return { data, error };
  },

  getAddressByProfileId: async (supabase: SupabaseType, profileId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("addresses(*)")
      .eq("id", profileId)
      .single();
    return { data, error };
  },
};
