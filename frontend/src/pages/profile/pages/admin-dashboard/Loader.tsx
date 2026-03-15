import { supabase } from "@/lib/supabase/client";
import { redirect } from "react-router";

export const Loader = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw redirect("/auth/login");

  const isAdmin = user.app_metadata?.role === "admin";

  if (!isAdmin) throw redirect("/", { status: 403 });

  return null;
};

export default Loader;
