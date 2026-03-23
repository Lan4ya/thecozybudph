import { supabase } from "@/lib/supabase/client";
import { redirect } from "react-router";

const AuthLoader = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    throw redirect("/");
  }

  return null;
};

export default AuthLoader;
