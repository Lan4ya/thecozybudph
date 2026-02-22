import type { Tables } from "./supabase.types.ts";

export type ProfileMetadataRow = Tables<"profiles">;

export type UpdateProfileDBInput = Omit<Partial<ProfileMetadataRow>, "id">;
