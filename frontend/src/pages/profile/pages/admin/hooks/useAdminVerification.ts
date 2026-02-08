import { useSuspenseQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

export const useAdminVerification = (userId: string) => {
  return useSuspenseQuery({
    queryKey: ["admin-verification", userId],
    queryFn: async () => {
      console.log("checking user admin status");
      const { data: admin, error } = await supabase
        .from("admins")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) throw error;
      return !!admin;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
    meta: { persist: true },
  });
};
