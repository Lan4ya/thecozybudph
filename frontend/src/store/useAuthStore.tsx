import { create } from "zustand";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";

type AuthStatus = "loading" | "authenticated" | "unauthenticated" | "expired";

type AuthState = {
  status: AuthStatus;
  session: Session | null;
  event: AuthChangeEvent | null;
};

// useInitAuthStore hook will populate the states in this store accordingly once initialized in Root.tsx.
// This store can be used then throughout the app as the single source of truth for auth session and user role

// See: ../hooks/useInitAuthStore.ts

export const useAuthStore = create<AuthState>(() => ({
  status: "loading",
  session: null,
  event: null,
}));
