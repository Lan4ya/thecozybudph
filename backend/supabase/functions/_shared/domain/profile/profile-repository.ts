import type { SupabaseType } from "@shared/types.d.ts";
import type { UpdateProfileDBInput } from "@shared/types/index.ts";

export const ProfileRepository = {
  updateProfile: async (
    s: SupabaseType,
    updates: UpdateProfileDBInput,
    profileId: string,
  ) => {
    const { data, error } = await s
      .from("profiles")
      .update(updates)
      .select("*")
      .eq("id", profileId)
      .maybeSingle();
    return { data, error };
  },

  getProfileById: async (s: SupabaseType, profileId: string) => {
    const { data, error } = await s
      .from("profiles")
      .select("*")
      .eq("id", profileId)
      .maybeSingle();
    return { data, error };
  },
};
