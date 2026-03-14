import { supabase } from "@/lib/supabase/client";
import isDev from "@/lib/utils/isDev";
import { redirect } from "react-router";

export const AuthLoader = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    throw redirect(isDev ? "/" : "https://thecozybud.vercel.app/");
  } else {
    return null;
  }
};
