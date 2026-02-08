import {
  CreateAddressDBInput,
  UpdateAddressDBInput,
} from "@shared/types/index.ts";
import { SupabaseType } from "@shared/types.d.ts";
import { AppError } from "../../errors/Errors.ts";

const addressSelects =
  "id, address_line, barangay, city, full_name, phone_number, postal_code, profile_id, province, region";

export const AddressRepository = {
  insertAddress: async (
    supabase: SupabaseType,
    address: CreateAddressDBInput,
  ) => {
    const { data, error } = await supabase
      .from("addresses")
      .insert(address)
      .select(addressSelects)
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
      .select(addressSelects)
      .eq("id", id)
      .single();
    return { data, error };
  },

  getAddressByProfileId: async (supabase: SupabaseType, profileId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select(`addresses(${addressSelects})`) // Left Join
      .eq("id", profileId)
      .single();
    return { data, error };
  },

  assertAddressOwnership: async (
    supabase: SupabaseType,
    profileId: string,
    addressId: string,
  ) => {
    const { data, error } = await supabase
      .from("addresses")
      .select("id")
      .eq("id", addressId)
      .eq("profile_id", profileId)
      .maybeSingle();

    if (error) {
      throw AppError.internal(error.message);
    }

    if (!data) {
      throw AppError.forbidden(
        "Can't find Address or it does not belong to the user",
      );
    }

    return data;
  },
};
