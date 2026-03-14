import { create } from "zustand";
import { supabase } from "@/lib/supabase/client";
import type { Session } from "@supabase/supabase-js";
import isDev from "@/lib/utils/isDev";

type AuthState = {
  session: Session | null;
  isAdmin: boolean;
  loading: boolean;
  setSession: (session: Session | null) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  isAdmin: false,
  loading: true,
  setSession: (session) =>
    set({
      session,
      isAdmin: session?.user?.app_metadata?.role === "admin",
    }),
}));

// Initialize once in Root.tsx
export const initAuthStore = () => {
  const { setSession } = useAuthStore.getState();
  let mounted = true;

  // Fetch session once
  const init = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    isDev && console.log("hasSession: ", !!session);
    // console.log({ user: session?.user });

    if (!mounted) return;
    setSession(session ?? null);
    useAuthStore.setState({ loading: false });
  };

  init();

  // Listen to auth state changes
  const { data: listener } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      if (!mounted) return;
      setSession(session ?? null);

      // Clean up confirm-email from localStorage once the user has verified their email.
      // This is added afterlsign up.
      if (session?.user?.confirmed_at) {
        localStorage.removeItem("confirm-email");
      }
    },
  );

  return () => {
    mounted = false;
    listener.subscription.unsubscribe();
  };
};
