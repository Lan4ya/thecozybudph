import { supabase } from "@/lib/supabase/client";
import { redirect, type LoaderFunctionArgs } from "react-router";

const AuthLoader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);

  // Skip redirect for forgot-password/* routes as it requires a temporary session from the recovery link
  if (url.pathname.includes("forgot-password")) {
    return null;
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    throw redirect("/");
  }

  return null;
};

export default AuthLoader;
