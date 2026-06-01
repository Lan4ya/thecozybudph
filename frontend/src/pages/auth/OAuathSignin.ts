import { supabase } from "@/lib/supabase/client";

const { VITE_APP_URL } = import.meta.env;

export const OAuathSignin = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: VITE_APP_URL,
    },
  });

  if (error) throw error;

  sessionStorage.setItem("activeLogin", "true");
  return { data };
};
