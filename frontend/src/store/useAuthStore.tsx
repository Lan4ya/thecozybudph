import { create } from "zustand";
import { supabase } from "@/lib/supabase/client";
import type { Session } from "@supabase/supabase-js";

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

    // console.log({ session });
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
    },
  );

  return () => {
    mounted = false;
    listener.subscription.unsubscribe();
  };
};
