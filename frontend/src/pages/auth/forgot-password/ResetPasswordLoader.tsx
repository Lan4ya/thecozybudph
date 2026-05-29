import { supabase } from "@/lib/supabase/client";
import { redirect } from "react-router";

export const ResetPasswordLoader = async (): Promise<Response | null> => {
  return new Promise((resolve) => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      // Check if the event is PASSWORD_RECOVERY, which indicates the user has clicked the recovery link
      if (event === "PASSWORD_RECOVERY") {
        subscription.unsubscribe();
        clearTimeout(fallbackTimeout);
        resolve(null); // let the user proceed
      }
    });

    // If after 2 seconds and the event hasn't fired, it likely means the user
    // landed here without a valid recovery session (e.g. typed the path directly
    // from the search bar), so redirect them back to the start of the flow.
    const fallbackTimeout = setTimeout(() => {
      subscription.unsubscribe();
      resolve(redirect("/auth/forgot-password"));
    }, 2000);
  });
};

export default ResetPasswordLoader;
