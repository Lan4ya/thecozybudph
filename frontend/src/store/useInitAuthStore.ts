import { supabase } from "@/lib/supabase/client";
import { useAuthStore, type AuthStatus } from "@/store/useAuthStore";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import isDev from "@/lib/utils/isDev";
import { useToast } from "@/providers/ToastProvider";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { useCartStore } from "./useCartStore";
import { useCheckoutStore } from "./useCheckoutStore";
import { useProductSelectionStore } from "./useProductSelectionStore";

// Initialized in Root.tsx
export const useInitAuthStore = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const setSession = useAuthStore((state) => state.setSession);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      useAuthStore.setState({
        session,
        status: session ? "authenticated" : "unauthenticated",
      });
    };
    init();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        if (!mounted) return;

        const isExpiredSession =
          session?.expires_at && Date.now() > session.expires_at * 1000;

        const status: AuthStatus = session
          ? isExpiredSession
            ? "expired"
            : "authenticated"
          : "unauthenticated";

        setSession(session, status, event);

        if (event === "SIGNED_IN") {
          const user = session?.user;
          const userName =
            user?.user_metadata?.display_name ??
            user?.user_metadata?.full_name ??
            user?.email?.split("@")[0];

          const isActiveLogin =
            sessionStorage.getItem("activeLogin") === "true";

          const signupAttempt = localStorage.getItem("signup_attempt");

          if (signupAttempt && user?.confirmed_at) {
            // New User Greeting
            addToast(`Welcome to CozyBud, ${userName}`);
            sessionStorage.removeItem("signup_attempt");
          }

          if (isActiveLogin) {
            // Login Greeting
            addToast(`Welcome back, ${userName}`);
            sessionStorage.removeItem("activeLogin");
          }
        }

        if (event === "SIGNED_OUT") {
          isDev && console.log("SIGNED_OUT: Clearing Caches and Stores...");

          // Clear tanstack query cache
          queryClient.clear();

          // Clear zustand stores
          useAuthStore.setState({
            session: null,
            status: "unauthenticated",
            event: null,
          });
          useProductSelectionStore.getState().reset([]);
          useCartStore.getState().reset();
          useCheckoutStore.getState().reset();
        }
      },
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [setSession, addToast, queryClient]);
};
