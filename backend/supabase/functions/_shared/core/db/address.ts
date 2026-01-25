import type { Tables } from "./supabase.types.ts";

export type AddressesRow = Tables<"addresses">;

export type CreateAddressDBInput = Omit<AddressesRow, "id" | "created_at">;

export type UpdateAddressDBInput = Partial<Omit<AddressesRow, "created_at">>;
