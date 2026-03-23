import { useCartStore } from "@/pages/cart/store/useCartStore";
import { useProductSelectionStore } from "@/pages/shop/store/useProductSelectionStore";
import { supabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/useAuthStore";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

// Initialize once in Root.tsx
export const useInitAuthStore = () => {
  const queryClient = useQueryClient();

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
      (event, session) => {
        if (!mounted) return;

        console.log("Auth state changed. Has session: ", !!session);

        const isExpiredSession =
          session?.expires_at && Date.now() > session.expires_at * 1000;

        useAuthStore.setState({
          session,
          status: session
            ? isExpiredSession
              ? "expired"
              : "authenticated"
            : "unauthenticated",
          event,
        });

        // Clear orphan confirm email flag on successful email confirmation.
        if (session?.user?.confirmed_at) {
          localStorage.removeItem("confirm-email");
        }

        // See when is this event is emitted: https://supabase.com/docs/reference/javascript/auth-onauthstatechange
        if (event === "SIGNED_OUT") {
          // Clear tanstack query cache
          queryClient.clear();

          // Clear stores
          useAuthStore.setState({
            session: null,
            status: "unauthenticated",
          });
          useProductSelectionStore.getState().reset([]);
          useCartStore.getState().reset();
        }
      },
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);
};
