import { useCartStore } from "@/pages/cart/store/useCartStore";
import { useProductSelectionStore } from "@/pages/shop/store/useProductSelectionStore";
import { supabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/useAuthStore";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useCheckoutStore } from "@/pages/checkout/store/useCheckoutStore";
import isDev from "@/lib/utils/isDev";

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

        console.log("Has auth session: ", !!session);

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
          isDev && console.log("SIGNED_OUT: Clearing caches and stores...");

          // Clear tanstack query cache
          queryClient.clear();

          // Clear zustand stores
          useAuthStore.setState({
            session: null,
            status: "unauthenticated",
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
  }, []);
};
