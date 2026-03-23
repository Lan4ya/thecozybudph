import { supabase } from "@/lib/supabase/client";
import { redirect } from "react-router";

export const Loader = async () => {
  const {
    data: { user },
    // getUser() instead of getSession().
    // Getting user directly from server to avoid issues with stale, expired, or tampered client session
  } = await supabase.auth.getUser();

  if (!user) {
    throw redirect("/auth/login");
  }

  const isAdmin = user.app_metadata?.role === "admin";

  if (!isAdmin) {
    console.error(
      "Unauthorized access attempt to admin dashboard by non admin user: ",
      user.id,
    );
    throw redirect("/");
  }

  return null;
};

export default Loader;
